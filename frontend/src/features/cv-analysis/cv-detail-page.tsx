import { isAxiosError } from "axios"
import { ArrowLeft, FileSearch, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"

import { AiToolsGrid } from "./components/ai-tools-grid"
import { AnalysisHero } from "./components/analysis-hero"
import { AnalysisResult } from "./components/analysis-result"
import { useAnalyzeCv, useCv, useCvAnalysis } from "@/features/dashboard/hooks/use-cvs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"

export function CvDetailPage() {
  const { t } = useTranslation()
  const { cvId = "" } = useParams()

  const cvQuery = useCv(cvId)
  const analysisQuery = useCvAnalysis(cvId)
  const analyzeMutation = useAnalyzeCv(cvId)

  const hasNoAnalysisYet = isAxiosError(analysisQuery.error) && analysisQuery.error.response?.status === 404
  const isCompleted = analysisQuery.data?.status === "completed" && !!analysisQuery.data.result

  function runAnalyze() {
    analyzeMutation.mutate(undefined, {
      onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
    })
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-6 py-10 lg:px-10">
      <Link
        to="/cvs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        {t("common.back")}
      </Link>

      {cvQuery.isPending && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-wrap items-center justify-between gap-8 py-7">
            <div className="flex min-w-0 items-center gap-4">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            </div>
            <div className="flex gap-8">
              <Skeleton className="size-28 rounded-full" />
              <Skeleton className="size-28 rounded-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {cvQuery.isError && (
        <ErrorState
          title={t("analysis.cvNotFound")}
          retryLabel={t("common.retry")}
          onRetry={() => cvQuery.refetch()}
        />
      )}

      {cvQuery.data && (
        <AnalysisHero
          cv={cvQuery.data}
          analysis={analysisQuery.data}
          onReanalyze={runAnalyze}
          isReanalyzing={analyzeMutation.isPending}
        />
      )}

      {cvQuery.data && isCompleted && analysisQuery.data?.result && (
        <AnalysisResult cvId={cvId} result={analysisQuery.data.result} />
      )}

      {cvQuery.data && !isCompleted && <AiToolsGrid cvId={cvId} />}

      {cvQuery.data && analysisQuery.isPending && (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      )}

      {cvQuery.data && hasNoAnalysisYet && (
        <EmptyState
          icon={FileSearch}
          title={t("analysis.emptyTitle")}
          description={t("analysis.emptyDescription")}
          action={
            <Button onClick={runAnalyze} disabled={analyzeMutation.isPending}>
              {analyzeMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("analysis.analyzeNow")}
            </Button>
          }
        />
      )}

      {cvQuery.data && analysisQuery.isError && !hasNoAnalysisYet && (
        <ErrorState
          title={t("analysis.errorTitle")}
          retryLabel={t("common.retry")}
          onRetry={() => analysisQuery.refetch()}
        />
      )}

      {cvQuery.data && analysisQuery.data?.status === "failed" && (
        <Alert variant="destructive">
          <AlertTitle>{t("analysis.failedTitle")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{analysisQuery.data.error_message ?? t("errors.generic")}</p>
            <Button size="sm" variant="outline" onClick={runAnalyze} disabled={analyzeMutation.isPending}>
              {analyzeMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("analysis.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}
