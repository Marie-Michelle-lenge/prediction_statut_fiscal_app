import { createFileRoute } from "@tanstack/react-router";
import {
	Car,
	CircleCheck,
	CircleX,
	Sparkles,
	TriangleAlert,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/jk/button";
import { Input, Label } from "#/components/jk/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "#/components/jk/select";
import {
	Card,
	CardBody,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/jk/card";
import { createDgiVehicleAnalysis } from "@/services/dgi-api";
import type { DgiResponse } from "@/services/dgi-api";
import type { VehicleCategory, VehicleUsage } from "@/types";
import type { CreateVehicleAnalysisPayload } from "@/types/api";

export const Route = createFileRoute("/_app/formulaire")({ component: FormulairePage });

const typeOptions: { value: VehicleCategory | ""; label: string }[] = [
	{ value: "berline", label: "Berline" },
	{ value: "suv", label: "SUV" },
	{ value: "utilitaire", label: "Utilitaire" },
	{ value: "camion", label: "Camion" },
	{ value: "moto", label: "Moto" },
	{ value: "bus", label: "Bus" },
];

const usageOptions: { value: VehicleUsage | ""; label: string }[] = [
	{ value: "particulier", label: "Particulier" },
	{ value: "commercial", label: "Commercial" },
	{ value: "transport", label: "Transport" },
	{ value: "agricole", label: "Agricole" },
	{ value: "diplomatique", label: "Diplomatique" },
	{ value: "gouvernemental", label: "Gouvernemental" },
];

interface FormData {
	immatriculation: string;
	type_vehicule: VehicleCategory | "";
	marque: string;
	annee: string;
	usage: VehicleUsage | "";
	taxe_circulation_usd: string;
	taxe_stationnement_usd: string;
	penalites_usd: string;
	assurance: "" | "valide" | "expire";
	controle_technique: "" | "valide" | "expire";
	vignette: "" | "valide" | "expire";
	infractions: string;
	incidents: string;
}

const initialForm: FormData = {
	immatriculation: "",
	type_vehicule: "",
	marque: "",
	annee: "",
	usage: "",
	taxe_circulation_usd: "0",
	taxe_stationnement_usd: "0",
	penalites_usd: "0",
	assurance: "",
	controle_technique: "",
	vignette: "",
	infractions: "0",
	incidents: "0",
};

function FormulairePage() {
	const [form, setForm] = useState<FormData>(initialForm);
	const [result, setResult] = useState<DgiResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);

	const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
		setValidationError(null);
	};

	const handleSubmit = async () => {
		setValidationError(null);
		if (
			!form.immatriculation ||
			!form.type_vehicule ||
			!form.marque ||
			!form.annee ||
			!form.usage ||
			!form.assurance ||
			!form.controle_technique ||
			!form.vignette
		) {
			setValidationError("Veuillez remplir tous les champs obligatoires.");
			return;
		}

		setLoading(true);
		setResult(null);
		setError(null);
		const payload: CreateVehicleAnalysisPayload = {
			immatriculation: form.immatriculation,
			type_vehicule: form.type_vehicule as VehicleCategory,
			marque: form.marque,
			annee_fabrication: parseInt(form.annee, 10) || new Date().getFullYear(),
			usage: form.usage as VehicleUsage,
			taxe_circulation_usd: parseFloat(form.taxe_circulation_usd) || 0,
			taxe_stationnement_usd: parseFloat(form.taxe_stationnement_usd) || 0,
			penalites_usd: parseFloat(form.penalites_usd) || 0,
			assurance: form.assurance as "valide" | "expire",
			controle_technique: form.controle_technique as "valide" | "expire",
			vignette: form.vignette as "valide" | "expire",
			infractions: parseInt(form.infractions, 10) || 0,
			incidents: parseInt(form.incidents, 10) || 0,
		};

		try {
			const response = await createDgiVehicleAnalysis(payload);
			setResult(response);
		} catch (err) {
			console.error("Erreur lors de l'analyse:", err);
			setError(
				"Impossible de contacter l'API DGI. Vérifiez que le serveur est lancé sur http://localhost:8001",
			);
		} finally {
			setLoading(false);
		}
	};

	const statusIcon =
		result?.statut_fiscal === "Conforme"
			? CircleCheck
			: result?.statut_fiscal === "Non conforme"
				? CircleX
				: TriangleAlert;
	const statusColor =
		result?.statut_fiscal === "Conforme"
			? "var(--color-success)"
			: result?.statut_fiscal === "Non conforme"
				? "var(--color-danger)"
				: "var(--color-warning)";

	return (
		<div className="p-6 xl:p-8 max-w-400 space-y-5">
			<div className="flex items-end justify-between gap-4 flex-wrap">
				<div>
					<h1 className="flex items-center gap-2.5 text-2xl font-bold text-fg-title tracking-tight">
						<Car size={24} className="text-primary" />
						Analyse de conformité
					</h1>
					<p className="text-sm text-fg-muted mt-0.5">
						Prédiction du statut fiscal des véhicules
					</p>
				</div>
				<div className="flex items-center gap-1.5 text-xs text-fg-muted px-3 py-1.5 bg-card ring-1 ring-border-card rounded-ui">
					<Zap size={14} className="text-success" />
					<span>API Active</span>
				</div>
			</div>

			<div className="flex gap-6 flex-wrap">
				<Card fill="none" className="bg-white dark:bg-gray-800/50 flex-1 min-w-125 md:[--ui-padding:--spacing(8)]">
					<CardHeader>
						<CardTitle size="md">Formulaire de saisie</CardTitle>
						<CardDescription>
							Renseignez les informations du véhicule pour l'analyse
						</CardDescription>
					</CardHeader>
					<CardBody gap="4">
						<div className="pb-4 border-b border-border">
							<h3 className="flex items-center gap-2 text-sm font-semibold text-fg mb-3">
								<Car size={16} />
								Informations véhicule
							</h3>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
								<Input
									label="Immatriculation"
									placeholder="Ex: 123-ABC-75"
									value={form.immatriculation}
									onChange={(e) =>
										updateField("immatriculation", e.target.value)
									}
								/>
								<div className="flex flex-col gap-2">
									<Label htmlFor="typeOp">Type</Label>
									<Select placeholder="Sélectionner"
										id="typeOp"
										defaultValue={form.type_vehicule}
										onChange={(e) =>
											updateField("type_vehicule", e as VehicleCategory | "")
										}
									>
										<SelectTrigger />
										<SelectContent>
											{typeOptions.map((o) => (
												<SelectItem
													key={o.value}
													id={o.value}
													textValue={o.label}
												>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<Input
									label="Marque"
									type="text"
									placeholder="Ex: Renault"
									value={form.marque}
									onChange={(e) => updateField("marque", e.target.value)}
								/>
								<Input
									label="Année"
									type="number"
									className="px-2.5 py-2 text-sm bg-bg border border-border-input rounded-ui text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
									placeholder="Ex: 2020"
									value={form.annee}
									onChange={(e) => updateField("annee", e.target.value)}
								/>
								<div className="flex flex-col gap-2">
									<Label
										htmlFor="opUsage"
										className="text-xs uppercase tracking-wide text-fg-muted"
									>
										Usage
									</Label>
									<Select placeholder="Sélectionner"
										id="opUsage"
										defaultValue={form.usage}
										onChange={(e) =>
											updateField("usage", e as VehicleUsage | "")
										}
									>
										<SelectTrigger />
										<SelectContent>
											{usageOptions.map((o) => (
												<SelectItem key={o.value} id={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div className="pb-4 border-b border-border">
							<h3 className="flex items-center gap-2 text-sm font-semibold text-fg mb-3">
								<CircleCheck size={16} />
								Informations fiscales
							</h3>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
								<Input
									label="Taxe circulation (USD)"
									type="number"
									className="px-2.5 py-2 text-sm bg-bg border border-border-input rounded-ui text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
									value={form.taxe_circulation_usd}
									onChange={(e) =>
										updateField("taxe_circulation_usd", e.target.value)
									}
								/>
								<Input
									label="Taxe stationnement (USD)"
									type="number"
									className="px-2.5 py-2 text-sm bg-bg border border-border-input rounded-ui text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
									value={form.taxe_stationnement_usd}
									onChange={(e) =>
										updateField("taxe_stationnement_usd", e.target.value)
									}
								/>
								<Input
									label="Pénalités (USD)"
									type="number"
									className="px-2.5 py-2 text-sm bg-bg border border-border-input rounded-ui text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
									value={form.penalites_usd}
									onChange={(e) => updateField("penalites_usd", e.target.value)}
								/>
							</div>
						</div>

						<div className="pb-4 border-b border-border">
							<h3 className="flex items-center gap-2 text-sm font-semibold text-fg mb-3">
								<CircleCheck size={16} />
								Documents
							</h3>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
								<div className="flex flex-col gap-2">
									<Label htmlFor="opAssurance">Assurance</Label>
									<Select placeholder="Sélectionner"
										id="opAssurance"
										defaultValue={form.assurance}
										onChange={(e) =>
											updateField("assurance", e as "" | "valide" | "expire")
										}
									>
										<SelectTrigger />
										<SelectContent>
											<SelectItem id="valide">Valide</SelectItem>
											<SelectItem id="expire">Expirée</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="cont_tec">Contrôle technique</Label>
									<Select placeholder="Sélectionner"
										id="cont_tec"
										defaultValue={form.controle_technique}
										onChange={(e) =>
											updateField(
												"controle_technique",
												e as "" | "valide" | "expire",
											)
										}
									>
										<SelectTrigger />
										<SelectContent>
											<SelectItem id="valide">Valide</SelectItem>
											<SelectItem id="expire">Expiré</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="vignette">Vignette</Label>
									<Select placeholder="Sélectionner"
										id="vignette"
										defaultValue={form.vignette}
										onChange={(e) =>
											updateField("vignette", e as "" | "valide" | "expire")
										}
									>
										<SelectTrigger />
										<SelectContent>
											<SelectItem id="valide">Valide</SelectItem>
											<SelectItem id="expire">Expirée</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div>
							<h3 className="flex items-center gap-2 text-sm font-semibold text-fg mb-3">
								<TriangleAlert size={16} />
								Contexte de risque
							</h3>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
								<Input
									label="Nombre d'infractions"
									type="number"
									value={form.infractions}
									onChange={(e) => updateField("infractions", e.target.value)}
								/>

								<Input
									label="Nombre d'incidents"
									type="number"
									className="px-2.5 py-2 text-sm bg-bg border border-border-input rounded-ui text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
									value={form.incidents}
									onChange={(e) => updateField("incidents", e.target.value)}
								/>
							</div>
						</div>
					</CardBody>
					{validationError && (
						<div className="px-4 pt-0">
							<p className="text-xs text-danger flex items-center gap-1.5">
								<TriangleAlert size={12} />
								{validationError}
							</p>
						</div>
					)}
					<div className="flex justify-end gap-2.5 mt-8 px-4 py-4 border-t border-border">
						<Button
							onPress={() => {
								setForm(initialForm);
								setResult(null);
								setError(null);
								setValidationError(null);
							}}
							className=""
							variant="outline"
						>
							Réinitialiser
						</Button>
						<Button
							onPress={handleSubmit}
							isDisabled={loading}
							className="gap-2 justify-center"
						>
							{loading ? (
								<>
									<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Analyse en cours...
								</>
							) : (
								<>
									<Sparkles size={16} />
									Lancer l'analyse
								</>
							)}
						</Button>
					</div>
				</Card>

				{result && (
					<Card fill="none" className="bg-white dark:bg-gray-800/50 flex-1 min-w-100">
						<CardHeader>
							<CardTitle size="md">Résultat de l'analyse</CardTitle>
							<CardDescription>
								Prédiction de conformité du véhicule
							</CardDescription>
						</CardHeader>
						<CardBody gap="4">
							<div
								className="flex items-center gap-4 p-5 rounded-ui border-2"
								style={{ borderColor: statusColor }}
							>
								<div
									className="w-14 h-14 rounded-ui flex items-center justify-center shrink-0"
									style={{
										background: `${statusColor}15`,
										color: statusColor,
									}}
								>
									{(() => {
										const Icon = statusIcon;
										return <Icon size={28} />;
									})()}
								</div>
								<div>
									<div
										className="text-xl font-bold"
										style={{ color: statusColor }}
									>
										{result.statut_fiscal}
									</div>
									<div className="text-sm text-fg-muted mt-0.5">
										{result.type_vehicule} — {result.marque} {result.modele}
									</div>
								</div>
							</div>

							<div className="p-4 bg-bg-subtle rounded-ui">
								<h4 className="text-sm font-semibold text-fg mb-3">
									Confiance
								</h4>
								<div className="flex items-center gap-2">
									<div className="flex-1 h-2 rounded-full bg-bg-muted overflow-hidden">
										<div
											className="h-full rounded-full transition-all duration-500"
											style={{
												width: `${result.probabilites["Conforme"]}%`,
												background:
													result.probabilites["Conforme"] >= 70
														? "var(--color-success)"
														: result.probabilites["Conforme"] >= 40
															? "var(--color-warning)"
															: "var(--color-danger)",
											}}
										/>
									</div>
									<span className="text-xs font-semibold text-fg">
										{result.probabilites["Conforme"].toFixed(1)}%
									</span>
								</div>
							</div>
						</CardBody>
					</Card>
				)}

				{error && (
					<Card fill="none" className="bg-white dark:bg-gray-800/50 flex-1 min-w-100">
						<CardBody>
							<div className="flex items-center gap-3 p-4 bg-danger/5 rounded-ui ring-1 ring-danger/20">
								<CircleX size={20} className="text-danger shrink-0" />
								<div>
									<p className="text-sm font-semibold text-fg">
										Erreur de connexion
									</p>
									<p className="text-xs text-fg-muted mt-0.5">{error}</p>
								</div>
							</div>
						</CardBody>
					</Card>
				)}
			</div>
		</div>
	);
}
