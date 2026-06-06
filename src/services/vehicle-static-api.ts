import {
	conformityByMonth,
	mockAlerts,
	mockAnalysisHistory,
	mockVehicles,
	revenueByMonth,
	riskDistribution,
	vehiclesByType,
	vehiclesByUsage,
} from "@/data/mock";
import type {
	AIPageResponse,
	CreateVehicleAnalysisPayload,
	DashboardResponse,
	PaginatedResponse,
	ReportTemplate,
	ReportsResponse,
	VehicleAnalysisResponse,
	VehicleListFilters,
} from "@/types/api";
import type {
	AnalysisHistory,
	ConformityStatus,
	PredictionResult,
	RiskLevel,
	Vehicle,
} from "@/types";

const reportTemplates: ReportTemplate[] = [
	{
		id: "r1",
		title: "Rapport de conformité global",
		description: "Vue d'ensemble de la conformité de l'ensemble du parc",
		type: "Conformité",
		date: "2026-05-20",
	},
	{
		id: "r2",
		title: "Rapport fiscal détaillé",
		description: "Analyse des taxes, pénalités et retards de paiement",
		type: "Fiscal",
		date: "2026-05-18",
	},
	{
		id: "r3",
		title: "Rapport documents & assurances",
		description: "État des documents expirés et assurances invalides",
		type: "Documents",
		date: "2026-05-16",
	},
	{
		id: "r4",
		title: "Rapport analyse IA",
		description: "Synthèse des prédictions et scores de conformité",
		type: "IA",
		date: "2026-05-14",
	},
	{
		id: "r5",
		title: "Rapport véhicules à risque",
		description: "Liste et analyse des véhicules classés à risque ou critique",
		type: "Risque",
		date: "2026-05-12",
	},
	{
		id: "r6",
		title: "Rapport mensuel — Avril 2026",
		description: "Bilan mensuel de l'activité d'analyse et de contrôle",
		type: "Mensuel",
		date: "2026-04-30",
	},
];

const vehiclesDb: Vehicle[] = [...mockVehicles];
const analysisHistoryDb: AnalysisHistory[] = [...mockAnalysisHistory];

function randomFrom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function getRiskLevel(score: number): RiskLevel {
	if (score >= 75) return "faible";
	if (score >= 50) return "moyen";
	if (score >= 25) return "eleve";
	return "critique";
}

function getStatusFromScore(score: number): ConformityStatus {
	if (score >= 70) return "conforme";
	if (score >= 40) return "a_risque";
	return "non_conforme";
}

function simulatePrediction(
	payload: CreateVehicleAnalysisPayload,
): PredictionResult {
	const assuranceOk = payload.assurance === "valide";
	const ctOk = payload.controle_technique === "valide";
	const vignetteOk = payload.vignette === "valide";

	let score = 80;
	if (!assuranceOk) score -= 15;
	if (!ctOk) score -= 15;
	if (!vignetteOk) score -= 10;
	score -= payload.infractions * 5;
	score -= payload.incidents * 8;
	score -= Math.min(payload.penalites_usd / 200, 15);
	score = Math.max(5, Math.min(99, Math.round(score)));

	const statut = getStatusFromScore(score);
	const niveau_risque = getRiskLevel(score);
	const pConforme =
		score >= 70 ? 0.6 + (score - 70) * 0.013 : Math.max(0.02, score * 0.008);
	const pNonConforme =
		score < 40
			? 0.5 + (40 - score) * 0.012
			: Math.max(0.02, (100 - score) * 0.005);
	const pRisque = Math.max(0.02, 1 - pConforme - pNonConforme);

	const facteurs = [];
	if (!assuranceOk) {
		facteurs.push({
			facteur: "Assurance expirée",
			impact: 0.78,
			description: "Absence d'assurance valide — non-conformité réglementaire",
		});
	}
	if (!ctOk) {
		facteurs.push({
			facteur: "CT expiré",
			impact: 0.72,
			description: "Contrôle technique non à jour — risque sécuritaire",
		});
	}
	if (!vignetteOk) {
		facteurs.push({
			facteur: "Vignette expirée",
			impact: 0.6,
			description: "Vignette non acquittée — défaut de paiement",
		});
	}
	if (payload.infractions > 2) {
		facteurs.push({
			facteur: "Infractions multiples",
			impact: 0.65,
			description: `${payload.infractions} infractions enregistrées — historique défavorable`,
		});
	}
	if (payload.penalites_usd > 500) {
		facteurs.push({
			facteur: "Pénalités élevées",
			impact: 0.5,
			description: `${Math.round(payload.penalites_usd)} USD de pénalités — charge fiscale significative`,
		});
	}
	if (payload.incidents > 0) {
		facteurs.push({
			facteur: "Incidents signalés",
			impact: 0.55,
			description: `${payload.incidents} incidents — historique à risque`,
		});
	}
	if (facteurs.length === 0) {
		facteurs.push({
			facteur: "Profil conforme",
			impact: 0.1,
			description: "Aucune anomalie détectée — profil globalement conforme",
		});
	}

	const recommandations = [];
	if (!assuranceOk) {
		recommandations.push(
			"Renouveler l'assurance du véhicule avant toute mise en circulation",
		);
	}
	if (!ctOk) recommandations.push("Effectuer le contrôle technique obligatoire");
	if (!vignetteOk) recommandations.push("Procéder au paiement de la vignette");
	if (payload.infractions > 3) {
		recommandations.push(
			"Suivi renforcé recommandé — historique d'infractions élevé",
		);
	}
	if (payload.penalites_usd > 1000) {
		recommandations.push(
			"Contacter le service fiscal pour un plan de régularisation",
		);
	}
	if (recommandations.length === 0) {
		recommandations.push("Aucune action requise — véhicule conforme");
	}

	return {
		statut,
		score_confiance: Math.min(98, 70 + Math.abs(score - 50)),
		probabilites: {
			conforme: Math.round(pConforme * 100) / 100,
			non_conforme: Math.round(pNonConforme * 100) / 100,
			a_risque: Math.round(pRisque * 100) / 100,
		},
		facteurs_influents: facteurs,
		recommandations,
		niveau_risque,
	};
}

function buildKpis() {
	const total_vehicules = vehiclesDb.length;
	const vehicules_conformes = vehiclesDb.filter(
		(vehicle) => vehicle.statut === "conforme",
	).length;
	const vehicules_non_conformes = vehiclesDb.filter(
		(vehicle) => vehicle.statut === "non_conforme",
	).length;
	const vehicules_a_risque = vehiclesDb.filter(
		(vehicle) => vehicle.statut === "a_risque",
	).length;
	const revenu_total_usd = vehiclesDb.reduce(
		(total, vehicle) =>
			total +
			vehicle.taxe_circulation_usd +
			vehicle.taxe_stationnement_usd +
			vehicle.penalites_usd,
		0,
	);

	return {
		total_vehicules,
		vehicules_conformes,
		vehicules_non_conformes,
		vehicules_a_risque,
		taux_conformite:
			total_vehicules === 0 ? 0 : (vehicules_conformes / total_vehicules) * 100,
		revenu_total_usd,
		taxe_moyenne_usd:
			total_vehicules === 0 ? 0 : revenu_total_usd / total_vehicules,
	};
}

function applyVehicleFilters(
	data: Vehicle[],
	filters?: VehicleListFilters,
): Vehicle[] {
	if (!filters) return data;

	return data.filter((vehicle) => {
		if (
			filters.immatriculation &&
			!vehicle.immatriculation
				.toLowerCase()
				.includes(filters.immatriculation.toLowerCase())
		) {
			return false;
		}
		if (filters.type_vehicule && vehicle.type_vehicule !== filters.type_vehicule) {
			return false;
		}
		if (filters.usage && vehicle.usage !== filters.usage) {
			return false;
		}
		if (filters.statut && vehicle.statut !== filters.statut) {
			return false;
		}
		if (filters.risque && vehicle.niveau_risque !== filters.risque) {
			return false;
		}
		if (
			filters.documents === "valides" &&
			(vehicle.assurance !== "valide" ||
				vehicle.controle_technique !== "valide")
		) {
			return false;
		}
		if (
			filters.documents === "expires" &&
			vehicle.assurance !== "expire" &&
			vehicle.controle_technique !== "expire"
		) {
			return false;
		}
		if (filters.global) {
			const query = filters.global.toLowerCase();
			const matches =
				vehicle.immatriculation.toLowerCase().includes(query) ||
				vehicle.proprietaire.toLowerCase().includes(query) ||
				vehicle.marque.toLowerCase().includes(query) ||
				vehicle.modele.toLowerCase().includes(query);
			if (!matches) return false;
		}

		return true;
	});
}

export async function getDashboardData(): Promise<DashboardResponse> {
	const kpis = buildKpis();
	const recent_vehicles = [...vehiclesDb]
		.sort(
			(a, b) =>
				new Date(b.derniere_analyse).getTime() -
				new Date(a.derniere_analyse).getTime(),
		)
		.slice(0, 7);

	return {
		kpis,
		charts: {
			conformity_by_month: conformityByMonth,
			vehicles_by_type: vehiclesByType,
			vehicles_by_usage: vehiclesByUsage,
			risk_distribution: riskDistribution,
			revenue_by_month: revenueByMonth,
		},
		recent_vehicles,
		alerts: mockAlerts,
		updated_at: new Date().toISOString(),
	};
}

export async function listVehicleAnalyses({
	page = 1,
	limit = 250,
	filters,
}: {
	page?: number;
	limit?: number;
	filters?: VehicleListFilters;
} = {}): Promise<PaginatedResponse<Vehicle>> {
	const filtered = applyVehicleFilters(vehiclesDb, filters);
	const total = filtered.length;
	const total_pages = Math.max(1, Math.ceil(total / limit));
	const start = (page - 1) * limit;
	const end = start + limit;

	return {
		data: filtered.slice(start, end),
		meta: {
			page,
			limit,
			total,
			total_pages,
		},
	};
}

export async function getReportsData(): Promise<ReportsResponse> {
	const kpis = buildKpis();
	const monthlyReports = reportTemplates.filter((template) =>
		template.date.startsWith("2026-05"),
	).length;

	return {
		summary: {
			total_reports: reportTemplates.length,
			monthly_reports: monthlyReports,
			taux_conformite: kpis.taux_conformite,
		},
		charts: {
			conformity_by_month: conformityByMonth,
			vehicles_by_type: vehiclesByType,
		},
		templates: reportTemplates,
	};
}

export async function getAIPageData(): Promise<AIPageResponse> {
	return {
		history: [...analysisHistoryDb]
			.sort(
				(a, b) =>
					new Date(b.date_analyse).getTime() -
					new Date(a.date_analyse).getTime(),
			)
			.slice(0, 12),
	};
}

export async function createVehicleAnalysis(
	payload: CreateVehicleAnalysisPayload,
): Promise<VehicleAnalysisResponse> {
	const now = new Date().toISOString();
	const prediction = simulatePrediction(payload);
	const analysisId = `analysis-${Date.now()}`;
	const existingVehicle = vehiclesDb.find(
		(vehicle) => vehicle.immatriculation === payload.immatriculation,
	);

	const vehicle: Vehicle = {
		id: existingVehicle?.id ?? `v-${vehiclesDb.length + 1}`,
		immatriculation: payload.immatriculation,
		proprietaire: existingVehicle?.proprietaire ?? "Nouveau dossier",
		type_vehicule: payload.type_vehicule,
		type_commercial: existingVehicle?.type_commercial ?? "Standard",
		marque: payload.marque,
		modele: existingVehicle?.modele ?? randomFrom(["Série A", "Série B", "Série C"]),
		genre: existingVehicle?.genre ?? "thermique",
		couleur: existingVehicle?.couleur ?? "Gris",
		usage: payload.usage,
		assurance: payload.assurance,
		controle_technique: payload.controle_technique,
		vignette: payload.vignette,
		date_expiration_assurance:
			existingVehicle?.date_expiration_assurance ?? now,
		date_expiration_ct: existingVehicle?.date_expiration_ct ?? now,
		puissance: existingVehicle?.puissance ?? 110,
		annee_fabrication: payload.annee_fabrication,
		valeur_estimee_usd: existingVehicle?.valeur_estimee_usd ?? 12000,
		taxe_circulation_usd: payload.taxe_circulation_usd,
		taxe_stationnement_usd: payload.taxe_stationnement_usd,
		penalites_usd: payload.penalites_usd,
		score_ia: prediction.score_confiance,
		statut: prediction.statut,
		niveau_risque: prediction.niveau_risque,
		infractions: payload.infractions,
		incidents: payload.incidents,
		derniere_analyse: now,
		created_at: existingVehicle?.created_at ?? now,
	};

	if (existingVehicle) {
		const index = vehiclesDb.findIndex(
			vehicleItem => vehicleItem.id === existingVehicle.id,
		);
		vehiclesDb[index] = vehicle;
	} else {
		vehiclesDb.unshift(vehicle);
	}

	const history_entry: AnalysisHistory = {
		id: `h-${analysisHistoryDb.length + 1}`,
		vehicule_id: vehicle.id,
		immatriculation: vehicle.immatriculation,
		date_analyse: now,
		resultat: prediction.statut,
		score_ia: prediction.score_confiance,
		operateur: "Opérateur Front Static",
		type_analyse: "complète",
	};

	analysisHistoryDb.unshift(history_entry);

	return {
		analysis_id: analysisId,
		created_at: now,
		vehicle,
		prediction,
		history_entry,
	};
}
