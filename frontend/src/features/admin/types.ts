export interface UsageSummary {
  call_count: number
  total_tokens: number
  estimated_cost_usd: number
}

export interface AdminMetrics {
  total_users: number
  verified_users: number
  total_cv_documents: number
  total_cv_analyses: number
  total_job_descriptions: number
  total_job_matches: number
  total_ai_outputs: number
  ai_usage_last_24h: UsageSummary
  ai_usage_last_7d: UsageSummary
  ai_usage_last_30d: UsageSummary
  ai_usage_by_feature_last_30d: Record<string, UsageSummary>
}
