import { createFileRoute } from "@tanstack/react-router";
import {
  Car, ShieldCheck, ShieldAlert, ShieldX, FileWarning, Coins, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Download, RefreshCw, AlertTriangle, Info, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { vehicles, kpis, conformityTrend, byType, usageDist, alerts } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Tableau de bord — DGI VériVéhicule" },
    { name: "description", content: "Vue d'ensemble institutionnelle de la conformité du parc automobile national." },
  ]}),
  component: Dashboard,
});

const chartColors = ["var(--primary)", "var(--success)", "var(--warning)", "var(--destructive)", "var(--info)"];

function Kpi({ icon: Icon, label, value, delta, tone = "neutral", suffix }: any) {
  const toneCls = tone === "up" ? "text-success" : tone === "down" ? "text-destructive" : "text-muted-foreground";
  const Arrow = tone === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="h-9 w-9 rounded-md bg-primary/8 text-primary flex items-center justify-center">
          <Icon className="h-4.5 w-4.5" />
        </div>
        {delta && (
          <div className={`flex items-center gap-0.5 text-[11px] font-medium ${toneCls}`}>
            <Arrow className="h-3 w-3" />{delta}
          </div>
        )}
      </div>
      <div className="mt-4 text-[12px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[24px] font-semibold tracking-tight num">
        {value}{suffix && <span className="text-base text-muted-foreground font-normal ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function Card({ title, subtitle, children, action }: any) {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6,
    fontSize: 12, padding: "8px 10px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: 11, marginBottom: 4 },
};

function Dashboard() {
  const conformePct = Math.round((kpis.conforme / kpis.total) * 100);
  const pieData = [
    { name: "Conforme", value: kpis.conforme, color: "var(--success)" },
    { name: "À risque", value: kpis.risque, color: "var(--warning)" },
    { name: "Non conforme", value: kpis.nonConforme, color: "var(--destructive)" },
  ];

  return (
    <div className="px-8 py-7 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Direction Générale des Impôts"
        title="Tableau de bord national"
        description="Vue analytique consolidée du parc véhicules sous contrôle administratif. Données mises à jour en temps réel via le moteur d'analyse IA."
        actions={
          <>
            <button className="h-9 px-3 rounded-md border border-border bg-card text-[12px] font-medium hover:bg-secondary inline-flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Actualiser
            </button>
            <button className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" /> Exporter le rapport
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={Car} label="Total véhicules analysés" value={kpis.total.toLocaleString("fr-FR")} delta="+12.4%" tone="up" />
        <Kpi icon={ShieldCheck} label="Véhicules conformes" value={kpis.conforme} delta="+3.2%" tone="up" />
        <Kpi icon={ShieldAlert} label="Véhicules à risque" value={kpis.risque} delta="+1.8%" tone="down" />
        <Kpi icon={ShieldX} label="Véhicules non conformes" value={kpis.nonConforme} delta="-2.1%" tone="up" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={TrendingUp} label="Taux global de conformité" value={conformePct} suffix="%" delta="+4.3 pts" tone="up" />
        <Kpi icon={FileWarning} label="Documents expirés" value={kpis.docsExpired} delta="-6.7%" tone="up" />
        <Kpi icon={Coins} label="Taxes impayées" value={kpis.taxesUnpaid} delta="+0.9%" tone="down" />
        <Kpi icon={Activity} label="Analyses IA / 24h" value="1 247" delta="+18.2%" tone="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <Card title="Évolution du taux de conformité" subtitle="8 derniers mois · données consolidées">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={conformityTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="taux" stroke="var(--primary)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Répartition de conformité" subtitle="Statuts actuels du parc">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} strokeWidth={2} stroke="var(--card)">
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span className="num font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <Card title="Conformité par type de véhicule" subtitle="Comparaison multi-statuts">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byType} barCategoryGap={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="square" iconSize={8} />
                <Bar dataKey="conforme" name="Conforme" stackId="a" fill="var(--success)" radius={[0,0,0,0]} />
                <Bar dataKey="risque" name="À risque" stackId="a" fill="var(--warning)" />
                <Bar dataKey="nonConforme" name="Non conforme" stackId="a" fill="var(--destructive)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Répartition par usage" subtitle="Catégories d'utilisation">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={usageDist} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={120} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="var(--primary)" radius={[0,3,3,0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Activity + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="Activité récente" subtitle="Derniers véhicules analysés par le moteur IA"
            action={<button className="text-[11px] text-primary font-medium hover:underline">Voir tout →</button>}>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-[12px]">
                <thead className="bg-secondary/50">
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2.5 font-medium">Immatriculation</th>
                    <th className="px-3 py-2.5 font-medium">Type</th>
                    <th className="px-3 py-2.5 font-medium">Score IA</th>
                    <th className="px-3 py-2.5 font-medium">Statut</th>
                    <th className="px-3 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 7).map(v => (
                    <tr key={v.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-3 py-2.5 font-medium num">{v.plate}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{v.type}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width: `${v.score}%`,
                              background: v.score >= 75 ? "var(--success)" : v.score >= 55 ? "var(--warning)" : "var(--destructive)"
                            }} />
                          </div>
                          <span className="num text-[11px] font-medium">{v.score}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5"><StatusBadge status={v.status} /></td>
                      <td className="px-3 py-2.5 text-muted-foreground num">{v.lastAnalysis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card title="Alertes administratives" subtitle="Notifications système prioritaires">
          <div className="space-y-3">
            {alerts.map(a => {
              const Icon = a.type === "critique" ? AlertCircle : a.type === "warning" ? AlertTriangle : Info;
              const tone = a.type === "critique" ? "text-destructive bg-destructive/10" : a.type === "warning" ? "text-warning-foreground bg-warning/15" : "text-info bg-info/10";
              return (
                <div key={a.id} className="flex gap-3 p-3 rounded-md border border-border hover:border-primary/30 transition-colors">
                  <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</div>
                    <div className="text-[10px] text-muted-foreground mt-1.5">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}