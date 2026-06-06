import type {
	AdminAlert,
	AnalysisHistory,
	Genre,
	KPIData,
	Vehicle,
	VehicleCategory,
	VehicleUsage,
} from "../types";

export const mockKPIs: KPIData = {
	total_vehicules: 12847,
	vehicules_conformes: 9432,
	vehicules_non_conformes: 1823,
	vehicules_a_risque: 1592,
	taux_conformite: 73.3,
	revenu_total_usd: 2847000,
	taxe_moyenne_usd: 221.63,
};

const marques = [
	"Renault",
	"Peugeot",
	"Citroën",
	"Volkswagen",
	"Toyota",
	"Hyundai",
	"Kia",
	"Dacia",
	"Ford",
	"Mercedes",
];

const modeles: Record<string, string[]> = {
	Renault: ["Clio", "Megane", "Captur", "Kadjar", "Scenic"],
	Peugeot: ["208", "308", "3008", "5008", "2008"],
	Citroën: ["C3", "C4", "C5 Aircross", "Berlingo", "Jumpy"],
	Volkswagen: ["Golf", "Polo", "Tiguan", "Passat", "Transporter"],
	Toyota: ["Yaris", "Corolla", "RAV4", "Hilux", "Land Cruiser"],
	Hyundai: ["i20", "i30", "Tucson", "Santa Fe", "Kona"],
	Kia: ["Ceed", "Sportage", "Sorento", "Picanto", "Niro"],
	Dacia: ["Sandero", "Duster", "Logan", "Spring", "Jogger"],
	Ford: ["Focus", "Fiesta", "Kuga", "Ranger", "Transit"],
	Mercedes: ["Classe A", "Classe C", "GLC", "Sprinter", "Vito"],
};

const categories: VehicleCategory[] = [
	"berline",
	"suv",
	"utilitaire",
	"camion",
	"moto",
	"bus",
];
const usages: VehicleUsage[] = [
	"particulier",
	"commercial",
	"transport",
	"agricole",
	"diplomatique",
	"gouvernemental",
];
const genres: Genre[] = ["thermique", "electrique", "hybride"];
const statuts: Vehicle["statut"][] = ["conforme", "non_conforme", "a_risque"];
const couleurs = [
	"Blanc",
	"Noir",
	"Gris",
	"Bleu",
	"Rouge",
	"Vert",
	"Argent",
	"Beige",
];
const typesCommerciaux = [
	"Break",
	"Cabine approfondie",
	"Fourgon",
	"Plateau",
	"Vitré",
	"Benne",
	"Standard",
];

function randomFrom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: string, end: string): string {
	const s = new Date(start).getTime();
	const e = new Date(end).getTime();
	return new Date(s + Math.random() * (e - s)).toISOString();
}

function generateImmatriculation(): string {
	const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
	const l1 = letters[Math.floor(Math.random() * letters.length)];
	const l2 = letters[Math.floor(Math.random() * letters.length)];
	const l3 = letters[Math.floor(Math.random() * letters.length)];
	const nums = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
	const dept = String(randomInt(1, 95)).padStart(2, "0");
	return `${nums}-${l1}${l2}${l3}-${dept}`;
}

const nomsProprietaires = [
	"Mohammed Benali",
	"Fatima Zahra El Amrani",
	"Ahmed Tazi",
	"Khadija Berrada",
	"Youssef Alaoui",
	"Amina Fassi",
	"Omar Benjelloun",
	"Hassania Chraibi",
	"Rachid Doukkali",
	"Nadia Skalli",
	"Karim Idrissi",
	"Samira Bennani",
	"Hicham Louizi",
	"Zineb Kettani",
	"Mounir Tijani",
	"Leila Ouazzani",
	"Société Transport SA",
	"Entreprise Logistique SARL",
	"Auto Services SARL",
	"Transport Public SARL",
	"Diplomatie Internationale",
	"Ministère Transport",
];

export function generateVehicles(count: number): Vehicle[] {
	const vehicles: Vehicle[] = [];
	for (let i = 0; i < count; i++) {
		const marque = randomFrom(marques);
		const modele = randomFrom(modeles[marque] || ["Modèle X"]);
		const annee = randomInt(2010, 2024);
		const statut = randomFrom(statuts);
		const score =
			statut === "conforme"
				? randomInt(75, 99)
				: statut === "a_risque"
					? randomInt(40, 74)
					: randomInt(5, 39);
		const assuranceOk =
			statut === "conforme" ? Math.random() > 0.02 : Math.random() > 0.5;
		const ctOk =
			statut === "conforme" ? Math.random() > 0.03 : Math.random() > 0.45;
		const vignetteOk =
			statut === "conforme" ? Math.random() > 0.04 : Math.random() > 0.5;

		vehicles.push({
			id: `v-${i + 1}`,
			immatriculation: generateImmatriculation(),
			proprietaire: randomFrom(nomsProprietaires),
			type_vehicule: randomFrom(categories),
			type_commercial: randomFrom(typesCommerciaux),
			marque,
			modele,
			genre: randomFrom(genres),
			couleur: randomFrom(couleurs),
			usage: randomFrom(usages),
			assurance: assuranceOk ? "valide" : "expire",
			controle_technique: ctOk ? "valide" : "expire",
			vignette: vignetteOk ? "valide" : "expire",
			date_expiration_assurance: randomDate("2024-01-01", "2026-12-31"),
			date_expiration_ct: randomDate("2024-01-01", "2026-12-31"),
			puissance: randomInt(60, 400),
			annee_fabrication: annee,
			valeur_estimee_usd: randomInt(5000, 80000),
			taxe_circulation_usd: randomInt(50, 1200),
			taxe_stationnement_usd: randomInt(30, 600),
			penalites_usd: statut === "conforme" ? 0 : randomInt(50, 2500),
			score_ia: score,
			statut,
			niveau_risque:
				score > 75
					? "faible"
					: score > 50
						? "moyen"
						: score > 25
							? "eleve"
							: "critique",
			infractions: statut === "conforme" ? randomInt(0, 1) : randomInt(1, 8),
			incidents: statut === "conforme" ? 0 : randomInt(0, 5),
			derniere_analyse: randomDate("2025-01-01", "2025-05-09"),
			created_at: randomDate("2023-01-01", "2025-05-09"),
		});
	}
	return vehicles;
}

export const mockVehicles = generateVehicles(240);

export const mockAlerts: AdminAlert[] = [
	{
		id: "a-1",
		type: "document_expire",
		titre: "Assurance expirée - Lot 47 véhicules",
		description:
			"47 véhicules ont une assurance expirée depuis plus de 30 jours.",
		severite: "eleve",
		date: "2025-05-08T14:30:00Z",
		lu: false,
	},
	{
		id: "a-2",
		type: "anomalie",
		titre: "Anomalie détectée - Immatriculations dupliquées",
		description:
			"3 paires d'immatriculations potentiellement dupliquées détectées dans le registre.",
		severite: "critique",
		date: "2025-05-08T10:15:00Z",
		lu: false,
	},
	{
		id: "a-3",
		type: "vehicule_critique",
		titre: "Véhicules critiques - Score IA < 20",
		description: "12 véhicules ont un score de conformité IA inférieur à 20.",
		severite: "eleve",
		date: "2025-05-07T16:45:00Z",
		lu: true,
	},
	{
		id: "a-4",
		type: "alerte_fiscale",
		titre: "Taxes impayées - Retard supérieur à 12 mois",
		description:
			"234 véhicules présentent un retard de paiement supérieur à 12 mois.",
		severite: "moyen",
		date: "2025-05-07T09:00:00Z",
		lu: true,
	},
	{
		id: "a-5",
		type: "document_expire",
		titre: "Contrôle technique expiré - Véhicules utilitaires",
		description: "89 véhicules utilitaires ont un contrôle technique expiré.",
		severite: "moyen",
		date: "2025-05-06T11:20:00Z",
		lu: true,
	},
];

export const mockAnalysisHistory: AnalysisHistory[] = Array.from(
	{ length: 60 },
	(_, i) => ({
		id: `h-${i + 1}`,
		vehicule_id: `v-${randomInt(1, 50)}`,
		immatriculation: generateImmatriculation(),
		date_analyse: randomDate("2025-04-01", "2025-05-09"),
		resultat: randomFrom(statuts),
		score_ia: randomInt(10, 99),
		operateur: randomFrom([
			"Admin DGI",
			"Inspecteur Martin",
			"Agent Dubois",
			"Système IA",
		]),
		type_analyse: randomFrom(["complète", "rapide", "fiscale", "documentaire"]),
	}),
);

export const conformityByMonth = [
	{ mois: "Jan", conforme: 820, non_conforme: 145, a_risque: 120 },
	{ mois: "Fév", conforme: 845, non_conforme: 138, a_risque: 115 },
	{ mois: "Mar", conforme: 870, non_conforme: 130, a_risque: 110 },
	{ mois: "Avr", conforme: 890, non_conforme: 125, a_risque: 108 },
	{ mois: "Mai", conforme: 910, non_conforme: 120, a_risque: 105 },
];

export const vehiclesByType = [
	{ type: "Berline", count: 4230, conformite: 78 },
	{ type: "SUV", count: 2890, conformite: 72 },
	{ type: "Utilitaire", count: 2140, conformite: 68 },
	{ type: "Camion", count: 1560, conformite: 65 },
	{ type: "Moto", count: 1340, conformite: 71 },
	{ type: "Bus", count: 687, conformite: 82 },
];

export const vehiclesByUsage = [
	{ usage: "Particulier", count: 5420, pct: 42 },
	{ usage: "Commercial", count: 3850, pct: 30 },
	{ usage: "Transport", count: 1920, pct: 15 },
	{ usage: "Agricole", count: 890, pct: 7 },
	{ usage: "Diplomatique", count: 387, pct: 3 },
	{ usage: "Gouvernemental", count: 380, pct: 3 },
];

export const riskDistribution = [
	{ niveau: "Faible", count: 7230, color: "hsl(var(--success))" },
	{ niveau: "Moyen", count: 3190, color: "hsl(var(--warning))" },
	{ niveau: "Élevé", count: 1620, color: "hsl(var(--danger))" },
	{ niveau: "Critique", count: 807, color: "var(--color-danger-700)" },
];

export const taxStats = [
	{ categorie: "Taxes payées", valeur: 11613 },
	{ categorie: "Retard 1-6 mois", valeur: 680 },
	{ categorie: "Retard 6-12 mois", valeur: 340 },
	{ categorie: "Retard > 12 mois", valeur: 214 },
];

export const revenueByMonth = [
	{ mois: "Jan", recettes: 182000, penalites: 8400 },
	{ mois: "Fév", recettes: 175000, penalites: 9200 },
	{ mois: "Mar", recettes: 191000, penalites: 7800 },
	{ mois: "Avr", recettes: 188000, penalites: 8600 },
	{ mois: "Mai", recettes: 196000, penalites: 7900 },
];
