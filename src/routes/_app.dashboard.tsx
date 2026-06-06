import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/jk/card";
import { formatNumber } from "@/lib/utils";
import { getDgiDashboardData, type DashboardResponse } from "@/services/dgi-api";
import { CardBlock } from "@/components/atoms/card-block";
import { BarChart } from "@/components/jk/bar-chart";
import { useQuery } from "@tanstack/react-query";
import { Car, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";

type DatePreset = "today" | "yesterday" | "this_week" | "this_month" | "custom" | "until_today";
type DashboardFilter = { dateDebut?: string; dateFin?: string; untilToday?: boolean };

function shiftDays(dateStr: string, days: number): string {
	const d = new Date(dateStr);
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}

function getFilterRanges(
	preset: DatePreset,
	customStart: string,
	customEnd: string,
): { current: DashboardFilter; previous?: DashboardFilter } {
	const now = new Date();
	const today = now.toISOString().slice(0, 10);

	switch (preset) {
		case "today":
			return {
				current: { dateDebut: today, dateFin: today },
				previous: { dateDebut: shiftDays(today, -1), dateFin: shiftDays(today, -1) },
			};
		case "yesterday": {
			const y = shiftDays(today, -1);
			return {
				current: { dateDebut: y, dateFin: y },
				previous: { dateDebut: shiftDays(today, -2), dateFin: shiftDays(today, -2) },
			};
		}
		case "this_week": {
			const dayOfWeek = now.getDay();
			const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
			const monday = shiftDays(today, -diffToMonday);
			return {
				current: { dateDebut: monday, dateFin: today },
				previous: { dateDebut: shiftDays(monday, -7), dateFin: shiftDays(monday, -1) },
			};
		}
		case "this_month": {
			const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
			const prevMonthEnd = shiftDays(firstOfMonth, -1);
			const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
			return {
				current: { dateDebut: firstOfMonth, dateFin: today },
				previous: { dateDebut: prevMonthStart, dateFin: prevMonthEnd },
			};
		}
		case "until_today": {
			return { current: { untilToday: true } };
		}
		case "custom": {
			if (!customStart || !customEnd) {
				return { current: {}, previous: {} };
			}
			const len = Math.round(
				(new Date(customEnd).getTime() - new Date(customStart).getTime()) / 86400000,
			);
			const prevEnd = shiftDays(customStart, -1);
			const prevStart = shiftDays(customStart, -len - 1);
			return {
				current: { dateDebut: customStart, dateFin: customEnd },
				previous: { dateDebut: prevStart, dateFin: prevEnd },
			};
		}
	}
}

const presets: { value: DatePreset; label: string }[] = [
	{ value: "today", label: "Aujourd'hui" },
	{ value: "yesterday", label: "Hier" },
	{ value: "this_week", label: "Cette semaine" },
	{ value: "this_month", label: "Ce mois" },
	{ value: "until_today", label: "Jusqu'à aujourd'hui" },
	{ value: "custom", label: "Personnalisé" },
];

function compareLabel(preset: DatePreset): string {
	switch (preset) {
		case "today": return "vs hier";
		case "yesterday": return "vs avant-hier";
		case "this_week": return "vs semaine précédente";
		case "this_month": return "vs mois précédent";
		case "until_today": return "";
		case "custom": return "vs période précédente";
	}
}

interface KpiDiff {
	current: number;
	previous: number;
	diff: number;
	pct: number;
}

function computeDiff(current: number, previous: number): KpiDiff {
	const diff = current - previous;
	const pct = previous === 0 ? (current === 0 ? 0 : 100) : Math.round((diff / previous) * 100);
	return { current, previous, diff, pct };
}

function KpiBadge({ diff, preset, showComparison }: { diff: KpiDiff; preset: DatePreset; showComparison: boolean }) {
	if (!showComparison) return null;
	const { diff: d, pct } = diff;
	if (d === 0) {
		return (
			<span className="w-max max-w-full truncate ui-soft mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium ui-soft ui-soft-gray">
				0 {compareLabel(preset)}
			</span>
		);
	}
	const isUp = d > 0;
	return (
		<span
			className={`w-max max-w-full truncate ui-soft mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium ${isUp ? "ui-soft-success" : "ui-soft-danger"
				}`}
		>
			<span aria-hidden="true" className={`iconify size-4 lucide--${isUp ? "trending-up" : "trending-down"}`} />
			{d > 0 ? "+" : ""}{d} ({isUp ? "+" : ""}{pct}%) {compareLabel(preset)}
		</span>
	);
}

export const Route = createFileRoute("/_app/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	const [page, setPage] = useState(1);
	const [preset, setPreset] = useState<DatePreset>("this_month");
	const [customStart, setCustomStart] = useState("");
	const [customEnd, setCustomEnd] = useState("");
	const limit = 8;

	const { current, previous } = useMemo(
		() => getFilterRanges(preset, customStart, customEnd),
		[preset, customStart, customEnd],
	);
	const showComparison = preset !== "until_today";

	const { data, isLoading } = useQuery({
		queryKey: ["dgi-dashboard", current, previous],
		queryFn: async () => {
			const cur = await getDgiDashboardData(current);
			const prev = previous ? await getDgiDashboardData(previous) : null;
			return { current: cur, previous: prev };
		},
		refetchInterval: 30_000,
	});

	const kpis = useMemo(() => {
		if (!data) return null;
		if (!data.previous) {
			return {
				total: computeDiff(data.current.kpis.total_vehicules, 0),
				conformes: computeDiff(data.current.kpis.vehicules_conformes, 0),
				nonConformes: computeDiff(data.current.kpis.vehicules_non_conformes, 0),
				aRisque: computeDiff(data.current.kpis.vehicules_a_risque, 0),
				taux: {
					current: data.current.kpis.taux_conformite,
					previous: 0,
					diff: 0,
					pct: 0,
				},
			};
		}
		return {
			total: computeDiff(data.current.kpis.total_vehicules, data.previous.kpis.total_vehicules),
			conformes: computeDiff(data.current.kpis.vehicules_conformes, data.previous.kpis.vehicules_conformes),
			nonConformes: computeDiff(data.current.kpis.vehicules_non_conformes, data.previous.kpis.vehicules_non_conformes),
			aRisque: computeDiff(data.current.kpis.vehicules_a_risque, data.previous.kpis.vehicules_a_risque),
			taux: {
				current: data.current.kpis.taux_conformite,
				previous: data.previous.kpis.taux_conformite,
				diff: Math.round((data.current.kpis.taux_conformite - data.previous.kpis.taux_conformite) * 10) / 10,
				pct: 0,
			},
		};
	}, [data]);

	if (!data) {
		return (
			<div className="p-6 xl:p-8 max-w-[1600px] space-y-6">
				<h1 className="text-2xl font-bold text-fg-title tracking-tight">Tableau de bord national</h1>
				<p className="text-sm text-fg-muted mt-1">{isLoading ? "Chargement..." : "Aucune donnée"}</p>
			</div>
		);
	}

	const { current: curData } = data;
	const { vehicles_by_type, latest_predictions } = curData;

	const totalPages = Math.max(1, Math.ceil(latest_predictions.length / limit));
	const paginated = latest_predictions.slice((page - 1) * limit, page * limit);

	const allKpis = kpis!;

	return (
		<div className="p-6 xl:p-8 max-w-[1600px] space-y-6">
			<div className="flex flex-col gap-4">
				<div className="max-w-xl">
					<h1 className="text-2xl font-bold text-fg-title tracking-tight">
						Tableau de bord national
					</h1>
					<p className="text-sm text-fg-muted mt-1">
						Statistiques basées sur les analyses DGI enregistrées
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{presets.map((p) => (
						<button type="button"
							key={p.value}
							onClick={() => { setPreset(p.value); setPage(1); }}
							className={`px-3 py-1.5 text-xs font-medium rounded-ui border transition-colors ${preset === p.value
									? "bg-primary text-white border-primary"
									: "bg-white dark:bg-gray-800/50 text-fg-muted border-border hover:border-primary/50"
								}`}
						>
							{p.label}
						</button>
					))}
				</div>
			</div>

			{preset === "custom" && (
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<label htmlFor="input_date_s" className="text-xs text-fg-muted">Du</label>
						<input
							id="input_date_s"
							type="date"
							value={customStart}
							onChange={(e) => { setCustomStart(e.target.value); setPage(1); }}
							className="px-2 py-1.5 text-sm rounded-ui border border-border bg-white dark:bg-gray-800/50"
						/>
					</div>
					<div className="flex items-center gap-2">
						<label htmlFor="input_date_s" className="text-xs text-fg-muted">Au</label>
						<input id="input_date_s"
							type="date"
							value={customEnd}
							onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }}
							className="px-2 py-1.5 text-sm rounded-ui border border-border bg-white dark:bg-gray-800/50"
						/>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-fg-muted">Total analysés</span>
						<Car size={20} className="text-primary" />
					</div>
					<span className="text-3xl font-semibold text-fg mt-3">
						{formatNumber(allKpis.total.current)}
					</span>
					<KpiBadge diff={allKpis.total} preset={preset} showComparison={showComparison} />
				</Card>

				<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-fg-muted">Conformes</span>
						<ShieldCheck size={20} className="text-success" />
					</div>
					<span className="text-3xl font-semibold text-fg mt-3">
						{formatNumber(allKpis.conformes.current)}
					</span>
					<KpiBadge diff={allKpis.conformes} preset={preset} showComparison={showComparison} />
				</Card>

				<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-fg-muted">Non conformes</span>
						<ShieldX size={20} className="text-danger" />
					</div>
					<span className="text-3xl font-semibold text-fg mt-3">
						{formatNumber(allKpis.nonConformes.current)}
					</span>
					<KpiBadge diff={allKpis.nonConformes} preset={preset} showComparison={showComparison} />
				</Card>

				<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-fg-muted">À risque</span>
						<AlertTriangle size={20} className="text-warning" />
					</div>
					<span className="text-3xl font-semibold text-fg mt-3">
						{formatNumber(allKpis.aRisque.current)}
					</span>
					<KpiBadge diff={allKpis.aRisque} preset={preset} showComparison={showComparison} />
				</Card>

				<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-fg-muted">Taux de conformité</span>
						<span className="iconify lucide--percent size-5 text-primary" />
					</div>
					<span className="text-3xl font-semibold text-fg mt-3">
						{allKpis.taux.current}%
					</span>
					{showComparison && allKpis.taux.diff !== 0 && (
						<span className={`w-max ui-soft mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium ${allKpis.taux.diff > 0 ? "ui-soft-success" : "ui-soft-danger"}`}>
							<span aria-hidden="true" className={`iconify size-4 lucide--${allKpis.taux.diff > 0 ? "trending-up" : "trending-down"}`} />
							{allKpis.taux.diff > 0 ? "+" : ""}{allKpis.taux.diff}pp {compareLabel(preset)}
						</span>
					)}
				</Card>
			</div>

			{vehicles_by_type.length > 0 && (
				<CardBlock title="Conformité par type de véhicule" subtitle="Répartition des statuts par catégorie">
					<BarChart
						data={vehicles_by_type}
						dataKey="type"
						type="stacked"
						barSize={20}
						barCategoryGap={20}
						barRadius={4}
						xAxisProps={{
							tick: { transform: "translate(0, 6)" },
							tickMargin: 8,
						}}
						className="[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-black/[0.04] dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/50"
						tooltipProps={{
							content: ({ active, payload, label }) => {
								if (!active || !payload?.length) return null;
								return (
									<div className="grid min-w-40 items-start rounded-lg bg-overlay/80 p-3 text-xs ring ring-current/10 backdrop-blur-lg">
										<span className="font-medium mb-2">{label}</span>
										<div className="grid gap-2">
											{payload.map((entry: any) => (
												<div key={entry.name} className="flex items-center gap-2">
													<span
														className="size-2.5 rounded-full shrink-0"
														style={{ background: entry.color || entry.payload?.fill }}
													/>
													<span className="text-muted-fg flex-1">
														{entry.name === "conforme" ? "Conforme" : entry.name === "a_risque" ? "À risque" : "Non conforme"}
													</span>
													<span className="font-medium font-mono tabular-nums">
														{entry.value}
													</span>
												</div>
											))}
										</div>
									</div>
								);
							},
						}}
						valueFormatter={(v) => v.toLocaleString("fr-FR")}
						config={{
							conforme: { label: "Conforme", color: "var(--color-success)" },
							a_risque: { label: "À risque", color: "var(--color-warning)" },
							non_conforme: { label: "Non conforme", color: "var(--color-danger)" },
						}}
					/>
				</CardBlock>
			)}

			<CardBlock title="Dernières prédictions" subtitle="Les analyses les plus récentes" bodyClass="p-0">
				<div className="overflow-x-auto rounded-ui">
					<table className="w-full border-collapse text-sm">
						<thead>
							<tr className="text-left text-xs font-semibold uppercase tracking-wide text-fg-muted bg-bg-subtle border-b border-border">
								<th className="px-3.5 py-2.5">Date</th>
								<th className="px-3.5 py-2.5">Type</th>
								<th className="px-3.5 py-2.5">Marque</th>
								<th className="px-3.5 py-2.5">Modèle</th>
								<th className="px-3.5 py-2.5">Statut</th>
								<th className="px-3.5 py-2.5">Conforme</th>
							</tr>
						</thead>
						<tbody>
							{paginated.map((p, i) => (
								<tr
									key={i}
									className="border-b border-border hover:bg-bg-subtle transition-colors"
								>
									<td className="px-3.5 py-2.5 text-xs text-fg-muted">
										{p.date_analyse ? new Date(p.date_analyse).toLocaleDateString("fr-FR") : "-"}
									</td>
									<td className="px-3.5 py-2.5 capitalize text-fg-muted">
										{p.type_vehicule}
									</td>
									<td className="px-3.5 py-2.5 text-fg-muted">{p.marque}</td>
									<td className="px-3.5 py-2.5 text-fg-muted">{p.modele}</td>
									<td className="px-3.5 py-2.5">
										<span
											className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ui-soft ${p.statut_fiscal === "Conforme"
													? "ui-soft-success"
													: p.statut_fiscal === "Non conforme"
														? "ui-soft-danger"
														: "ui-soft-warning"
												}`}
										>
											<span
												className={`w-1.5 h-1.5 rounded-full ${p.statut_fiscal === "Conforme"
														? "bg-success"
														: p.statut_fiscal === "Non conforme"
															? "bg-danger"
															: "bg-warning"
													}`}
											/>
											{p.statut_fiscal}
										</span>
									</td>
									<td className="px-3.5 py-2.5 text-xs text-fg-muted">
										{p.probabilites?.["Conforme"] ?? "-"}%
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{totalPages > 1 && (
					<div className="flex justify-center gap-2 p-5">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="px-3 py-1 text-sm rounded-ui border border-border disabled:opacity-40"
						>
							Précédent
						</button>
						<span className="px-3 py-1 text-sm text-fg-muted">
							{page} / {totalPages}
						</span>
						<button
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
							className="px-3 py-1 text-sm rounded-ui border border-border disabled:opacity-40"
						>
							Suivant
						</button>
					</div>
				)}
			</CardBlock>
		</div>
	);
}
