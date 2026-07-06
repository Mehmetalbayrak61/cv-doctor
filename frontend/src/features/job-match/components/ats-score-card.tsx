import { ArrowRight, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { getMatchTier, scoreTierMeta } from "../lib/match-tier"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScoreRing } from "@/features/cv-analysis/components/score-ring"
import { cn } from "@/lib/utils"

interface AtsScoreCardProps {
  score: number
  missingKeywordsCount: number
  onOptimize: () => void
  isOptimizing: boolean
}

/** ATS'e özel tek büyük kart — backend ayrı bir "şunu düzelt" metni döndürmüyor,
 * bu yüzden iyileştirme yönlendirmesi gerçek verilerle (eksik anahtar kelime
 * sayısı + ATS Optimize aracı) yapılır, uydurma bir öneri metni yazılmaz. */
export function AtsScoreCard({ score, missingKeywordsCount, onOptimize, isOptimizing }: AtsScoreCardProps) {
  const { t } = useTranslation()
  const tier = getMatchTier(score)
  const meta = scoreTierMeta[tier]
  const Icon = meta.icon

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-7 text-center sm:flex-row sm:text-left">
        <ScoreRing
          label={t("jobMatch.result.atsMatchScore")}
          score={score}
          size={104}
          tier={tier}
          hideLabel
          hideStatus
        />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-base font-semibold">{t("jobMatch.result.atsHeading")}</h2>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              meta.trackClass,
              meta.textClass
            )}
          >
            <Icon className="size-3.5" />
            {t(`jobMatch.status.tier.${tier}`)}
          </span>
          {missingKeywordsCount > 0 && (
            <p className="text-muted-foreground text-sm">
              {t("jobMatch.result.missingKeywords")}: {missingKeywordsCount}
            </p>
          )}
        </div>
        <Button variant="outline" disabled={isOptimizing} onClick={onOptimize} className="shrink-0">
          {isOptimizing ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          {t("jobMatch.result.atsOptimizeCta")}
        </Button>
      </CardContent>
    </Card>
  )
}
