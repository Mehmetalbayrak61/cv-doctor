import type { AIOutput } from "@/features/cv-analysis/types/rewrite"
import { apiClient } from "@/lib/api-client"

import type { SalaryEstimationRequest } from "../types"

export async function optimizeKeywords(jobId: string, cvId: string): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/jobs/${jobId}/optimize-keywords/${cvId}`)
  return data
}

export async function generateJobCoverLetter(jobId: string, cvId: string): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/jobs/${jobId}/cover-letter/${cvId}`)
  return data
}

export async function generateInterviewPrep(jobId: string, cvId: string): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/jobs/${jobId}/interview-prep/${cvId}`)
  return data
}

export async function estimateSalary(
  jobId: string,
  cvId: string,
  payload: SalaryEstimationRequest
): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/jobs/${jobId}/salary-estimate/${cvId}`, payload)
  return data
}

export async function listJobAiOutputs(jobId: string, cvId: string): Promise<AIOutput[]> {
  const { data } = await apiClient.get<AIOutput[]>(`/jobs/${jobId}/ai-outputs/${cvId}`)
  return data
}
