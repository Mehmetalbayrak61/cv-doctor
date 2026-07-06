import { useTranslation } from "react-i18next"

import { AiSuggestions } from "./components/overview/ai-suggestions"
import { KpiGrid } from "./components/overview/kpi-grid"
import { OverviewEmptyState } from "./components/overview/overview-empty-state"
import { OverviewSkeleton } from "./components/overview/overview-skeleton"
import { QuickActions } from "./components/overview/quick-actions"
import { RecentActivityTimeline } from "./components/overview/recent-activity-timeline"
import { RecentAnalyses } from "./components/overview/recent-analyses"
import { WelcomeHeader } from "./components/overview/welcome-header"
import { useDashboardOverview } from "./hooks/use-dashboard-overview"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ErrorState } from "@/components/error-state"

export function OverviewPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data, isPending, isError, refetch } = useDashboardOverview()

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-10">
      {isPending && <OverviewSkeleton />}

      {isError && (
        <ErrorState
          title={t("overview.errorTitle")}
          retryLabel={t("common.retry")}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <>
          <WelcomeHeader firstName={user?.first_name} activityLast7Days={data.activityLast7Days} />

          {!data.hasAnyCv ? (
            <OverviewEmptyState />
          ) : (
            <>
              <KpiGrid
                overallScore={data.overallScore}
                atsScore={data.atsScore}
                jobMatchCount={data.jobMatchCount}
                aiUsageCount={data.aiUsageCount}
              />

              <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr] lg:items-start">
                <div className="space-y-8">
                  {data.recentAnalyses.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-sm font-semibold">{t("overview.recentAnalyses")}</h2>
                      </div>
                      <RecentAnalyses items={data.recentAnalyses} />
                    </div>
                  )}

                  {data.recentActivity.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-sm font-semibold">{t("overview.recentActivity")}</h2>
                      <RecentActivityTimeline items={data.recentActivity} />
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <QuickActions latestCvId={data.latestCvId} />
                  <AiSuggestions data={data} />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
