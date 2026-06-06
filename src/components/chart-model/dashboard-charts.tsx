"use client";

import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/jk/card";
import { BarChart } from "@/components/jk/bar-chart";
import { LineChart } from "@/components/jk/line-chart";
import { PieChart } from "@/components/jk/pie-chart";
import { formatNumber } from "@/lib/utils";

// Conformity Distribution Pie Chart
interface ConformityPieChartProps {
	data: Array<{ name: string; value: number }>;
	totalLabel?: string;
}

export const ConformityPieChart = ({ data, totalLabel }: ConformityPieChartProps) => {
	const total = data.reduce((sum, item) => sum + item.value, 0);

	return (
		<Card className="flex-1 min-w-[300px]">
			<CardHeader className="text-center">
				<CardTitle size="md">Répartition de conformité</CardTitle>
				<CardDescription>Lecture de la population filtrée</CardDescription>
			</CardHeader>
			<CardBody>
				<PieChart
					containerHeight={220}
					data={data.map((d) => ({
						name: d.name,
						code: d.name === "Conforme" ? "conforme" : d.name === "À risque" ? "a_risque" : "non_conforme",
						value: d.value,
					}))}
					dataKey="value"
					nameKey="name"
					variant="donut"
					showLabel
					label={totalLabel ?? formatNumber(total)}
					valueFormatter={(v) => formatNumber(v)}
					colors={['var(--color-success)', 'var(--color-warning)', 'var(--color-danger)']}
					config={{
						conforme: { label: "Conforme", color: "var(--color-success)" },
						a_risque: { label: "À risque", color: "var(--color-warning)" },
						non_conforme: { label: "Non conforme", color: "var(--color-danger)" },
					}}
				/>
			</CardBody>
		</Card>
	);
};

// Dynamic Distribution Bar Chart
interface DynamicBarChartProps {
	data: Array<{ label: string; value: number }>;
	title: string;
	description: string;
	valueFormatter?: (v: number) => string;
	color?: string;
}

export const DynamicBarChart = ({ 
	data, 
	title, 
	description, 
	valueFormatter = (v) => formatNumber(v),
	color = "var(--color-primary)"
}: DynamicBarChartProps) => {
	return (
		<Card className="flex-1 min-w-[350px]">
			<CardHeader>
				<CardTitle size="md">{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardBody>
				<BarChart
					data={data}
					dataKey="label"
					barSize={6}
					barCategoryGap={20}
					barRadius={4}
					valueFormatter={valueFormatter}
					config={{
						value: { label: "Valeur", color },
					}}
				/>
			</CardBody>
		</Card>
	);
};

// Conformity Evolution Line Chart
interface ConformityEvolutionChartProps {
	data: Array<{ mois: string; conforme: number; non_conforme: number; a_risque: number }>;
	description?: string;
}

export const ConformityEvolutionChart = ({ data, description }: ConformityEvolutionChartProps) => {
	return (
		<Card className="flex-1 min-w-[350px]">
			<CardHeader>
				<CardTitle size="md">Évolution temporelle</CardTitle>
				<CardDescription>{description ?? "Tendance sur la période"}</CardDescription>
			</CardHeader>
			<CardBody>
				<LineChart
					data={data}
					dataKey="mois"
					valueFormatter={(v) => formatNumber(v)}
					config={{
						conforme: { label: "Conforme", color: "var(--color-success)" },
						non_conforme: { label: "Non conforme", color: "var(--color-danger)" },
						a_risque: { label: "À risque", color: "var(--color-warning)" },
					}}
				/>
			</CardBody>
		</Card>
	);
};

// Vehicles by Usage Horizontal Bar Chart
interface UsageBarChartProps {
	data: Array<{ usage: string; count: number }>;
}

export const UsageBarChart = ({ data }: UsageBarChartProps) => {
	return (
		<Card className="flex-1 min-w-[300px]">
			<CardHeader>
				<CardTitle size="md">Répartition par usage</CardTitle>
				<CardDescription>Population sur la fenêtre choisie</CardDescription>
			</CardHeader>
			<CardBody>
				<BarChart
					data={data}
					dataKey="usage"
					layout="vertical"
					barSize={6}
					barCategoryGap={25}
					barRadius={4}
					valueFormatter={(v) => formatNumber(v)}
					config={{
						count: { label: "Nombre", color: "var(--color-primary)" },
					}}
				/>
			</CardBody>
		</Card>
	);
};

// Risk Distribution Pie Chart
interface RiskPieChartProps {
	data: Array<{ niveau: string; count: number; color: string }>;
}

export const RiskPieChart = ({ data }: RiskPieChartProps) => {
	return (
		<Card className="flex-1 min-w-[300px]">
			<CardHeader className="text-center">
				<CardTitle size="md">Analyse des risques</CardTitle>
				<CardDescription>Distribution par niveau</CardDescription>
			</CardHeader>
			<CardBody>
				<PieChart
					containerHeight={220}
					data={data.map((d) => ({
						name: d.niveau,
						code: d.niveau.toLowerCase().replace("é", "e"),
						count: d.count,
					}))}
					dataKey="count"
					nameKey="name"
					variant="pie"
					valueFormatter={(v) => formatNumber(v)}
					colors={['var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-danger-700)']}
					config={{
						faible: { label: "Faible", color: "var(--color-success)" },
						moyen: { label: "Moyen", color: "var(--color-warning)" },
						eleve: { label: "Élevé", color: "var(--color-danger)" },
						critique: { label: "Critique", color: "var(--color-danger-700)" },
					}}
				/>
			</CardBody>
		</Card>
	);
};

// Revenue by Month Bar Chart
interface RevenueBarChartProps {
	data: Array<{ mois: string; recettes: number; penalites: number }>;
}

export const RevenueBarChart = ({ data }: RevenueBarChartProps) => {
	return (
		<Card className="flex-1 min-w-[300px]">
			<CardHeader>
				<CardTitle size="md">Recettes fiscales</CardTitle>
				<CardDescription>Évolution mensuelle</CardDescription>
			</CardHeader>
			<CardBody>
				<BarChart
					data={data}
					dataKey="mois"
					barSize={6}
					barCategoryGap={20}
					barRadius={4}
					valueFormatter={(v) => formatNumber(v)}
					config={{
						recettes: { label: "Recettes", color: "var(--color-success)" },
						penalites: { label: "Pénalités", color: "var(--color-danger)" },
					}}
				/>
			</CardBody>
		</Card>
	);
};
