import { useTranslation } from "react-i18next"

import type { UsageSummary } from "../types"

const usageGridClass =
  "grid grid-cols-[minmax(0,1fr)_max-content_max-content_max-content] items-center gap-x-3 sm:gap-x-5"

export function UsageSummaryHeader() {
  const { t } = useTranslation()

  return (
    <div
      className={`${usageGridClass} text-muted-foreground border-border border-b pb-2 text-xs font-medium`}
    >
      <span aria-hidden="true" />
      <span>{t("admin.usage.calls")}</span>
      <span>{t("admin.usage.tokens")}</span>
      <span>{t("admin.usage.cost")}</span>
    </div>
  )
}

export function UsageSummaryRow({ label, usage }: { label: string; usage: UsageSummary }) {
  return (
    <div className={`${usageGridClass} py-2.5 text-sm`}>
      <p className="text-muted-foreground min-w-0 break-words pr-1">{label}</p>
      <span className="font-mono tabular-nums">{usage.call_count}</span>
      <span className="font-mono tabular-nums">{usage.total_tokens.toLocaleString()}</span>
      <span className="font-mono tabular-nums">${usage.estimated_cost_usd.toFixed(4)}</span>
    </div>
  )
}
