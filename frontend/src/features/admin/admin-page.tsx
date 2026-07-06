import { Briefcase, CheckCircle2, FileStack, FileText, Target, Users } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Navigate } from "react-router-dom"

import { StatCard } from "./components/stat-card"
import { UsageSummaryRow } from "./components/usage-summary-row"
import { useAdminMetrics } from "./hooks/use-admin-metrics"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/error-state"

function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-muted/40 h-[72px] animate-pulse rounded-lg" />
      ))}
    </div>
  )
}

export function AdminPage() {
  const { t } = useTranslation()
  const { user, isLoadingUser } = useAuth()
  const { data, isPending, isError, refetch } = useAdminMetrics()

  if (!isLoadingUser && user && !user.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <section className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div>
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("admin.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("admin.subtitle")}</p>
      </div>

      {isPending && <StatGridSkeleton />}

      {isError && (
        <ErrorState
          title={t("admin.errorTitle")}
          retryLabel={t("common.retry")}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard icon={Users} label={t("admin.stats.totalUsers")} value={data.total_users} />
            <StatCard
              icon={CheckCircle2}
              label={t("admin.stats.verifiedUsers")}
              value={data.verified_users}
            />
            <StatCard
              icon={FileStack}
              label={t("admin.stats.totalCvs")}
              value={data.total_cv_documents}
            />
            <StatCard
              icon={FileText}
              label={t("admin.stats.totalAnalyses")}
              value={data.total_cv_analyses}
            />
            <StatCard
              icon={Briefcase}
              label={t("admin.stats.totalJobs")}
              value={data.total_job_descriptions}
            />
            <StatCard
              icon={Target}
              label={t("admin.stats.totalMatches")}
              value={data.total_job_matches}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("admin.usage.title")}</CardTitle>
            </CardHeader>
            <CardContent className="divide-border divide-y">
              <UsageSummaryRow label={t("admin.usage.last24h")} usage={data.ai_usage_last_24h} />
              <UsageSummaryRow label={t("admin.usage.last7d")} usage={data.ai_usage_last_7d} />
              <UsageSummaryRow label={t("admin.usage.last30d")} usage={data.ai_usage_last_30d} />
            </CardContent>
          </Card>

          {Object.keys(data.ai_usage_by_feature_last_30d).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.usage.byFeature")}</CardTitle>
              </CardHeader>
              <CardContent className="divide-border divide-y">
                {Object.entries(data.ai_usage_by_feature_last_30d).map(([feature, usage]) => (
                  <UsageSummaryRow key={feature} label={feature} usage={usage} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </section>
  )
}
