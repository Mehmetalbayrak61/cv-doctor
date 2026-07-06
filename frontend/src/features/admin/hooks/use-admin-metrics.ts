import { useQuery } from "@tanstack/react-query"

import { fetchAdminMetrics } from "../api/admin-api"

export function useAdminMetrics() {
  return useQuery({ queryKey: ["admin", "metrics"], queryFn: fetchAdminMetrics })
}
