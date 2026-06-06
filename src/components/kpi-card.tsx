import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Kpi({ icon: Icon, label, value, delta, tone = "neutral", suffix }: any) {
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