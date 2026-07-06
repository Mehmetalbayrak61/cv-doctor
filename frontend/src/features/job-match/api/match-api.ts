import { apiClient } from "@/lib/api-client"

import type { JobMatch, JobMatchHistoryItem } from "../types"

export async function createMatch(jobId: string, cvId: string): Promise<JobMatch> {
  const { data } = await apiClient.post<JobMatch>(`/jobs/${jobId}/match/${cvId}`)
  return data
}

export async function getLatestMatch(jobId: string, cvId: string): Promise<JobMatch> {
  const { data } = await apiClient.get<JobMatch>(`/jobs/${jobId}/match/${cvId}`)
  return data
}

export async function listMatchHistory(): Promise<JobMatchHistoryItem[]> {
  const { data } = await apiClient.get<JobMatchHistoryItem[]>("/jobs/matches")
  return data
}
