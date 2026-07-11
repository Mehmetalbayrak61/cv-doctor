import { AlertTriangle, CheckCircle2, Lightbulb, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import type { DashboardOverviewData } from "../../hooks/use-dashboard-overview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Priority = "critical" | "tip" | "good"

interface Suggestion {
  priority: Priority
  title: string
  description: string
  to?: string
}

const PRIORITY_META: Record<Priority, { icon: LucideIcon; badgeClass: string; iconClass: string; tone: string }> = {
  critical: { icon: AlertTriangle, badgeClass: "bg-destructive/10 text-destructive", iconClass: "text-destructive", tone: "bg-destructive/5" },
  tip: { icon: Lightbulb, badgeClass: "bg-warning/15 text-warning", iconClass: "text-warning", tone: "bg-warning/5" },
  good: { icon: CheckCircle2, badgeClass: "bg-success/15 text-success", iconClass: "text-success", tone: "bg-success/5" },
}

/** Yeni bir AI çağrısı YAPMAZ — tamamen mevcut, zaten çekilmiş veriden (skorlar,
 * eşleştirme sayısı) basit eşiklerle türetilen istemci-taraflı önizleme metinleri. */
function buildSuggestions(
  data: DashboardOverviewData,
  t: (key: string, opts?: Record<string, unknown>) => string
): Suggestion[] {
  const suggestions: Suggestion[] = []
  const latestCvId = data.latestCvId

  if (data.atsScore !== null && data.atsScore < 70 && latestCvId) {
    suggestions.push({
      priority: "critical",
      title: t("overview.suggestions.lowAts.title"),
      description: t("overview.suggestions.lowAts.description"),
      to: `/cvs/${latestCvId}`,
    })
  }

  if (data.jobMatchCount === 0) {
    suggestions.push({
      priority: "tip",
      title: t("overview.suggestions.noMatch.title"),
      description: t("overview.suggestions.noMatch.description"),
      to: "/jobs",
    })
  }

  if (data.overallScore !== null && data.overallScore >= 80) {
    suggestions.push({
      priority: "good",
      title: t("overview.suggestions.doingGreat.title"),
      description: t("overview.suggestions.doingGreat.description"),
    })
  }

  if (suggestions.length === 0 && latestCvId) {
    suggestions.push({
      priority: "tip",
      title: t("overview.suggestions.explore.title"),
      description: t("overview.suggestions.explore.description"),
      to: `/cvs/${latestCvId}`,
    })
  }

  return suggestions.slice(0, 3)
}

export function AiSuggestions({ data }: { data: DashboardOverviewData }) {
  const { t } = useTranslation()
  const suggestions = buildSuggestions(data, t)

  if (suggestions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("overview.suggestions.heading")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {suggestions.map((s) => {
          const meta = PRIORITY_META[s.priority]
          const Icon = meta.icon
          const content = (
            <div className={cn("flex gap-3 rounded-lg p-3", meta.tone)}>
              <Icon className={cn("mt-0.5 size-4 shrink-0", meta.iconClass)} />
              <div className="space-y-1">
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-0.5 font-mono text-[9.5px] font-medium tracking-wide uppercase",
                    meta.badgeClass
                  )}
                >
                  {t(`overview.suggestions.priority.${s.priority}`)}
                </span>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{s.description}</p>
              </div>
            </div>
          )
          return s.to ? (
            <Link key={s.title} to={s.to} className="block">
              {content}
            </Link>
          ) : (
            <div key={s.title}>{content}</div>
          )
        })}
      </CardContent>
    </Card>
  )
}
