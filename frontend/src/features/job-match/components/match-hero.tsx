import { Loader2, RefreshCcw } from "lucide-react"
import { useTranslation } from "react-i18next"

import { getMatchTier, scoreTierMeta } from "../lib/match-tier"
import type { JobDescription, JobMatch } from "../types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { CVDocument } from "@/features/dashboard/types"
import { ScoreRing } from "@/features/cv-analysis/components/score-ring"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

interface MatchHeroProps {
  job: JobDescription
  cv: CVDocument
  match: JobMatch
  onOptimizeCv: () => void
  isOptimizing: boolean
  onGenerateCoverLetter: () => void
  isGeneratingCoverLetter: boolean
  onRematch: () => void
  isRematching: boolean
}

/** Ekranın odak noktası: büyük uyum halkası + premium tier rozeti + AI'nin tek
 * serbest-metin çıktısı (seniority_fit) + ikincil metrik (hiring_probability)
 * hepsi tek bakışta okunacak şekilde aynı blokta gruplanır ("bu ilana başvurmalı
 * mıyım?" sorusunun cevabı burada). */
export function MatchHero({
  job,
  cv,
  match,
  onOptimizeCv,
  isOptimizing,
  onGenerateCoverLetter,
  isGeneratingCoverLetter,
  onRematch,
  isRematching,
}: MatchHeroProps) {
  const { t, i18n } = useTranslation()
  const result = match.result
  const tier = result ? getMatchTier(result.compatibility_score) : "warning"
  const meta = scoreTierMeta[tier]
  const TierIcon = meta.icon

  return (
    <Card elevation="raised">
      <CardContent className="space-y-7 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-muted-foreground/80 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {job.company && <span>{job.company}</span>}
              {job.location && <span>{job.location}</span>}
              <span>{cv.file_name}</span>
              <span>{formatDate(match.created_at, i18n.language)}</span>
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isRematching}
                aria-label={t("jobMatch.result.rematch")}
              >
                {isRematching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCcw className="size-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("jobMatch.result.rematchConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("jobMatch.result.rematchConfirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onRematch}>
                  {t("jobMatch.result.rematch")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {result && (
          <div className="flex flex-col items-center gap-8 sm:flex-row">
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 -z-10 scale-[1.35] rounded-full opacity-70 blur-xl"
                style={{
                  background: `radial-gradient(circle, color-mix(in oklch, ${meta.colorVar} 22%, transparent) 0%, transparent 72%)`,
                }}
              />
              <ScoreRing
                label={t("jobMatch.result.compatibilityScore")}
                score={result.compatibility_score}
                size={168}
                tier={tier}
                hideLabel
                hideStatus
              />
            </div>
            <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold",
                  meta.trackClass,
                  meta.textClass
                )}
              >
                <TierIcon className="size-4" />
                {t(`jobMatch.status.tier.${tier}`)}
              </span>
              <p className="text-sm leading-relaxed">
                <span className="text-muted-foreground">{t("jobMatch.result.aiNote")}: </span>
                {result.seniority_fit}
              </p>
              <p className="text-muted-foreground text-xs font-medium">
                {t("jobMatch.result.hiringProbability")}:{" "}
                <span className="text-foreground font-semibold">
                  %{result.hiring_probability}
                </span>
              </p>
              <p className="text-muted-foreground/70 text-[11px] leading-relaxed">
                {t("jobMatch.result.aiEstimateDisclaimer")}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={isOptimizing}
            onClick={onOptimizeCv}
            className="shadow-primary/25 shadow-lg hover:shadow-xl"
          >
            {isOptimizing && <Loader2 className="size-4 animate-spin" />}
            {t("jobMatch.result.optimizeCv")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled={isGeneratingCoverLetter}
            onClick={onGenerateCoverLetter}
          >
            {isGeneratingCoverLetter && <Loader2 className="size-4 animate-spin" />}
            {t("aiTools.types.cover_letter")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
