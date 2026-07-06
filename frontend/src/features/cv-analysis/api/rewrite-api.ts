import { apiClient } from "@/lib/api-client"

import type { AIOutput, AtsOptimizeRequest, CoverLetterRequest } from "../types/rewrite"

export async function listAiOutputs(cvId: string): Promise<AIOutput[]> {
  const { data } = await apiClient.get<AIOutput[]>(`/cvs/${cvId}/ai-outputs`)
  return data
}

export async function rewriteSummary(cvId: string): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/cvs/${cvId}/rewrite-summary`)
  return data
}

export async function rewriteExperience(cvId: string): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/cvs/${cvId}/rewrite-experience`)
  return data
}

export async function rewriteSkills(cvId: string): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/cvs/${cvId}/rewrite-skills`)
  return data
}

export async function atsOptimize(cvId: string, payload: AtsOptimizeRequest): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/cvs/${cvId}/ats-optimize`, payload)
  return data
}

export async function generateCoverLetter(
  cvId: string,
  payload: CoverLetterRequest
): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/cvs/${cvId}/cover-letter`, payload)
  return data
}

export async function generateLinkedinSummary(cvId: string): Promise<AIOutput> {
  const { data } = await apiClient.post<AIOutput>(`/cvs/${cvId}/linkedin-summary`)
  return data
}
