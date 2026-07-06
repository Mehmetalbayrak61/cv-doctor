import { apiClient } from "@/lib/api-client"

import type { CVAnalysis, CVDocument, CVDocumentListResponse } from "../types"

export async function listCvs(): Promise<CVDocumentListResponse> {
  const { data } = await apiClient.get<CVDocumentListResponse>("/cvs")
  return data
}

export async function getCv(cvId: string): Promise<CVDocument> {
  const { data } = await apiClient.get<CVDocument>(`/cvs/${cvId}`)
  return data
}

export async function uploadCv(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CVDocument> {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await apiClient.post<CVDocument>("/cvs", formData, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    },
  })
  return data
}

export async function deleteCv(cvId: string): Promise<void> {
  await apiClient.delete(`/cvs/${cvId}`)
}

export async function analyzeCv(cvId: string): Promise<CVAnalysis> {
  const { data } = await apiClient.post<CVAnalysis>(`/cvs/${cvId}/analyze`)
  return data
}

export async function getCvAnalysis(cvId: string): Promise<CVAnalysis> {
  const { data } = await apiClient.get<CVAnalysis>(`/cvs/${cvId}/analysis`)
  return data
}
