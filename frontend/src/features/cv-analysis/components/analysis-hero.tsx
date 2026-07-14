import { FileText, Loader2, RefreshCcw } from "lucide-react"
import { useTranslation } from "react-i18next"

import { getScoreTier, scoreTierMeta } from "../lib/score-status"
import type { CVAnalysis, CVDocument } from "@/features/dashboard/types"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDate, formatFileSize } from "@/lib/format"
import { cn } from "@/lib/utils"

interface AnalysisHeroProps {
  cv: CVDocument
  analysis?: CVAnalysis
  onReanalyze: () => void
  isReanalyzing: boolean
}

const TIER_TONE = {
  good: "success",
  warning: "warning",
  critical: "destructive",
} as const

/** Dosya bağlamı ve iki ana skor. Tekrar analiz ikincil aksiyondur; kullanıcının
 * asıl işi aşağıdaki öncelikli sorunları çözmektir. */
export function AnalysisHero({ cv, analysis, onReanalyze, isReanalyzing }: AnalysisHeroProps) {
  const { t, i18n } = useTranslation()
  const result = analysis?.result

  return (
    <Card elevation="raised">
      <CardContent className="space-y-6 py-6 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="bg-accent text-primary flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12">
              <FileText className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{cv.file_name}</h1>
              <p className="text-muted-foreground/80 mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span>
                  {formatFileSize(cv.file_size)} · {formatDate(cv.created_at, i18n.language)}
                </span>
                {analysis && <Badge variant="outline">v{analysis.version}</Badge>}
              </p>
            </div>
          </div>

        {analysis && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isReanalyzing}>
                {isReanalyzing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCcw className="size-4" />
                )}
                {isReanalyzing ? t("analysis.analyzing") : t("analysis.reanalyze")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("analysis.reanalyzeConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("analysis.reanalyzeConfirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onReanalyze}>
                  {t("analysis.reanalyzeConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        </div>

        {result && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: t("analysis.overallScore"),
                description: t("analysis.overallScoreDescription"),
                score: result.overall_score,
              },
              {
                label: t("analysis.atsScore"),
                description: t("analysis.atsScoreDescription"),
                score: result.ats_score,
              },
            ].map(({ label, description, score }) => {
              const tier = getScoreTier(score)
              const meta = scoreTierMeta[tier]
              const TierIcon = meta.icon

              return (
                <div key={label} className="bg-muted/40 rounded-xl border p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-mono text-3xl font-bold tabular-nums", meta.textClass)}>
                        {score}<span className="text-muted-foreground text-sm font-medium">/100</span>
                      </p>
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium", meta.textClass)}>
                        <TierIcon className="size-3.5" />
                        {t(`analysis.scoreStatus.${tier}`)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    aria-label={`${label}: ${score}/100`}
                    className={cn("mt-4", meta.trackClass)}
                    value={score}
                    tone={TIER_TONE[tier]}
                  />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
