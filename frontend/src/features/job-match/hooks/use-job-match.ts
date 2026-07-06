import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createMatch, getLatestMatch, listMatchHistory } from "../api/match-api"

export const matchKeys = {
  all: ["job-matches"] as const,
  latest: (jobId: string, cvId: string) => [...matchKeys.all, "latest", jobId, cvId] as const,
  history: () => [...matchKeys.all, "history"] as const,
}

export function useLatestMatch(jobId: string, cvId: string) {
  return useQuery({
    queryKey: matchKeys.latest(jobId, cvId),
    queryFn: () => getLatestMatch(jobId, cvId),
    enabled: !!jobId && !!cvId,
    retry: false,
  })
}

export function useMatchHistory() {
  return useQuery({ queryKey: matchKeys.history(), queryFn: listMatchHistory })
}

export function useCreateMatch(jobId: string, cvId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => createMatch(jobId, cvId),
    onSuccess: (match) => {
      queryClient.setQueryData(matchKeys.latest(jobId, cvId), match)
      queryClient.invalidateQueries({ queryKey: matchKeys.history() })
    },
  })
}
