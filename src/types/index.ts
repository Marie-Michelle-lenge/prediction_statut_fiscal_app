export type ConformityStatus = "conforme" | "non_conforme" | "a_risque";

export type VehicleCategory =
	| "berline"
	| "suv"
	| "utilitaire"
	| "camion"
	| "moto"
	| "bus";

export type VehicleUsage =
	| "particulier"
	| "commercial"
	| "transport"
	| "agricole"
	| "diplomatique"
	| "gouvernemental";

export type Genre = "thermique" | "electrique" | "hybride";

export type RiskLevel = "faible" | "moyen" | "eleve" | "critique";

export type DocumentStatus = "valide" | "expire";

export interface Vehicle {
	id: string;
	immatriculation: string;
	proprietaire: string;
	type_vehicule: VehicleCategory;
	type_commercial: string;
	marque: string;
	modele: string;
	genre: Genre;
	couleur: string;
	usage: VehicleUsage;
	assurance: DocumentStatus;
	controle_technique: DocumentStatus;
	vignette: DocumentStatus;
	date_expiration_assurance: string;
	date_expiration_ct: string;
	puissance: number;
	annee_fabrication: number;
	valeur_estimee_usd: number;
	taxe_circulation_usd: number;
	taxe_stationnement_usd: number;
	penalites_usd: number;
	score_ia: number;
	statut: ConformityStatus;
	niveau_risque: RiskLevel;
	infractions: number;
	incidents: number;
	derniere_analyse: string;
	created_at: string;
}

export interface KPIData {
	total_vehicules: number;
	vehicules_conformes: number;
	vehicules_non_conformes: number;
	vehicules_a_risque: number;
	taux_conformite: number;
	revenu_total_usd: number;
	taxe_moyenne_usd: number;
}

export interface PredictionResult {
	statut: ConformityStatus;
	score_confiance: number;
	probabilites: {
		conforme: number;
		non_conforme: number;
		a_risque: number;
	};
	facteurs_influents: {
		facteur: string;
		impact: number;
		description: string;
	}[];
	recommandations: string[];
	niveau_risque: RiskLevel;
}

export interface AnalysisHistory {
	id: string;
	vehicule_id: string;
	immatriculation: string;
	date_analyse: string;
	resultat: ConformityStatus;
	score_ia: number;
	operateur: string;
	type_analyse: string;
}

export interface AdminAlert {
	id: string;
	type: "document_expire" | "anomalie" | "vehicule_critique" | "alerte_fiscale";
	titre: string;
	description: string;
	severite: RiskLevel;
	date: string;
	lu: boolean;
}
