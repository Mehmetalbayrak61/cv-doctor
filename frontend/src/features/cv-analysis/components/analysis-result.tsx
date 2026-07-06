import { Briefcase, Lightbulb, Tags, ThumbsDown, ThumbsUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AiHistoryTimeline } from "./ai-history-timeline"
import { AiToolsGrid } from "./ai-tools-grid"
import { AiVerdictCard } from "./ai-verdict-card"
import { BadgeListCard } from "./badge-list-card"
import { InsightListCard } from "./insight-list-card"
import { ProfileSummaryEditor } from "./profile-summary-editor"
import { QualityCard } from "./quality-card"
import type { CVAnalysisResult } from "@/features/dashboard/types"

interface AnalysisResultProps {
  cvId: string
  result: CVAnalysisResult
}

/** Sonuçların gövdesi: sol tarafta ana içerik akışı (yıldız kart → araçlar →
 * içgörüler → kalite → editör), sağda yapışkan "AI Geçmişi" rayı. Skor
 * halkaları ve dosya/CV üst bilgisi artık burada değil — AnalysisHero'da. */
export function AnalysisResult({ cvId, result }: AnalysisResultProps) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      <div className="space-y-6 lg:col-span-2">
        <AiVerdictCard summary={result.summary} />

        <AiToolsGrid cvId={cvId} atsScore={result.ats_score} />

        <div className="grid gap-6 sm:grid-cols-2">
          <InsightListCard
            icon={ThumbsUp}
            tone="success"
            title={t("analysis.strengths")}
            items={result.strengths}
          />
          <InsightListCard
            icon={ThumbsDown}
            tone="destructive"
            title={t("analysis.weaknesses")}
            items={result.weaknesses}
          />
        </div>

        <InsightListCard
          icon={Lightbulb}
          numbered
          title={t("analysis.improvementSuggestions")}
          items={result.improvement_suggestions}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <BadgeListCard
            icon={Tags}
            variant="outline"
            title={t("analysis.missingKeywords")}
            items={result.missing_keywords}
          />
          <BadgeListCard
            icon={Briefcase}
            title={t("analysis.suggestedJobTitles")}
            items={result.suggested_job_titles}
          />
        </div>

        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">
            {t("analysis.qualityBreakdown")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <QualityCard label={t("analysis.languageQuality")} quality={result.language_quality} />
            <QualityCard label={t("analysis.sectionQuality")} quality={result.section_quality} />
            <QualityCard
              label={t("analysis.experienceQuality")}
              quality={result.experience_quality}
            />
            <QualityCard label={t("analysis.educationQuality")} quality={result.education_quality} />
            <QualityCard label={t("analysis.skillsQuality")} quality={result.skills_quality} />
          </div>
        </div>

        <ProfileSummaryEditor content={result.corrected_profile_summary} />
      </div>

      <div className="lg:sticky lg:top-20">
        <AiHistoryTimeline cvId={cvId} />
      </div>
    </div>
  )
}
