import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createJob, deleteJob, getJob, listJobs, updateJob } from "../api/job-api"
import type { JobDescriptionCreate, JobDescriptionUpdate } from "../types"

export const jobKeys = {
  all: ["jobs"] as const,
  list: () => [...jobKeys.all, "list"] as const,
  detail: (id: string) => [...jobKeys.all, "detail", id] as const,
}

export function useJobList() {
  return useQuery({ queryKey: jobKeys.list(), queryFn: listJobs })
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => getJob(jobId),
    enabled: !!jobId,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: JobDescriptionCreate) => createJob(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.list() }),
  })
}

export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: JobDescriptionUpdate) => updateJob(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.list() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) })
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.list() }),
  })
}
