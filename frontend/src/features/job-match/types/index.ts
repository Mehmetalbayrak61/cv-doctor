export interface JobDescription {
  id: string
  title: string
  company: string | null
  location: string | null
  source: string | null
  description: string
  created_at: string
}

export interface JobDescriptionCreate {
  title: string
  company?: string
  location?: string
  source?: string
  description: string
}

export type JobDescriptionUpdate = Partial<JobDescriptionCreate>

export type MatchStatus = "pending" | "completed" | "failed"

export type SkillPriority = "low" | "medium" | "high"

export interface SkillGapItem {
  skill: string
  priority: SkillPriority
  estimated_learning_time: string
}

export interface JobMatchResult {
  compatibility_score: number
  ats_match_score: number
  matched_skills: string[]
  missing_skills: string[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  missing_keywords: string[]
  hiring_probability: number
  seniority_fit: string
  skill_gap: SkillGapItem[]
}

export interface JobMatch {
  id: string
  job_description_id: string
  cv_document_id: string
  status: MatchStatus
  result: JobMatchResult | null
  error_message: string | null
  created_at: string
}

export interface JobMatchHistoryItem extends JobMatch {
  job_title: string
  cv_file_name: string
}

export interface SalaryEstimationRequest {
  country?: string
  city?: string
}
