export type AnalysisStatus = "pending" | "completed" | "failed"

export interface CVDocument {
  id: string
  file_name: string
  file_size: number
  mime_type: string
  created_at: string
}

export interface CVDocumentListResponse {
  items: CVDocument[]
  total: number
}

export interface QualityAssessment {
  score: number
  comment: string
}

export interface ScoreCriterion {
  key: string
  label: string
  score: number
  weight: number
  findings: string[]
}

export interface CVAnalysisResult {
  overall_score: number
  ats_score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  missing_keywords: string[]
  improvement_suggestions: string[]
  corrected_profile_summary: string
  suggested_job_titles: string[]
  language_quality: QualityAssessment
  section_quality: QualityAssessment
  experience_quality: QualityAssessment
  education_quality: QualityAssessment
  skills_quality: QualityAssessment
  scoring_method: string
  ats_breakdown: ScoreCriterion[]
  overall_breakdown: ScoreCriterion[]
}

export interface CVAnalysis {
  id: string
  cv_document_id: string
  version: number
  status: AnalysisStatus
  result: CVAnalysisResult | null
  error_message: string | null
  created_at: string
}
