import type {
	AdminAlert,
	AnalysisHistory,
	DocumentStatus,
	KPIData,
	PredictionResult,
	Vehicle,
	VehicleCategory,
	VehicleUsage,
} from "@/types";

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

export interface VehicleListFilters {
	immatriculation?: string;
	type_vehicule?: VehicleCategory | "";
	usage?: VehicleUsage | "";
	statut?: Vehicle["statut"] | "";
	risque?: Vehicle["niveau_risque"] | "";
	documents?: "" | "valides" | "expires";
	global?: string;
}

export interface CreateVehicleAnalysisPayload {
	immatriculation: string;
	type_vehicule: VehicleCategory;
	marque: string;
	annee_fabrication: number;
	usage: VehicleUsage;
	taxe_circulation_usd: number;
	taxe_stationnement_usd: number;
	penalites_usd: number;
	assurance: DocumentStatus;
	controle_technique: DocumentStatus;
	vignette: DocumentStatus;
	infractions: number;
	incidents: number;
}

export interface VehicleAnalysisResponse {
	analysis_id: string;
	created_at: string;
	vehicle: Vehicle;
	prediction: PredictionResult;
	history_entry: AnalysisHistory;
}

export interface DashboardResponse {
	kpis: KPIData;
	charts: {
		conformity_by_month: {
			mois: string;
			conforme: number;
			non_conforme: number;
			a_risque: number;
		}[];
		vehicles_by_type: {
			type: string;
			count: number;
			conformite: number;
		}[];
		vehicles_by_usage: {
			usage: string;
			count: number;
			pct: number;
		}[];
		risk_distribution: {
			niveau: string;
			count: number;
			color: string;
		}[];
		revenue_by_month: {
			mois: string;
			recettes: number;
			penalites: number;
		}[];
	};
	recent_vehicles: Vehicle[];
	alerts: AdminAlert[];
	updated_at: string;
}

export interface ReportTemplate {
	id: string;
	title: string;
	description: string;
	type: string;
	date: string;
}

export interface ReportsResponse {
	summary: {
		total_reports: number;
		monthly_reports: number;
		taux_conformite: number;
	};
	charts: Pick<
		DashboardResponse["charts"],
		"conformity_by_month" | "vehicles_by_type"
	>;
	templates: ReportTemplate[];
}

export interface AIPageResponse {
	history: AnalysisHistory[];
}
