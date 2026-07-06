import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { analyzeCv, deleteCv, getCv, getCvAnalysis, listCvs, uploadCv } from "../api/cv-api"

export const cvKeys = {
  all: ["cvs"] as const,
  list: () => [...cvKeys.all, "list"] as const,
  detail: (id: string) => [...cvKeys.all, "detail", id] as const,
  analysis: (id: string) => [...cvKeys.all, "analysis", id] as const,
}

export function useCvList() {
  return useQuery({ queryKey: cvKeys.list(), queryFn: listCvs })
}

export function useCv(cvId: string) {
  return useQuery({ queryKey: cvKeys.detail(cvId), queryFn: () => getCv(cvId), enabled: !!cvId })
}

export function useUploadCv() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) =>
      uploadCv(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.list() })
    },
  })
}

export function useDeleteCv() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cvId: string) => deleteCv(cvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.list() })
    },
  })
}

export function useCvAnalysis(cvId: string) {
  return useQuery({
    queryKey: cvKeys.analysis(cvId),
    queryFn: () => getCvAnalysis(cvId),
    enabled: !!cvId,
    retry: false,
  })
}

export function useAnalyzeCv(cvId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => analyzeCv(cvId),
    onSuccess: (data) => {
      queryClient.setQueryData(cvKeys.analysis(cvId), data)
    },
  })
}
