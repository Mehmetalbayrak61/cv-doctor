import { Briefcase, Gauge, Sparkles, Target, type LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"

import { getScoreTier, scoreTierMeta } from "@/features/cv-analysis/lib/score-status"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EmptyState {
  message: string
  hint?: string
}

interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: number | null
  suffix?: string
  tier?: ReturnType<typeof getScoreTier>
  tierLabel?: string
  /** value 0 veya null olduğunda büyük rakam yerine gösterilecek, kullanıcı
   * dostu mesaj — "0" veya "—" tek başına ne yapılması gerektiğini anlatmaz. */
  emptyState?: EmptyState
}

function KpiCard({ icon: Icon, label, value, suffix, tier, tierLabel, emptyState }: KpiCardProps) {
  const meta = tier ? scoreTierMeta[tier] : null
  const isEmpty = (value === null || value === 0) && !!emptyState

  return (
    <Card className="h-full">
      <CardContent className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="bg-accent text-primary flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-4.5" />
          </div>
          {meta && tierLabel && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10.5px] font-medium",
                meta.trackClass,
                meta.textClass
              )}
            >
              {tierLabel}
            </span>
          )}
        </div>

        {isEmpty ? (
          <div>
            <p className="text-foreground text-base leading-snug font-semibold">
              {emptyState.message}
            </p>
            <p className="text-muted-foreground mt-1.5 text-xs">{emptyState.hint ?? label}</p>
          </div>
        ) : (
          <div>
            <p
              className={cn(
                "font-mono text-[2.5rem] leading-none font-bold tracking-tight tabular-nums",
                meta ? meta.textClass : "text-foreground"
              )}
            >
              {value}
              {suffix && <span className="text-muted-foreground ml-1 text-base font-medium">{suffix}</span>}
            </p>
            <p className="text-muted-foreground mt-1.5 text-xs">{label}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface KpiGridProps {
  overallScore: number | null
  atsScore: number | null
  jobMatchCount: number
  aiUsageCount: number
}

export function KpiGrid({ overallScore, atsScore, jobMatchCount, aiUsageCount }: KpiGridProps) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  const overallTier = overallScore !== null ? getScoreTier(overallScore) : undefined
  const atsTier = atsScore !== null ? getScoreTier(atsScore) : undefined

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {[
        <KpiCard
          key="overall-score"
        icon={Gauge}
        label={t("overview.kpi.overallScore")}
        value={overallScore}
        suffix="/100"
        tier={overallTier}
        tierLabel={overallTier ? t(`analysis.scoreStatus.${overallTier}`) : undefined}
        emptyState={{
          message: t("overview.kpi.noAnalysisYet"),
          hint: t("overview.kpi.noAnalysisYetHint"),
        }}
        />,
        <KpiCard
          key="ats-score"
        icon={Target}
        label={t("overview.kpi.atsScore")}
        value={atsScore}
        suffix="/100"
        tier={atsTier}
        tierLabel={atsTier ? t(`analysis.scoreStatus.${atsTier}`) : undefined}
        emptyState={{ message: t("overview.kpi.noAnalysisYet") }}
        />,
        <KpiCard
          key="job-matches"
        icon={Briefcase}
        label={t("overview.kpi.jobMatches")}
        value={jobMatchCount}
        emptyState={{
          message: t("overview.kpi.noMatchesYet"),
          hint: t("overview.kpi.noMatchesYetHint"),
        }}
        />,
        <KpiCard
          key="ai-usage"
        icon={Sparkles}
        label={t("overview.kpi.aiUsage")}
        value={aiUsageCount}
        emptyState={{ message: t("overview.kpi.noAiUsageYet") }}
        />,
      ].map((card, index) => (
        <motion.div
          key={card.key}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          {card}
        </motion.div>
      ))}
    </div>
  )
}
