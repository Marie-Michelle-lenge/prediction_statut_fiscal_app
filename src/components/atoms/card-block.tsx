import { cx } from "#/lib/utils";
import { Card } from "../jk/card";


export function CardBlock({ title, subtitle, children, action, className = '', bodyClass='' }: any) {
  return (
    <Card size="custom" fill="none" className={cx("[--card-padding:0px] bg-white dark:bg-gray-800/50", className)}>
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-fg-title tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-fg-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={
        cx(
          "p-5",
          bodyClass
        )
      }>{children}</div>
    </Card>
  );
}