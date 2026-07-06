import { Briefcase, Target } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { CvPickerDialog } from "./components/cv-picker-dialog"
import { JobAddCard } from "./components/job-add-card"
import { JobCard } from "./components/job-card"
import { JobEditDialog } from "./components/job-edit-dialog"
import { RecentMatches } from "./components/recent-matches"
import { useMatchHistory } from "./hooks/use-job-match"
import { useJobList } from "./hooks/use-jobs"
import type { JobDescription, JobMatchHistoryItem } from "./types"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { Skeleton } from "@/components/ui/skeleton"

const RECENT_MATCHES_LIMIT = 4

export function JobMatchPage() {
  const { t } = useTranslation()
  const jobsQuery = useJobList()
  const matchHistoryQuery = useMatchHistory()

  const [addOpen, setAddOpen] = useState(false)
  const [matchTarget, setMatchTarget] = useState<JobDescription | null>(null)
  const [editTarget, setEditTarget] = useState<JobDescription | null>(null)
  const addCardRef = useRef<HTMLDivElement>(null)

  const latestMatchByJob = useMemo(() => {
    const map = new Map<string, JobMatchHistoryItem>()
    for (const match of matchHistoryQuery.data ?? []) {
      if (!map.has(match.job_description_id)) map.set(match.job_description_id, match)
    }
    return map
  }, [matchHistoryQuery.data])

  function focusAddCard() {
    setAddOpen(true)
    addCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium tracking-tight">{t("jobMatch.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("jobMatch.subtitle")}</p>
        </div>
        <Button size="lg" onClick={focusAddCard}>
          {t("jobMatch.addJob")}
        </Button>
      </div>

      <div ref={addCardRef}>
        <JobAddCard open={addOpen} onOpenChange={setAddOpen} />
      </div>

      {jobsQuery.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {jobsQuery.isError && (
        <ErrorState
          title={t("jobMatch.list.errorTitle")}
          retryLabel={t("common.retry")}
          onRetry={() => jobsQuery.refetch()}
        />
      )}

      {jobsQuery.data && jobsQuery.data.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title={t("jobMatch.list.emptyTitle")}
          description={t("jobMatch.list.emptyDescription")}
          action={<Button onClick={focusAddCard}>{t("jobMatch.addJob")}</Button>}
        />
      )}

      {jobsQuery.data && jobsQuery.data.length > 0 && (
        <>
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="text-primary size-4" />
              {t("jobMatch.list.heading")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobsQuery.data.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  latestMatch={latestMatchByJob.get(job.id)}
                  onMatch={setMatchTarget}
                  onEdit={setEditTarget}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Target className="text-primary size-4" />
              {t("jobMatch.history.heading")}
            </h2>
            {matchHistoryQuery.isPending ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            ) : (
              <RecentMatches items={(matchHistoryQuery.data ?? []).slice(0, RECENT_MATCHES_LIMIT)} />
            )}
          </div>
        </>
      )}

      <CvPickerDialog job={matchTarget} onOpenChange={(open) => !open && setMatchTarget(null)} />
      <JobEditDialog job={editTarget} onOpenChange={(open) => !open && setEditTarget(null)} />
    </section>
  )
}
