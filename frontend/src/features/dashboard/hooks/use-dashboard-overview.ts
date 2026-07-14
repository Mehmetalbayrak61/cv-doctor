import { useQuery } from "@tanstack/react-query"

import type { CVAnalysis, CVDocument } from "../types"
import type { AIOutputType } from "@/features/cv-analysis/types/rewrite"
import { apiClient } from "@/lib/api-client"

export interface RecentAnalysis {
  cv: CVDocument
  analysis: CVAnalysis
}

export interface RecentActivityItem {
  id: string
  cvId: string
  cvFileName: string
  outputType: AIOutputType
  createdAt: string
}

export interface DashboardOverviewData {
  hasAnyCv: boolean
  totalCvs: number
  latestCvId: string | null
  overallScore: number | null
  atsScore: number | null
  jobMatchCount: number
  recentAnalyses: RecentAnalysis[]
  recentActivity: RecentActivityItem[]
  activityLast7Days: number
}

interface DashboardOverviewResponse {
  has_any_cv: boolean
  total_cvs: number
  latest_cv_id: string | null
  overall_score: number | null
  ats_score: number | null
  job_match_count: number
  recent_analyses: RecentAnalysis[]
  recent_activity: Array<{
    id: string
    cv_id: string
    cv_file_name: string
    output_type: AIOutputType
    created_at: string
  }>
  activity_last_7_days: number
}

async function getDashboardOverview(): Promise<DashboardOverviewData> {
  const { data } = await apiClient.get<DashboardOverviewResponse>("/dashboard/overview")
  return {
    hasAnyCv: data.has_any_cv,
    totalCvs: data.total_cvs,
    latestCvId: data.latest_cv_id,
    overallScore: data.overall_score,
    atsScore: data.ats_score,
    jobMatchCount: data.job_match_count,
    recentAnalyses: data.recent_analyses,
    recentActivity: data.recent_activity.map((item) => ({
      id: item.id,
      cvId: item.cv_id,
      cvFileName: item.cv_file_name,
      outputType: item.output_type,
      createdAt: item.created_at,
    })),
    activityLast7Days: data.activity_last_7_days,
  }
}

export function useDashboardOverview() {
  const query = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
  })

  return {
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  }
}
