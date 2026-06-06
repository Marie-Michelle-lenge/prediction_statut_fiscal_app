import argparse
import csv
import json
import os
import sqlite3
from datetime import datetime
from typing import Optional


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CSV_PATH = os.path.join(os.path.dirname(BASE_DIR), "dataset_DGI_ready.csv")
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "data", "predictions.sqlite3")

STATUSES = ["Non conforme", "Conforme", "A risque"]

TYPE_COLUMNS = {
    "type_vehicule_Camion": "Camion",
    "type_vehicule_Moto": "Moto",
    "type_vehicule_Taxi": "Taxi",
    "type_vehicule_Voiture": "Voiture",
}

USAGE_COLUMNS = {
    "usage_Non sp\u00e9cifi\u00e9": "Non sp\u00e9cifi\u00e9",
    "usage_Priv\u00e9": "Priv\u00e9",
    "usage_Transport public": "Transport public",
}

MARQUE_COLUMNS = {
    "marque_Isuzu": "Isuzu",
    "marque_Kia": "Kia",
    "marque_Mitsubishi": "Mitsubishi",
    "marque_Nissan": "Nissan",
    "marque_Suzuki": "Suzuki",
    "marque_Toyota": "Toyota",
    "marque_Volkswagen": "Volkswagen",
}


def parse_bool(value: Optional[str]) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "oui"}


def first_true(row: dict, mapping: dict[str, str], fallback: str) -> str:
    for column, label in mapping.items():
        if parse_bool(row.get(column)):
            return label
    return fallback


def normalize_status(value: str) -> str:
    normalized = value.strip().replace("_", " ").lower()
    if normalized == "non conforme":
        return "Non conforme"
    if normalized == "conforme":
        return "Conforme"
    if normalized in {"a risque", "\u00e0 risque"}:
        return "A risque"
    return value.strip()


def probabilities_for(status: str) -> dict[str, float]:
    return {label: 100.0 if label == status else 0.0 for label in STATUSES}


def to_int(value: Optional[str]) -> Optional[int]:
    if value is None or value == "":
        return None
    return int(float(value))


def to_float(value: Optional[str]) -> Optional[float]:
    if value is None or value == "":
        return None
    return float(value)


def init_db(connection: sqlite3.Connection) -> None:
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


def row_to_prediction(row: dict) -> tuple:
    statut_fiscal = normalize_status(row["statut_fiscal"])
    type_vehicule = first_true(row, TYPE_COLUMNS, row.get("type") or "Non sp\u00e9cifi\u00e9")
    usage = first_true(row, USAGE_COLUMNS, "Non sp\u00e9cifi\u00e9")
    marque = first_true(row, MARQUE_COLUMNS, "Non sp\u00e9cifi\u00e9")

    return (
        type_vehicule,
        usage,
        marque,
        row.get("modele") or "Non sp\u00e9cifi\u00e9",
        row.get("type"),
        row.get("genre"),
        row.get("couleur"),
        row.get("assurance"),
        row.get("controle_technique"),
        row.get("vignette"),
        to_int(row.get("puissance")),
        to_int(row.get("annee_fabrication")),
        to_float(row.get("valeur_estimee_usd")),
        to_float(row.get("taxe_circulation_usd")),
        to_float(row.get("taxe_stationnement_usd")),
        statut_fiscal,
        json.dumps(probabilities_for(statut_fiscal)),
        row.get("date_enregistrement") or row.get("date_analyse") or datetime.now().isoformat(),
    )


def import_csv(csv_path: str, db_path: str, replace: bool = False) -> int:
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    with sqlite3.connect(db_path) as connection:
        init_db(connection)

        if replace:
            connection.execute("DELETE FROM predictions")

        with open(csv_path, newline="", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            rows = [row_to_prediction(row) for row in reader]

        connection.executemany(
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
            rows,
        )
        connection.commit()

    return len(rows)


def dump_sql(db_path: str, output_path: str) -> None:
    with sqlite3.connect(db_path) as connection:
        with open(output_path, "w", encoding="utf-8") as file:
            for line in connection.iterdump():
                file.write(f"{line}\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import dataset_DGI_ready.csv into the API SQLite database."
    )
    parser.add_argument("--csv", default=DEFAULT_CSV_PATH, help="CSV file to import.")
    parser.add_argument("--db", default=DEFAULT_DB_PATH, help="SQLite database path.")
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete existing predictions before importing.",
    )
    parser.add_argument(
        "--dump-sql",
        help="Optional path for a SQLite-compatible .sql dump after import.",
    )
    args = parser.parse_args()

    imported = import_csv(args.csv, args.db, replace=args.replace)

    if args.dump_sql:
        dump_sql(args.db, args.dump_sql)

    print(f"Imported {imported} rows into {args.db}")
    if args.dump_sql:
        print(f"SQL dump written to {args.dump_sql}")


if __name__ == "__main__":
    main()
