from pydantic import BaseModel


class UsageSummary(BaseModel):
    call_count: int
    total_tokens: int
    estimated_cost_usd: float


class AdminMetrics(BaseModel):
    total_users: int
    verified_users: int
    total_cv_documents: int
    total_cv_analyses: int
    total_job_descriptions: int
    total_job_matches: int
    total_ai_outputs: int
    ai_usage_last_24h: UsageSummary
    ai_usage_last_7d: UsageSummary
    ai_usage_last_30d: UsageSummary
    ai_usage_by_feature_last_30d: dict[str, UsageSummary]
