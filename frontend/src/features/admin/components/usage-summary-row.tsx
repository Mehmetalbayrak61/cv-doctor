import { useTranslation } from "react-i18next"

import type { UsageSummary } from "../types"

export function UsageSummaryRow({ label, usage }: { label: string; usage: UsageSummary }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div className="flex gap-5 font-mono tabular-nums">
        <span title={t("admin.usage.calls")}>{usage.call_count}</span>
        <span title={t("admin.usage.tokens")}>{usage.total_tokens.toLocaleString()}</span>
        <span title={t("admin.usage.cost")}>${usage.estimated_cost_usd.toFixed(4)}</span>
      </div>
    </div>
  )
}
