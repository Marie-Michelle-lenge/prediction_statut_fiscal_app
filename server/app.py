from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import json
import sqlite3
from typing import Optional
import warnings
import sys
import os
from datetime import datetime, date

# Ignorer tous les avertissements
warnings.filterwarnings('ignore')

# ==========================================
# INITIALISATION API
# ==========================================

app = FastAPI(
    title="API DGI - Analyse Prédictive",
    description="API de prédiction du statut fiscal des véhicules",
    version="1.0"
)

# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# CHARGEMENT MODELE (différé)
# ==========================================

_model = None

def get_model():
    """Charger le modèle de manière différée"""
    global _model
    if _model is None:
        try:
            # Monkey patch pour _RemainderColsList avant de charger le modèle
            import sklearn.compose._column_transformer as ct_module
            if not hasattr(ct_module, '_RemainderColsList'):
                class _RemainderColsList(list):
                    pass
                ct_module._RemainderColsList = _RemainderColsList
            
            # Charger le modèle
            model_path = "model/modele_dgi_pipeline.pkl"
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Modèle non trouvé: {model_path}")
            
            _model = joblib.load(model_path)
            print("Modèle chargé avec succès")
        except Exception as e:
            print(f"Erreur lors du chargement du modèle: {e}")
            raise HTTPException(status_code=500, detail=f"Erreur modèle: {str(e)}")
    return _model

# ==========================================
# PERSISTANCE DES PREDICTIONS
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "predictions.sqlite3")


def get_db_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type_vehicule TEXT NOT NULL,
                usage TEXT,
                marque TEXT NOT NULL,
                modele TEXT NOT NULL,
                type TEXT,
                genre TEXT,
                couleur TEXT,
                assurance TEXT,
                controle_technique TEXT,
                vignette TEXT,
                puissance INTEGER,
                annee_fabrication INTEGER,
                valeur_estimee_usd REAL,
                taxe_circulation_usd REAL,
                taxe_stationnement_usd REAL,
                statut_fiscal TEXT NOT NULL,
                probabilites TEXT NOT NULL,
                date_analyse TEXT NOT NULL
            )
            """
        )
        connection.commit()


def row_to_prediction(row):
    return {
        "type_vehicule": row["type_vehicule"],
        "marque": row["marque"],
        "modele": row["modele"],
        "statut_fiscal": row["statut_fiscal"],
        "probabilites": json.loads(row["probabilites"]),
        "date_analyse": row["date_analyse"],
    }


def save_prediction(data: "VehicleData", result: dict):
    with get_db_connection() as connection:
        connection.execute(
            """
            INSERT INTO predictions (
                type_vehicule,
                usage,
                marque,
                modele,
                type,
                genre,
                couleur,
                assurance,
                controle_technique,
                vignette,
                puissance,
                annee_fabrication,
                valeur_estimee_usd,
                taxe_circulation_usd,
                taxe_stationnement_usd,
                statut_fiscal,
                probabilites,
                date_analyse
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.type_vehicule,
                data.usage,
                data.marque,
                data.modele,
                data.type,
                data.genre,
                data.couleur,
                data.assurance,
                data.controle_technique,
                data.vignette,
                data.puissance,
                data.annee_fabrication,
                data.valeur_estimee_usd,
                data.taxe_circulation_usd,
                data.taxe_stationnement_usd,
                result["statut_fiscal"],
                json.dumps(result["probabilites"]),
                result["date_analyse"],
            ),
        )
        connection.commit()


def load_predictions():
    with get_db_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM predictions ORDER BY id ASC"
        ).fetchall()
    return [row_to_prediction(row) for row in rows]

# ==========================================
# CLASSES
# ==========================================

classes = {
    0: "Non conforme",
    1: "Conforme",
    2: "A risque"
}

# ==========================================
# MODELE DE DONNEES
# ==========================================

class VehicleData(BaseModel):

    type_vehicule: str
    usage: str
    marque: str
    modele: str
    type: str
    genre: str
    couleur: str

    assurance: str
    controle_technique: str
    vignette: str

    puissance: int
    annee_fabrication: int

    valeur_estimee_usd: float
    taxe_circulation_usd: float
    taxe_stationnement_usd: float


init_db()


# ==========================================
# ENDPOINT ACCUEIL
# ==========================================

@app.get("/")
def home():
    return {
        "message": "API DGI active"
    }


# ==========================================
# ENDPOINT PREDICTION
# ==========================================

@app.post("/predict")
def predict(data: VehicleData):
    try:
        # Charger le modèle
        model = get_model()
        
        input_data = pd.DataFrame([{
            "type_vehicule": data.type_vehicule,
            "usage": data.usage,
            "marque": data.marque,
            "modele": data.modele,
            "type": data.type,
            "genre": data.genre,
            "couleur": data.couleur,

            "assurance": data.assurance,
            "controle_technique": data.controle_technique,
            "vignette": data.vignette,

            "puissance": data.puissance,
            "annee_fabrication": data.annee_fabrication,

            "valeur_estimee_usd": data.valeur_estimee_usd,
            "taxe_circulation_usd": data.taxe_circulation_usd,
            "taxe_stationnement_usd": data.taxe_stationnement_usd
        }])

        # Prediction
        prediction = model.predict(input_data)[0]

        # Probabilités
        probabilities = model.predict_proba(input_data)[0]

        result = {
            "type_vehicule": data.type_vehicule,
            "marque": data.marque,
            "modele": data.modele,

            "statut_fiscal": classes[prediction],

            "probabilites": {
                "Non conforme": round(probabilities[0] * 100, 2),
                "Conforme": round(probabilities[1] * 100, 2),
                "A risque": round(probabilities[2] * 100, 2)
            },

            "date_analyse": datetime.now().isoformat()
        }

        # Sauvegarde persistante SQLite
        save_prediction(data, result)

        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction: {str(e)}")


# ==========================================
# ENDPOINT LISTE DES PREDICTIONS
# ==========================================

@app.get("/predictions")
def get_predictions(

    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),

    statut: Optional[str] = None,
    marque: Optional[str] = None,
    type_vehicule: Optional[str] = None,
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
    until_today: bool = Query(False, description="Inclure toutes les donnees jusqu'a aujourd'hui"),

):

    data = load_predictions()

    # ======================================
    # FILTRES
    # ======================================

    if date_debut:
        try:
            d_start = datetime.fromisoformat(date_debut).date()
            data = [p for p in data if datetime.fromisoformat(p["date_analyse"]).date() >= d_start]
        except ValueError:
            pass

    if date_fin:
        try:
            d_end = datetime.fromisoformat(date_fin).date()
            data = [p for p in data if datetime.fromisoformat(p["date_analyse"]).date() <= d_end]
        except ValueError:
            pass

    if until_today:
        today = date.today()
        data = [p for p in data if datetime.fromisoformat(p["date_analyse"]).date() <= today]

    if statut:
        data = [
            item for item in data
            if item["statut_fiscal"].lower() == statut.lower()
        ]

    if marque:
        data = [
            item for item in data
            if item["marque"].lower() == marque.lower()
        ]

    if type_vehicule:
        data = [
            item for item in data
            if item["type_vehicule"].lower() == type_vehicule.lower()
        ]

    # ======================================
    # PAGINATION
    # ======================================

    start = (page - 1) * limit
    end = start + limit

    paginated_data = data[start:end]

    return {
        "page": page,
        "limit": limit,
        "total": len(data),
        "results": paginated_data
    }


# ==========================================
# ENDPOINT DASHBOARD
# ==========================================

@app.get("/dashboard")
def get_dashboard(
    date_debut: Optional[str] = Query(None, description="Début intervalle (YYYY-MM-DD)"),
    date_fin: Optional[str] = Query(None, description="Fin intervalle (YYYY-MM-DD)"),
    until_today: bool = Query(False, description="Inclure toutes les donnees jusqu'a aujourd'hui"),
):
    data = load_predictions()

    # ======================================
    # FILTRE PAR DATE
    # ======================================

    if date_debut:
        try:
            d_start = datetime.fromisoformat(date_debut).date()
            data = [p for p in data if datetime.fromisoformat(p["date_analyse"]).date() >= d_start]
        except ValueError:
            pass

    if date_fin:
        try:
            d_end = datetime.fromisoformat(date_fin).date()
            data = [p for p in data if datetime.fromisoformat(p["date_analyse"]).date() <= d_end]
        except ValueError:
            pass

    if until_today:
        today = date.today()
        data = [p for p in data if datetime.fromisoformat(p["date_analyse"]).date() <= today]

    total = len(data)
    conformes = sum(1 for p in data if p["statut_fiscal"] == "Conforme")
    non_conformes = sum(1 for p in data if p["statut_fiscal"] == "Non conforme")
    a_risque = sum(1 for p in data if p["statut_fiscal"] == "A risque")
    taux = round((conformes / total * 100) if total > 0 else 0, 1)

    type_counts: dict[str, dict[str, int]] = {}
    for p in data:
        t = p["type_vehicule"]
        if t not in type_counts:
            type_counts[t] = {"conforme": 0, "non_conforme": 0, "a_risque": 0}
        s = p["statut_fiscal"]
        if s == "Conforme":
            type_counts[t]["conforme"] += 1
        elif s == "Non conforme":
            type_counts[t]["non_conforme"] += 1
        else:
            type_counts[t]["a_risque"] += 1

    vehicles_by_type = [
        {
            "type": t,
            "conforme": c["conforme"],
            "non_conforme": c["non_conforme"],
            "a_risque": c["a_risque"],
        }
        for t, c in type_counts.items()
    ]

    latest = data[-8:] if total >= 8 else data[-total:] if total > 0 else []

    return {
        "kpis": {
            "total_vehicules": total,
            "vehicules_conformes": conformes,
            "vehicules_non_conformes": non_conformes,
            "vehicules_a_risque": a_risque,
            "taux_conformite": taux,
        },
        "vehicles_by_type": vehicles_by_type,
        "latest_predictions": list(reversed(latest)),
    }
