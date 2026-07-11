import { FileText, Loader2, RefreshCcw } from "lucide-react"
import { useTranslation } from "react-i18next"

import { ScoreRing } from "./score-ring"
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
import { formatDate, formatFileSize } from "@/lib/format"
import { cn } from "@/lib/utils"

interface AnalysisHeroProps {
  cv: CVDocument
  analysis?: CVAnalysis
  onReanalyze: () => void
  isReanalyzing: boolean
}

/** Ekranın açılış şeridi: dosya bilgisi kasıtlı olarak ikinci planda (küçük,
 * soluk), skorlar ilk bakışta dikkat çeken tek unsur. "Tekrar Analiz Et"
 * birincil (dolu) buton — bu ekranın en sık kullanılan eylemi. */
export function AnalysisHero({ cv, analysis, onReanalyze, isReanalyzing }: AnalysisHeroProps) {
  const { t, i18n } = useTranslation()
  const result = analysis?.result

  return (
    <Card elevation="raised">
      <CardContent className="flex flex-wrap items-center justify-between gap-8 py-7">
        <div className="flex min-w-0 items-center gap-4">
          <div className="bg-accent text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
            <FileText className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">{cv.file_name}</h1>
            <p className="text-muted-foreground/80 mt-1 flex items-center gap-2 text-xs">
              <span>
                {formatFileSize(cv.file_size)} · {formatDate(cv.created_at, i18n.language)}
              </span>
              {analysis && <Badge variant="outline">v{analysis.version}</Badge>}
            </p>
          </div>
        </div>

        {result && (
          <div className="flex gap-8">
            {[
              { label: t("analysis.overallScore"), score: result.overall_score },
              { label: t("analysis.atsScore"), score: result.ats_score },
            ].map(({ label, score }) => {
              const tier = getScoreTier(score)
              const meta = scoreTierMeta[tier]
              const TierIcon = meta.icon

              return (
                <div key={label} className="relative flex flex-col items-center gap-2">
                  <div
                    className="absolute top-0 -z-10 size-28 scale-[1.35] rounded-full opacity-70 blur-xl"
                    style={{
                      background: `radial-gradient(circle, color-mix(in oklch, ${meta.colorVar} 22%, transparent) 0%, transparent 72%)`,
                    }}
                  />
                  <ScoreRing label={label} score={score} size={112} hideStatus />
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold",
                      meta.trackClass,
                      meta.textClass
                    )}
                  >
                    <TierIcon className="size-3.5" />
                    {t(`analysis.scoreStatus.${tier}`)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {analysis && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" disabled={isReanalyzing}>
                {isReanalyzing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCcw className="size-4" />
                )}
                {t("analysis.reanalyze")}
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
      </CardContent>
    </Card>
  )
}
