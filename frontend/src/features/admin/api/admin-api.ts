import { apiClient } from "@/lib/api-client"

import type { AdminMetrics } from "../types"

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const { data } = await apiClient.get<AdminMetrics>("/admin/metrics")
  return data
}
