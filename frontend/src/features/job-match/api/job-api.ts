import { apiClient } from "@/lib/api-client"

import type { JobDescription, JobDescriptionCreate, JobDescriptionUpdate } from "../types"

export async function listJobs(): Promise<JobDescription[]> {
  const { data } = await apiClient.get<JobDescription[]>("/jobs")
  return data
}

export async function getJob(jobId: string): Promise<JobDescription> {
  const { data } = await apiClient.get<JobDescription>(`/jobs/${jobId}`)
  return data
}

export async function createJob(payload: JobDescriptionCreate): Promise<JobDescription> {
  const { data } = await apiClient.post<JobDescription>("/jobs", payload)
  return data
}

export async function updateJob(
  jobId: string,
  payload: JobDescriptionUpdate
): Promise<JobDescription> {
  const { data } = await apiClient.patch<JobDescription>(`/jobs/${jobId}`, payload)
  return data
}

export async function deleteJob(jobId: string): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}`)
}
