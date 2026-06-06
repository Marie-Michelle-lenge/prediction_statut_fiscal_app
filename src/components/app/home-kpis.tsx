import { Card } from "@/components/jk/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { KPIData } from "@/types";

interface HomeKPIsProps {
	kpis: KPIData;
}

export const HomeKPIs = ({ kpis }: HomeKPIsProps) => {
	const conformePct =
		kpis.total_vehicules === 0
			? 0
			: Math.round((kpis.vehicules_conformes / kpis.total_vehicules) * 100);

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-fg-muted">
						Total véhicules analysés
					</span>
					<span className="iconify lucide--car size-5 text-primary"></span>
				</div>
				<span className="text-3xl font-semibold text-fg mt-3">
					{formatNumber(kpis.total_vehicules)}
				</span>
				<span className="w-max ui-soft ui-soft-success mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium">
					<span
						aria-hidden="true"
						className="iconify size-4 lucide--trending-up"
					></span>
					+12.4% ce mois
				</span>
			</Card>

			<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-fg-muted">
						Véhicules conformes
					</span>
					<span className="iconify lucide--shield-check size-5 text-primary"></span>
				</div>
				<span className="text-3xl font-semibold text-fg mt-3">
					{formatNumber(kpis.vehicules_conformes)}
				</span>
				<span className="w-max ui-soft ui-soft-success mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium">
					<span
						aria-hidden="true"
						className="iconify size-4 lucide--trending-up"
					></span>
					{conformePct}% du parc
				</span>
			</Card>

			<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-fg-muted">
						Véhicules non conformes
					</span>
					<span className="iconify lucide--shield-x size-5 text-danger"></span>
				</div>
				<span className="text-3xl font-semibold text-fg mt-3">
					{formatNumber(kpis.vehicules_non_conformes)}
				</span>
				<span className="w-max ui-soft ui-soft-danger mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium">
					<span
						aria-hidden="true"
						className="iconify size-4 lucide--alert-triangle"
					></span>
					À traiter en priorité
				</span>
			</Card>

			<Card fill="none" className="bg-white dark:bg-gray-800/50 flex flex-col">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium text-fg-muted">
						Revenu fiscal total
					</span>
					<span className="iconify lucide--coins size-5 text-primary"></span>
				</div>
				<span className="text-3xl font-semibold text-fg mt-3">
					{formatCurrency(kpis.revenu_total_usd)}
				</span>
				<span className="w-max ui-soft ui-soft-success mt-4 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium">
					<span
						aria-hidden="true"
						className="iconify size-4 lucide--trending-up"
					></span>
					+3.2% ce mois
				</span>
			</Card>
		</div>
	);
};
