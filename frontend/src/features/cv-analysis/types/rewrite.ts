export type AIOutputType =
  | "summary_rewrite"
  | "experience_rewrite"
  | "skills_rewrite"
  | "ats_optimization"
  | "cover_letter"
  | "linkedin_summary"
  | "ats_keyword_insertion"
  | "interview_prep"
  | "salary_estimation"

export interface AIOutput {
  id: string
  cv_document_id: string
  job_description_id: string | null
  output_type: AIOutputType
  content: string
  input_context: Record<string, unknown> | null
  created_at: string
}

export interface CoverLetterRequest {
  job_title: string
  company_name?: string
  job_description?: string
}

export interface AtsOptimizeRequest {
  target_job_title?: string
}
