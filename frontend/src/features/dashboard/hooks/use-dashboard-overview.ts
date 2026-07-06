import { useQueries, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { getCvAnalysis, listCvs } from "../api/cv-api"
import type { CVAnalysis, CVDocument } from "../types"
import { cvKeys } from "./use-cvs"
import { listAiOutputs } from "@/features/cv-analysis/api/rewrite-api"
import type { AIOutput, AIOutputType } from "@/features/cv-analysis/types/rewrite"
import { listMatchHistory } from "@/features/job-match/api/match-api"
import { matchKeys } from "@/features/job-match/hooks/use-job-match"

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
  aiUsageCount: number
  recentAnalyses: RecentAnalysis[]
  recentActivity: RecentActivityItem[]
  activityLast7Days: number
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function aiOutputsKey(cvId: string) {
  return ["cvs", cvId, "ai-outputs"] as const
}

/**
 * Dashboard genel bakış sayfası için mevcut uç noktaların istemci tarafında
 * birleştirilmesi — yeni bir "özet" endpoint'i yok (bkz. Faz mimarisi kararı).
 * CV listesi + her CV için analiz/ai-output çağrıları paralel (useQueries) atılır;
 * bu sorgular CV detay sayfasıyla AYNI query key'leri kullanır, dolayısıyla
 * kullanıcı oradan buraya geçtiğinde önbellek paylaşılır, tekrar istek atılmaz.
 */
export function useDashboardOverview() {
  const cvListQuery = useQuery({ queryKey: cvKeys.list(), queryFn: listCvs })
  const cvs = useMemo(() => cvListQuery.data?.items ?? [], [cvListQuery.data])

  const analysisQueries = useQueries({
    queries: cvs.map((cv) => ({
      queryKey: cvKeys.analysis(cv.id),
      queryFn: () => getCvAnalysis(cv.id),
      retry: false,
      enabled: cvListQuery.isSuccess,
    })),
  })

  const aiOutputQueries = useQueries({
    queries: cvs.map((cv) => ({
      queryKey: aiOutputsKey(cv.id),
      queryFn: () => listAiOutputs(cv.id),
      enabled: cvListQuery.isSuccess,
    })),
  })

  const matchHistoryQuery = useQuery({ queryKey: matchKeys.history(), queryFn: listMatchHistory })

  const perCvQueriesSettled =
    cvs.length === 0 ||
    (analysisQueries.every((q) => !q.isPending) && aiOutputQueries.every((q) => !q.isPending))

  const isPending = cvListQuery.isPending || matchHistoryQuery.isPending || !perCvQueriesSettled
  const isError = cvListQuery.isError || matchHistoryQuery.isError

  const data = useMemo<DashboardOverviewData | undefined>(() => {
    if (isPending || isError || !matchHistoryQuery.data) return undefined

    const recentAnalyses: RecentAnalysis[] = cvs
      .map((cv, index) => ({ cv, analysis: analysisQueries[index]?.data }))
      .filter(
        (item): item is RecentAnalysis =>
          item.analysis?.status === "completed" && !!item.analysis.result
      )
      .sort((a, b) => new Date(b.analysis.created_at).getTime() - new Date(a.analysis.created_at).getTime())

    const latest = recentAnalyses[0]

    const recentActivity: RecentActivityItem[] = cvs
      .flatMap((cv, index) =>
        (aiOutputQueries[index]?.data ?? []).map((output: AIOutput) => ({
          id: output.id,
          cvId: cv.id,
          cvFileName: cv.file_name,
          outputType: output.output_type,
          createdAt: output.created_at,
        }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const now = Date.now()
    const activityLast7Days = recentActivity.filter(
      (item) => now - new Date(item.createdAt).getTime() < SEVEN_DAYS_MS
    ).length

    const latestCv = [...cvs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    return {
      hasAnyCv: cvs.length > 0,
      totalCvs: cvs.length,
      latestCvId: latestCv?.id ?? null,
      overallScore: latest?.analysis.result?.overall_score ?? null,
      atsScore: latest?.analysis.result?.ats_score ?? null,
      jobMatchCount: matchHistoryQuery.data.length,
      aiUsageCount: recentActivity.length,
      recentAnalyses: recentAnalyses.slice(0, 4),
      recentActivity: recentActivity.slice(0, 6),
      activityLast7Days,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, isError, cvs, matchHistoryQuery.data, analysisQueries, aiOutputQueries])

  return {
    data,
    isPending,
    isError,
    refetch: () => {
      cvListQuery.refetch()
      matchHistoryQuery.refetch()
    },
  }
}
