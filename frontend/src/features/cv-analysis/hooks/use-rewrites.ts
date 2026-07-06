import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  atsOptimize,
  generateCoverLetter,
  generateLinkedinSummary,
  listAiOutputs,
  rewriteExperience,
  rewriteSkills,
  rewriteSummary,
} from "../api/rewrite-api"
import type { AtsOptimizeRequest, CoverLetterRequest } from "../types/rewrite"

const aiOutputKeys = {
  list: (cvId: string) => ["cvs", cvId, "ai-outputs"] as const,
}

export function useAiOutputs(cvId: string) {
  return useQuery({
    queryKey: aiOutputKeys.list(cvId),
    queryFn: () => listAiOutputs(cvId),
    enabled: !!cvId,
  })
}

function useInvalidateOnSuccess(cvId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: aiOutputKeys.list(cvId) })
}

export function useRewriteSummary(cvId: string) {
  const onSuccess = useInvalidateOnSuccess(cvId)
  return useMutation({ mutationFn: () => rewriteSummary(cvId), onSuccess })
}

export function useRewriteExperience(cvId: string) {
  const onSuccess = useInvalidateOnSuccess(cvId)
  return useMutation({ mutationFn: () => rewriteExperience(cvId), onSuccess })
}

export function useRewriteSkills(cvId: string) {
  const onSuccess = useInvalidateOnSuccess(cvId)
  return useMutation({ mutationFn: () => rewriteSkills(cvId), onSuccess })
}

export function useAtsOptimize(cvId: string) {
  const onSuccess = useInvalidateOnSuccess(cvId)
  return useMutation({
    mutationFn: (payload: AtsOptimizeRequest) => atsOptimize(cvId, payload),
    onSuccess,
  })
}

export function useGenerateCoverLetter(cvId: string) {
  const onSuccess = useInvalidateOnSuccess(cvId)
  return useMutation({
    mutationFn: (payload: CoverLetterRequest) => generateCoverLetter(cvId, payload),
    onSuccess,
  })
}

export function useGenerateLinkedinSummary(cvId: string) {
  const onSuccess = useInvalidateOnSuccess(cvId)
  return useMutation({ mutationFn: () => generateLinkedinSummary(cvId), onSuccess })
}
