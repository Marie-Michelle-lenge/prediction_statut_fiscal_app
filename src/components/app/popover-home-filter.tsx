import { Button } from "../jk/button";
import {
	Popover,
	PopoverBody,
	PopoverClose,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTitle,
} from "../jk/popover";
import { Label } from "../jk/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../jk/select";

type RelativePeriod = "30d" | "90d" | "180d" | "365d";
type DateField = "analysis" | "creation";
type GroupBy =
	| "statut"
	| "type_vehicule"
	| "usage"
	| "niveau_risque"
	| "marque";
type Metric = "count" | "avg_score" | "total_revenue" | "conformity_rate";

interface PopoverHomeFilterProps {
	period: RelativePeriod;
	dateField: DateField;
	groupBy: GroupBy;
	metric: Metric;
	onPeriodChange: (value: RelativePeriod) => void;
	onDateFieldChange: (value: DateField) => void;
	onGroupByChange: (value: GroupBy) => void;
	onMetricChange: (value: Metric) => void;
}

const periodOptions: { value: RelativePeriod; label: string }[] = [
	{ value: "30d", label: "30 jours" },
	{ value: "90d", label: "90 jours" },
	{ value: "180d", label: "6 mois" },
	{ value: "365d", label: "12 mois" },
];

const groupByOptions: { value: GroupBy; label: string }[] = [
	{ value: "statut", label: "Statut" },
	{ value: "type_vehicule", label: "Type véhicule" },
	{ value: "usage", label: "Usage" },
	{ value: "niveau_risque", label: "Niveau de risque" },
	{ value: "marque", label: "Marque" },
];

const metricOptions: { value: Metric; label: string }[] = [
	{ value: "count", label: "Nombre de véhicules" },
	{ value: "avg_score", label: "Score IA moyen" },
	{ value: "total_revenue", label: "Charge fiscale totale" },
	{ value: "conformity_rate", label: "Taux de conformité" },
];

export const PopoverHomeFilter = ({
	period,
	dateField,
	groupBy,
	metric,
	onPeriodChange,
	onDateFieldChange,
	onGroupByChange,
	onMetricChange,
}: PopoverHomeFilterProps) => {
	return (
		<Popover>
			<Button
				variant="ghost"
				size="sm"
				className="sm:h-8.5 border border-border-input"
			>
				<span aria-hidden className="iconify lucide--sliders-horizontal"></span>
				<span className="mr-2">Filtre</span>
			</Button>
			<PopoverContent className={"min-w-sm w-full"}>
				<PopoverHeader className="p-5 border-b border-border">
					<PopoverTitle>Paramètres analytiques</PopoverTitle>
				</PopoverHeader>
				<PopoverBody className="p-5">
					<div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
						<div className="flex flex-col gap-1">
							<Label
								htmlFor="selc"
								className="text-xs uppercase tracking-wide text-fg-muted"
							>
								Période
							</Label>
							<Select
								value={period}
								onChange={(e) => onPeriodChange(e as RelativePeriod)}
							>
								<SelectTrigger />
								<SelectContent>
									{periodOptions.map((option) => (
										<SelectItem key={option.value} id={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="text-xs uppercase tracking-wide text-fg-muted">
								Champ date
							</Label>
							<Select
								value={dateField}
								onChange={(e) => onDateFieldChange(e as DateField)}
							>
								<SelectTrigger />
								<SelectContent>
									<SelectItem id="analysis">Date analyse</SelectItem>
									<SelectItem id="creation">Date création</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="text-xs uppercase tracking-wide text-fg-muted">
								Dimension X/Y
							</Label>
							<Select
								value={groupBy}
								onChange={(e) => onGroupByChange(e as GroupBy)}
							>
								<SelectTrigger />
								<SelectContent>
									{groupByOptions.map((option) => (
										<SelectItem key={option.value} id={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="text-xs uppercase tracking-wide text-fg-muted">
								Métrique
							</Label>
							<Select
								value={metric}
								onChange={(e) => onMetricChange(e as Metric)}
							>
								<SelectTrigger />
								<SelectContent>
									{metricOptions.map((option) => (
										<SelectItem key={option.value} id={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</PopoverBody>
				<PopoverFooter justify="end" className="gap-2 p-5 border-t border-border">
					<PopoverClose size="sm" className="sm:h-8.5">
						Fermer
					</PopoverClose>
					<Button size="sm" className="sm:h-8.5">
						Filtrer
					</Button>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	);
};
