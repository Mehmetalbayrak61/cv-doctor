import { AlertTriangle, Briefcase, Lightbulb, ThumbsUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AiHistoryTimeline } from "./ai-history-timeline"
import { AiToolsGrid } from "./ai-tools-grid"
import { AiVerdictCard } from "./ai-verdict-card"
import { BadgeListCard } from "./badge-list-card"
import { InsightListCard } from "./insight-list-card"
import { ProfileSummaryEditor } from "./profile-summary-editor"
import { QualityCard } from "./quality-card"
import type { CVAnalysisResult } from "@/features/dashboard/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalysisResultProps {
  cvId: string
  result: CVAnalysisResult
}

/** Sonuçlar kullanıcının karar sırasını izler: açıklama → kritik sorunlar →
 * düzeltme aracı → kategori skorları → güçlü yönler → diğer bilgiler. */
export function AnalysisResult({ cvId, result }: AnalysisResultProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <AiVerdictCard summary={result.summary} />

        {result.ats_breakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle as="h2">{t("analysis.scoreExplanation")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.ats_breakdown.map((criterion) => (
                <div key={criterion.key} className="bg-muted/40 rounded-lg border p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{criterion.label}</p>
                    <span className="font-mono text-sm font-semibold tabular-nums">{criterion.score}</span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {criterion.findings[0]}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {result.weaknesses.length > 0 && (
          <InsightListCard
            icon={AlertTriangle}
            tone="destructive"
            numbered
            title={t("analysis.criticalIssues")}
            items={result.weaknesses.slice(0, 3)}
          />
        )}

        <AiToolsGrid cvId={cvId} atsScore={result.ats_score} />

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

        <InsightListCard
          icon={ThumbsUp}
          tone="success"
          title={t("analysis.strengths")}
          items={result.strengths}
        />

        <InsightListCard
          icon={Lightbulb}
          numbered
          title={t("analysis.improvementSuggestions")}
          items={result.improvement_suggestions}
        />

        <BadgeListCard
          icon={Briefcase}
          title={t("analysis.suggestedJobTitles")}
          items={result.suggested_job_titles}
        />

        <ProfileSummaryEditor content={result.corrected_profile_summary} />
      </div>

      <div>
        <AiHistoryTimeline cvId={cvId} />
      </div>
    </div>
  )
}
