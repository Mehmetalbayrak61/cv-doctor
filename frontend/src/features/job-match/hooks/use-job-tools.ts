import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  estimateSalary,
  generateInterviewPrep,
  generateJobCoverLetter,
  listJobAiOutputs,
  optimizeKeywords,
} from "../api/job-tools-api"
import type { SalaryEstimationRequest } from "../types"

const jobOutputKeys = {
  list: (jobId: string, cvId: string) => ["jobs", jobId, "cvs", cvId, "ai-outputs"] as const,
}

export function useJobAiOutputs(jobId: string, cvId: string) {
  return useQuery({
    queryKey: jobOutputKeys.list(jobId, cvId),
    queryFn: () => listJobAiOutputs(jobId, cvId),
    enabled: !!jobId && !!cvId,
  })
}

function useInvalidateOnSuccess(jobId: string, cvId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: jobOutputKeys.list(jobId, cvId) })
}

export function useOptimizeKeywords(jobId: string, cvId: string) {
  const onSuccess = useInvalidateOnSuccess(jobId, cvId)
  return useMutation({ mutationFn: () => optimizeKeywords(jobId, cvId), onSuccess })
}

export function useGenerateJobCoverLetter(jobId: string, cvId: string) {
  const onSuccess = useInvalidateOnSuccess(jobId, cvId)
  return useMutation({ mutationFn: () => generateJobCoverLetter(jobId, cvId), onSuccess })
}

export function useGenerateInterviewPrep(jobId: string, cvId: string) {
  const onSuccess = useInvalidateOnSuccess(jobId, cvId)
  return useMutation({ mutationFn: () => generateInterviewPrep(jobId, cvId), onSuccess })
}

export function useEstimateSalary(jobId: string, cvId: string) {
  const onSuccess = useInvalidateOnSuccess(jobId, cvId)
  return useMutation({
    mutationFn: (payload: SalaryEstimationRequest) => estimateSalary(jobId, cvId, payload),
    onSuccess,
  })
}
