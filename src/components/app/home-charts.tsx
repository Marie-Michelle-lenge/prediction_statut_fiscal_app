import { CardBlock } from '../atoms/card-block'
import { LineChart } from '@/components/jk/line-chart'
import { BarChart } from '@/components/jk/bar-chart'
import { PieChart } from '@/components/jk/pie-chart'
interface HomeChartsProps {
	conformityTrendData: { mois: string; taux: number }[];
	conformityPieData: { name: string; code: string; value: number }[];
	vehiclesByTypeData: {
		type: string;
		conforme: number;
		risque: number;
		nonConforme: number;
	}[];
	usageData: { usage: string; count: number }[];
}

export const HomeCharts = ({
	conformityTrendData,
	conformityPieData,
	vehiclesByTypeData,
	usageData,
}: HomeChartsProps) => {
	return (
		<div className="grid gap-6">
			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-2">
					<CardBlock title="Évolution du taux de conformité" subtitle="8 derniers mois · données consolidées">
						<LineChart
							data={conformityTrendData}
							dataKey="mois"
							valueFormatter={(v) => `${v.toFixed(1)}%`}
							config={{
								taux: { label: 'Taux de conformité', color: 'var(--color-success)' },
							}}
						/>
					</CardBlock>
				</div>

				<CardBlock title="Répartition de conformité" subtitle="Statuts actuels du parc">
					<PieChart
						containerHeight={220}
						data={conformityPieData}
						dataKey="value"
						nameKey="name"
						variant="donut"
						showLabel
						label="12 847"
						valueFormatter={(v) => v.toLocaleString('fr-FR')}
						colors={['var(--color-success)', 'var(--color-warning)', 'var(--color-danger)']}
						config={{
							conforme: { label: 'Conforme', color: 'var(--color-success)' },
							a_risque: { label: 'À risque', color: 'var(--color-warning)' },
							non_conforme: { label: 'Non conforme', color: 'var(--color-danger)' },
						}}
					/>
				</CardBlock>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
				<div className="lg:col-span-2">
					<CardBlock title="Conformité par type de véhicule" subtitle="Comparaison multi-statuts">
						<BarChart
							data={vehiclesByTypeData}
							dataKey="type"
							type="stacked"
							barSize={20}
							barCategoryGap={20}
							barRadius={4}
							xAxisProps={{
								tick: { transform: 'translate(0, 6)' },
								tickMargin: 8,
							}}
							valueFormatter={(v) => v.toLocaleString('fr-FR')}
							config={{
								conforme: { label: 'Conforme', color: 'var(--color-success)' },
								risque: { label: 'À risque', color: 'var(--color-warning)' },
								nonConforme: { label: 'Non conforme', color: 'var(--color-danger)' },
							}}
						/>
					</CardBlock>
				</div>

				<CardBlock title="Répartition par usage" subtitle="Catégories d'utilisation">
					<BarChart
						data={usageData}
						dataKey="usage"
						layout="vertical"
						barSize={20}
						barCategoryGap={25}
						barRadius={4}
						valueFormatter={(v) => v.toLocaleString('fr-FR')}
						config={{
							count: { label: 'Nombre', color: 'var(--color-primary)' },
						}}
					/>
				</CardBlock>
			</div>
		</div>
	)
}
