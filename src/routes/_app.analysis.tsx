import { createFileRoute } from "@tanstack/react-router";
import {
	Car,
	ChevronLeft,
	ChevronRight,
	CircleX,
	Search,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/jk/button";
import { Card } from "@/components/jk/card";
import { Label } from "@/components/jk/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/jk/select";
import { formatNumber } from "@/lib/utils";
import {
	listDgiPredictions,
	statusToApi,
	typeToApi,
} from "@/services/dgi-api";
import type { DgiPredictionListResponse } from "@/services/dgi-api";
import type { ConformityStatus, VehicleCategory } from "@/types";

type DatePreset = "all" | "today" | "yesterday" | "this_week" | "this_month" | "custom";

function shiftDays(dateStr: string, days: number): string {
	const d = new Date(dateStr);
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

function getDateRange(
	preset: DatePreset,
	customStart: string,
	customEnd: string,
): { dateDebut?: string; dateFin?: string } {
	const now = new Date();
	const today = now.toISOString().slice(0, 10);

	switch (preset) {
		case "all":
			return {};
		case "today":
			return { dateDebut: today, dateFin: today };
		case "yesterday": {
			const y = shiftDays(today, -1);
			return { dateDebut: y, dateFin: y };
		}
		case "this_week": {
			const dayOfWeek = now.getDay();
			const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
			return { dateDebut: shiftDays(today, -diffToMonday), dateFin: today };
		}
		case "this_month": {
			const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
			return { dateDebut: firstOfMonth, dateFin: today };
		}
		case "custom":
			return {
				dateDebut: customStart || undefined,
				dateFin: customEnd || undefined,
			};
	}
}

const datePresets: { value: DatePreset; label: string }[] = [
	{ value: "all", label: "Toutes" },
	{ value: "today", label: "Aujourd'hui" },
	{ value: "yesterday", label: "Hier" },
	{ value: "this_week", label: "Cette semaine" },
	{ value: "this_month", label: "Ce mois" },
	{ value: "custom", label: "Personnalisé" },
];

export const Route = createFileRoute("/_app/analysis")({
	component: Analysis,
});

const ITEMS_PER_PAGE = 12;

const typeOptions: { value: VehicleCategory | ""; label: string }[] = [
	{ value: "", label: "Tous les types" },
	{ value: "berline", label: "Berline" },
	{ value: "suv", label: "SUV" },
	{ value: "utilitaire", label: "Utilitaire" },
	{ value: "camion", label: "Camion" },
	{ value: "moto", label: "Moto" },
	{ value: "bus", label: "Bus" },
];

const statusOptions: { value: ConformityStatus | ""; label: string }[] = [
	{ value: "", label: "Tous les statuts" },
	{ value: "conforme", label: "Conforme" },
	{ value: "non_conforme", label: "Non conforme" },
	{ value: "a_risque", label: "À risque" },
];

function Analysis() {
	const [datePreset, setDatePreset] = useState<DatePreset>("all");
	const [customStart, setCustomStart] = useState("");
	const [customEnd, setCustomEnd] = useState("");
	const [filters, setFilters] = useState({
		statut: "" as ConformityStatus | "",
		type_vehicule: "" as VehicleCategory | "",
		marque: "",
	});
	const [page, setPage] = useState(1);
	const [data, setData] = useState<DgiPredictionListResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const dateParams = useMemo(
		() => getDateRange(datePreset, customStart, customEnd),
		[datePreset, customStart, customEnd],
	);

	const fetchData = async (
		currentPage: number,
		currentFilters: typeof filters,
		currentDateParams: typeof dateParams,
	) => {
		setLoading(true);
		setError(null);
		try {
			const params: {
				page?: number;
				limit?: number;
				statut?: string;
				marque?: string;
				type_vehicule?: string;
				dateDebut?: string;
				dateFin?: string;
			} = { page: currentPage, limit: ITEMS_PER_PAGE, ...currentDateParams };

			if (currentFilters.statut) {
				params.statut = statusToApi[currentFilters.statut];
			}
			if (currentFilters.type_vehicule) {
				params.type_vehicule = typeToApi[currentFilters.type_vehicule];
			}
			if (currentFilters.marque) {
				params.marque = currentFilters.marque;
			}

			const response = await listDgiPredictions(params);
			setData(response);
		} catch (err) {
			console.error("Erreur lors du chargement:", err);
			setError("Impossible de charger les données depuis l'API DGI.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(page, filters, dateParams);
	}, [page, filters, dateParams]);

	const updateFilter = <K extends keyof typeof filters>(
		key: K,
		value: (typeof filters)[K],
	) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPage(1);
	};

	const clearFilters = () => {
		setFilters({ statut: "", type_vehicule: "", marque: "" });
		setDatePreset("all");
		setCustomStart("");
		setCustomEnd("");
		setPage(1);
	};

	const hasActiveFilters =
		filters.statut !== "" ||
		filters.type_vehicule !== "" ||
		filters.marque !== "" ||
		datePreset !== "all";

	const totalPages = data
		? Math.max(1, Math.ceil(data.total / data.limit))
		: 1;

	const statusBadge = (statut: string) => (
		<span
			className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
				statut === "Conforme"
					? "text-success bg-success/10"
					: statut === "Non conforme"
						? "text-danger bg-danger/10"
						: "text-warning bg-warning/10"
			}`}
		>
			<span
				className={`w-1.5 h-1.5 rounded-full ${
					statut === "Conforme"
						? "bg-success"
						: statut === "Non conforme"
							? "bg-danger"
							: "bg-warning"
				}`}
			/>
			{statut}
		</span>
	);

	return (
		<div className="p-6 xl:p-8 max-w-[1600px] space-y-4">
			<div className="flex flex-col gap-4">
				<div>
					<h1 className="text-2xl font-bold text-fg-title tracking-tight">
						Analyse & Recherche
					</h1>
					<p className="text-sm text-fg-muted mt-0.5">
						Recherche et consultation des prédictions de conformité
					</p>
				</div>

				{/* Period filter */}
				<div className="flex flex-wrap items-center gap-2">
					{datePresets.map((p) => (
						<button
							key={p.value}
							onClick={() => { setDatePreset(p.value); setPage(1); }}
							className={`px-3 py-1.5 text-xs font-medium rounded-ui border transition-colors ${
								datePreset === p.value
									? "bg-primary text-white border-primary"
									: "bg-white dark:bg-gray-800/50 text-fg-muted border-border hover:border-primary/50"
							}`}
						>
							{p.label}
						</button>
					))}
				</div>

				{datePreset === "custom" && (
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex items-center gap-2">
							<label className="text-xs text-fg-muted">Du</label>
							<input
								type="date"
								value={customStart}
								onChange={(e) => { setCustomStart(e.target.value); setPage(1); }}
								className="px-2 py-1.5 text-sm rounded-ui border border-border bg-white dark:bg-gray-800/50"
							/>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-xs text-fg-muted">Au</label>
							<input
								type="date"
								value={customEnd}
								onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }}
								className="px-2 py-1.5 text-sm rounded-ui border border-border bg-white dark:bg-gray-800/50"
							/>
						</div>
					</div>
				)}

				<div className="flex items-center gap-2.5">
					<div className="flex items-center gap-2">
						<div className="flex flex-col gap-1">
							<Label className="text-xs uppercase tracking-wide text-fg-muted">
								Statut
							</Label>
							<Select
								key={`statut-${filters.statut}`}
								defaultValue={filters.statut}
								onChange={(value) =>
									updateFilter("statut", value as ConformityStatus | "")
								}
							>
								<SelectTrigger className="min-w-[140px]" />
								<SelectContent>
									{statusOptions.map((option) => (
										<SelectItem key={option.value} id={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="text-xs uppercase tracking-wide text-fg-muted">
								Type
							</Label>
							<Select
								key={`type-${filters.type_vehicule}`}
								defaultValue={filters.type_vehicule}
								onChange={(value) =>
									updateFilter(
										"type_vehicule",
										value as VehicleCategory | "",
									)
								}
							>
								<SelectTrigger className="min-w-[140px]" />
								<SelectContent>
									{typeOptions.map((option) => (
										<SelectItem key={option.value} id={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="text-xs uppercase tracking-wide text-fg-muted">
								Marque
							</Label>
							<div className="flex items-center gap-1 px-2.5 py-2 bg-bg border border-border-input rounded-ui text-fg transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 min-w-[140px]">
								<Search size={14} className="text-fg-muted shrink-0" />
								<input
									type="text"
									className="flex-1 bg-transparent outline-none text-sm text-fg placeholder:text-fg-muted"
									placeholder="Ex: Renault"
									value={filters.marque}
									onChange={(e) =>
										updateFilter("marque", e.target.value)
									}
								/>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-1.5 text-xs text-fg-muted px-3 py-1.5 bg-card ring-1 ring-border-card rounded-ui whitespace-nowrap mt-5">
						<Car size={14} />
						<span>
							{data ? formatNumber(data.total) : "..."} résultats
						</span>
					</div>
					{hasActiveFilters && (
						<Button
							variant="outline"
							size="sm"
							className="mt-5"
							onPress={clearFilters}
						>
							<CircleX size={14} />
							Effacer
						</Button>
					)}
				</div>
			</div>

			<Card fill="none" className="bg-white dark:bg-gray-800/50 [--card-padding:0px]">

					{error && (
						<div className="flex items-center gap-3 p-4 bg-danger/5 rounded-ui ring-1 ring-danger/20 mb-4">
							<CircleX size={20} className="text-danger shrink-0" />
							<div>
								<p className="text-sm font-semibold text-fg">Erreur</p>
								<p className="text-xs text-fg-muted mt-0.5">{error}</p>
							</div>
						</div>
					)}

					<div className="overflow-x-auto rounded-ui">
						<table className="w-full border-collapse text-sm">
							<thead>
								<tr className="text-left text-xs font-semibold uppercase tracking-wide text-fg-muted bg-bg-subtle border-b border-border">
									<th className="px-3.5 py-2.5">Date</th>
									<th className="px-3.5 py-2.5">Type véhicule</th>
									<th className="px-3.5 py-2.5">Marque</th>
									<th className="px-3.5 py-2.5">Modèle</th>
									<th className="px-3.5 py-2.5">Statut fiscal</th>
									<th className="px-3.5 py-2.5">Probabilité conformité</th>
								</tr>
							</thead>
							<tbody>
								{loading && !data ? (
									<tr>
										<td
											colSpan={6}
											className="px-3.5 py-8 text-center text-sm text-fg-muted"
										>
											Chargement...
										</td>
									</tr>
								) : data && data.results.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="px-3.5 py-8 text-center text-sm text-fg-muted"
										>
											Aucun résultat trouvé
										</td>
									</tr>
								) : (
									data?.results.map((record, index) => (
										<tr
											key={index}
											className="border-b border-border hover:bg-bg-subtle transition-colors"
										>
											<td className="px-3.5 py-2.5 text-xs text-fg-muted">
												{record.date_analyse
													? new Date(record.date_analyse).toLocaleDateString("fr-FR")
													: "-"}
											</td>
											<td className="px-3.5 py-2.5 capitalize text-fg-muted">
												{record.type_vehicule}
											</td>
											<td className="px-3.5 py-2.5 font-medium text-fg">
												{record.marque}
											</td>
											<td className="px-3.5 py-2.5 text-fg-muted">
												{record.modele}
											</td>
											<td className="px-3.5 py-2.5">
												{statusBadge(record.statut_fiscal)}
											</td>
											<td className="px-3.5 py-2.5">
												<div className="flex items-center gap-2">
													<div className="w-20 h-1.5 rounded-full bg-bg-subtle overflow-hidden">
														<div
															className="h-full rounded-full"
															style={{
																width: `${record.probabilites["Conforme"]}%`,
																background:
																	record.probabilites["Conforme"] >= 70
																		? "hsl(var(--success))"
																		: record.probabilites["Conforme"] >= 40
																			? "hsl(var(--warning))"
																			: "hsl(var(--danger))",
															}}
														/>
													</div>
													<span className="text-xs font-medium text-fg">
														{record.probabilites["Conforme"].toFixed(1)}%
													</span>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{data && data.total > 0 && (
						<div className="flex items-center justify-between p-4">
							<span className="text-xs text-fg-muted">
								{data.total === 0
									? "0 résultat"
									: `${formatNumber((page - 1) * data.limit + 1)}–${formatNumber(Math.min(page * data.limit, data.total))} sur ${formatNumber(data.total)}`}
							</span>
							<div className="flex gap-1">
								<button
									className="flex items-center justify-center min-w-8 h-8 rounded-ui text-xs text-fg-muted bg-card ring-1 ring-border-card hover:bg-bg-subtle hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
									disabled={page === 1}
									onClick={() => setPage((p) => p - 1)}
								>
									<ChevronLeft size={16} />
								</button>
								{Array.from(
									{ length: Math.min(totalPages, 5) },
									(_, index) => {
										const p =
											page <= 3
												? index + 1
												: page >= totalPages - 2
													? totalPages - 4 + index
													: page - 2 + index;
										if (p < 1 || p > totalPages) return null;
										return (
											<button
												key={p}
												className={`flex items-center justify-center min-w-8 h-8 rounded-ui text-xs transition-colors ${p === page ? "bg-primary text-white ring-1 ring-primary" : "text-fg-muted bg-card ring-1 ring-border-card hover:bg-bg-subtle hover:text-fg"}`}
												onClick={() => setPage(p)}
											>
												{p}
											</button>
										);
									},
								)}
								<button
									className="flex items-center justify-center min-w-8 h-8 rounded-ui text-xs text-fg-muted bg-card ring-1 ring-border-card hover:bg-bg-subtle hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
									disabled={page === totalPages}
									onClick={() => setPage((p) => p + 1)}
								>
									<ChevronRight size={16} />
								</button>
							</div>
						</div>
					)}
			</Card>
		</div>
	);
}
