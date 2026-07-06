import {
  Contact,
  DollarSign,
  FileEdit,
  ListChecks,
  Mail,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react"

import type { AIOutputType } from "../types/rewrite"

/** AiToolsPanel (CV geçmişi) ve Dashboard (Son AI İşlemleri) arasında paylaşılan
 * tek ikon eşlemesi — çıktı tipi ikonu her yerde aynı kalsın diye tek yerden yönetilir. */
export const OUTPUT_TYPE_ICONS: Record<AIOutputType, LucideIcon> = {
  summary_rewrite: FileEdit,
  experience_rewrite: ListChecks,
  skills_rewrite: Sparkles,
  ats_optimization: Target,
  cover_letter: Mail,
  linkedin_summary: Contact,
  ats_keyword_insertion: Sparkles,
  interview_prep: Contact,
  salary_estimation: DollarSign,
}
