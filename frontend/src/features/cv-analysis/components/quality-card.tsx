import { getScoreTier, scoreTierMeta } from "../lib/score-status"
import type { QualityAssessment } from "@/features/dashboard/types"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const TIER_TONE = {
  good: "success",
  warning: "warning",
  critical: "destructive",
} as const

/** Tek görsel ölçekte kategori skoru ve gerekçesi. */
export function QualityCard({ label, quality }: { label: string; quality: QualityAssessment }) {
  const tier = getScoreTier(quality.score)
  const meta = scoreTierMeta[tier]

  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium">{label}</p>
          <p className={`font-mono text-sm font-semibold tabular-nums ${meta.textClass}`}>
            {quality.score}/100
          </p>
        </div>
        <Progress
          aria-label={`${label}: ${quality.score}/100`}
          className={meta.trackClass}
          value={quality.score}
          tone={TIER_TONE[tier]}
        />
        <p className="text-muted-foreground text-sm leading-relaxed">{quality.comment}</p>
      </CardContent>
    </Card>
  )
}
