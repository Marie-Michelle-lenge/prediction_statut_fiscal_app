import type { CreateVehicleAnalysisPayload } from "@/types/api";

const API_BASE_URL = "http://localhost:8001";

export interface DgiResponse {
  type_vehicule: string;
  marque: string;
  modele: string;
  statut_fiscal: "Conforme" | "Non conforme" | "A risque";
  probabilites: {
    "Non conforme": number;
    "Conforme": number;
    "A risque": number;
  };
}

export interface DgiPredictionRecord {
  type_vehicule: string;
  marque: string;
  modele: string;
  statut_fiscal: "Conforme" | "Non conforme" | "A risque";
  probabilites: {
    "Non conforme": number;
    "Conforme": number;
    "A risque": number;
  };
  date_analyse?: string;
}

export interface DgiPredictionListResponse {
  page: number;
  limit: number;
  total: number;
  results: DgiPredictionRecord[];
}

export const typeToApi: Record<string, string> = {
  berline: "Voiture",
  suv: "SUV",
  utilitaire: "Utilitaire",
  camion: "Camion",
  moto: "Moto",
  bus: "Bus",
};

export const statusToApi: Record<string, string> = {
  conforme: "conforme",
  non_conforme: "non conforme",
  a_risque: "a risque",
};

function mapToDgiPayload(payload: CreateVehicleAnalysisPayload) {
  const typeMapping: Record<string, string> = {
    "berline": "Voiture",
    "suv": "SUV",
    "utilitaire": "Utilitaire",
    "camion": "Camion",
    "moto": "Moto",
    "bus": "Bus",
  };

  const usageMapping: Record<string, string> = {
    "particulier": "Personnel",
    "commercial": "Commercial",
    "transport": "Transport",
    "agricole": "Agricole",
    "diplomatique": "Diplomatique",
    "gouvernemental": "Gouvernemental",
  };

  return {
    type_vehicule: typeMapping[payload.type_vehicule] || payload.type_vehicule,
    usage: usageMapping[payload.usage] || payload.usage,
    marque: payload.marque,
    modele: "Modèle standard",
    type: "Essence",
    genre: "Particulier",
    couleur: "Gris",
    assurance: payload.assurance === "valide" ? "Valide" : "Expiré",
    controle_technique:
      payload.controle_technique === "valide" ? "Valide" : "Expiré",
    vignette: payload.vignette === "valide" ? "Payée" : "Non payée",
    puissance: 120,
    annee_fabrication: payload.annee_fabrication,
    valeur_estimee_usd: 15000,
    taxe_circulation_usd: payload.taxe_circulation_usd,
    taxe_stationnement_usd: payload.taxe_stationnement_usd,
  };
}

export async function createDgiVehicleAnalysis(
  payload: CreateVehicleAnalysisPayload
): Promise<DgiResponse> {
  const dgiPayload = mapToDgiPayload(payload);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dgiPayload),
  });

  if (!response.ok) {
    throw new Error(
      `API DGI error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function listDgiPredictions(params: {
  page?: number;
  limit?: number;
  statut?: string;
  marque?: string;
  type_vehicule?: string;
  dateDebut?: string;
  dateFin?: string;
  untilToday?: boolean;
}): Promise<DgiPredictionListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.statut) searchParams.set("statut", params.statut);
  if (params.marque) searchParams.set("marque", params.marque);
  if (params.type_vehicule)
    searchParams.set("type_vehicule", params.type_vehicule);
  if (params.dateDebut) searchParams.set("date_debut", params.dateDebut);
  if (params.dateFin) searchParams.set("date_fin", params.dateFin);
  if (params.untilToday) searchParams.set("until_today", "true");

  const response = await fetch(
    `${API_BASE_URL}/predictions?${searchParams}`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(
      `API DGI error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export interface DashboardKpis {
  total_vehicules: number;
  vehicules_conformes: number;
  vehicules_non_conformes: number;
  vehicules_a_risque: number;
  taux_conformite: number;
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  vehicles_by_type: {
    type: string;
    conforme: number;
    non_conforme: number;
    a_risque: number;
  }[];
  latest_predictions: DgiPredictionRecord[];
}

export async function getDgiDashboardData(params?: {
  dateDebut?: string;
  dateFin?: string;
  untilToday?: boolean;
}): Promise<DashboardResponse> {
  const searchParams = new URLSearchParams();
  if (params?.dateDebut) searchParams.set("date_debut", params.dateDebut);
  if (params?.dateFin) searchParams.set("date_fin", params.dateFin);
  if (params?.untilToday) searchParams.set("until_today", "true");

  const url = `${API_BASE_URL}/dashboard${searchParams.toString() ? "?" + searchParams : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `API DGI error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
