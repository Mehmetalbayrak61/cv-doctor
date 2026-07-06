import { isAxiosError } from "axios"
import { ArrowLeft, FileSearch, Lightbulb, Loader2, Tags, ThumbsDown, ThumbsUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { AtsScoreCard } from "./components/ats-score-card"
import { InterviewPrepCard } from "./components/interview-prep-card"
import { JobAiHistoryTimeline } from "./components/job-ai-history-timeline"
import { JobAiToolsGrid } from "./components/job-ai-tools-grid"
import { MatchHero } from "./components/match-hero"
import { SalaryEstimateCard } from "./components/salary-estimate-card"
import { SkillMatchCard } from "./components/skill-match-card"
import { useCreateMatch, useLatestMatch } from "./hooks/use-job-match"
import { useGenerateJobCoverLetter, useJobAiOutputs, useOptimizeKeywords } from "./hooks/use-job-tools"
import { useJob } from "./hooks/use-jobs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BadgeListCard } from "@/features/cv-analysis/components/badge-list-card"
import { InsightListCard } from "@/features/cv-analysis/components/insight-list-card"
import type { AIOutput } from "@/features/cv-analysis/types/rewrite"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useCv } from "@/features/dashboard/hooks/use-cvs"
import { getAiOutputUrl } from "@/lib/ai-output-url"
import { getApiErrorMessage, showAiErrorToast } from "@/lib/api-error"

export function MatchResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { jobId = "", cvId = "" } = useParams()

  const jobQuery = useJob(jobId)
  const cvQuery = useCv(cvId)
  const matchQuery = useLatestMatch(jobId, cvId)
  const matchMutation = useCreateMatch(jobId, cvId)
  const outputsQuery = useJobAiOutputs(jobId, cvId)

  const optimizeMutation = useOptimizeKeywords(jobId, cvId)
  const coverLetterMutation = useGenerateJobCoverLetter(jobId, cvId)

  const hasNoMatchYet = isAxiosError(matchQuery.error) && matchQuery.error.response?.status === 404
  const isCompleted = matchQuery.data?.status === "completed" && !!matchQuery.data.result

  function goToOutput(output: AIOutput) {
    navigate(getAiOutputUrl(cvId, output.id, jobId))
  }

  function runMatch() {
    matchMutation.mutate(undefined, {
      onError: (error) => toast.error(getApiErrorMessage(error, t("errors.generic"))),
    })
  }

  function handleOptimizeCv() {
    optimizeMutation.mutate(undefined, {
      onSuccess: goToOutput,
      onError: (error) => showAiErrorToast(error, t("errors.generic")),
    })
  }

  function handleGenerateCoverLetter() {
    coverLetterMutation.mutate(undefined, {
      onSuccess: goToOutput,
      onError: (error) => showAiErrorToast(error, t("errors.generic")),
    })
  }

  const latestSalaryOutput = outputsQuery.data?.find((o) => o.output_type === "salary_estimation")
  const latestInterviewOutput = outputsQuery.data?.find((o) => o.output_type === "interview_prep")

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-6 py-10 lg:px-10">
      <Link
        to="/jobs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        {t("common.back")}
      </Link>

      {(jobQuery.isPending || cvQuery.isPending) && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-wrap items-center justify-between gap-8 py-7">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <Skeleton className="size-28 rounded-full" />
          </CardContent>
        </Card>
      )}

      {(jobQuery.isError || cvQuery.isError) && <ErrorState title={t("jobMatch.result.notFound")} />}

      {jobQuery.data && cvQuery.data && isCompleted && matchQuery.data && (
        <>
          <MatchHero
            job={jobQuery.data}
            cv={cvQuery.data}
            match={matchQuery.data}
            onOptimizeCv={handleOptimizeCv}
            isOptimizing={optimizeMutation.isPending}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            isGeneratingCoverLetter={coverLetterMutation.isPending}
            onRematch={runMatch}
            isRematching={matchMutation.isPending}
          />

          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <div className="space-y-6 lg:col-span-2">
              <div className="grid gap-6 sm:grid-cols-2">
                <InsightListCard
                  icon={ThumbsUp}
                  tone="success"
                  title={t("jobMatch.result.strengths")}
                  items={matchQuery.data.result?.strengths ?? []}
                />
                <InsightListCard
                  icon={ThumbsDown}
                  tone="destructive"
                  title={t("jobMatch.result.weaknesses")}
                  items={matchQuery.data.result?.weaknesses ?? []}
                />
              </div>

              <SkillMatchCard
                matchedSkills={matchQuery.data.result?.matched_skills ?? []}
                missingSkills={matchQuery.data.result?.missing_skills ?? []}
                skillGap={matchQuery.data.result?.skill_gap ?? []}
              />

              <BadgeListCard
                icon={Tags}
                variant="outline"
                title={t("jobMatch.result.missingKeywords")}
                items={matchQuery.data.result?.missing_keywords ?? []}
              />

              <InsightListCard
                icon={Lightbulb}
                numbered
                title={t("jobMatch.result.recommendations")}
                items={matchQuery.data.result?.recommendations ?? []}
              />

              <AtsScoreCard
                score={matchQuery.data.result?.ats_match_score ?? 0}
                missingKeywordsCount={matchQuery.data.result?.missing_keywords.length ?? 0}
                onOptimize={handleOptimizeCv}
                isOptimizing={optimizeMutation.isPending}
              />

              <SalaryEstimateCard jobId={jobId} cvId={cvId} latestOutput={latestSalaryOutput} />

              <InterviewPrepCard jobId={jobId} cvId={cvId} latestOutput={latestInterviewOutput} />

              <JobAiToolsGrid
                onOptimizeCv={handleOptimizeCv}
                isOptimizing={optimizeMutation.isPending}
                onGenerateCoverLetter={handleGenerateCoverLetter}
                isGeneratingCoverLetter={coverLetterMutation.isPending}
              />
            </div>

            <div className="lg:sticky lg:top-20">
              <JobAiHistoryTimeline jobId={jobId} cvId={cvId} />
            </div>
          </div>
        </>
      )}

      {jobQuery.data && cvQuery.data && matchQuery.isPending && (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      )}

      {jobQuery.data && cvQuery.data && hasNoMatchYet && (
        <EmptyState
          icon={FileSearch}
          title={t("jobMatch.result.emptyTitle")}
          description={t("jobMatch.result.emptyDescription")}
          action={
            <Button onClick={runMatch} disabled={matchMutation.isPending}>
              {matchMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("jobMatch.result.matchNow")}
            </Button>
          }
        />
      )}

      {jobQuery.data && cvQuery.data && matchQuery.isError && !hasNoMatchYet && (
        <ErrorState
          title={t("jobMatch.result.errorTitle")}
          retryLabel={t("common.retry")}
          onRetry={() => matchQuery.refetch()}
        />
      )}

      {jobQuery.data && cvQuery.data && matchQuery.data?.status === "failed" && (
        <Alert variant="destructive">
          <AlertTitle>{t("jobMatch.result.failedTitle")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{matchQuery.data.error_message ?? t("errors.generic")}</p>
            <Button size="sm" variant="outline" onClick={runMatch} disabled={matchMutation.isPending}>
              {matchMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("jobMatch.result.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </section>
  )
}
