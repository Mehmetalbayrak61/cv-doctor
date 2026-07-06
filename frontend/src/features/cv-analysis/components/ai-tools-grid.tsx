import { Loader2, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { CoverLetterDialog } from "./cover-letter-dialog"
import {
  useAtsOptimize,
  useGenerateLinkedinSummary,
  useRewriteExperience,
  useRewriteSkills,
  useRewriteSummary,
} from "../hooks/use-rewrites"
import { OUTPUT_TYPE_ICONS } from "../lib/output-type-icons"
import type { AIOutput, AIOutputType } from "../types/rewrite"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAiOutputUrl } from "@/lib/ai-output-url"
import { showAiErrorToast } from "@/lib/api-error"
import { cn } from "@/lib/utils"

interface ToolDef {
  type: AIOutputType
  onClick: () => void
  isPending: boolean
  featured: boolean
}

function ToolCard({ type, onClick, isPending, featured }: ToolDef) {
  const { t } = useTranslation()
  const Icon: LucideIcon = OUTPUT_TYPE_ICONS[type]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "group border-border relative flex h-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-[transform,box-shadow] duration-300 ease-out disabled:pointer-events-none disabled:opacity-60",
        "motion-safe:hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/[0.06]",
        featured ? "border-primary/30 bg-accent" : "bg-card"
      )}
    >
      {featured && (
        <span className="text-primary font-mono text-[9.5px] font-medium tracking-wide uppercase">
          {t("aiTools.recommended")}
        </span>
      )}
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg transition-transform duration-300 ease-out group-hover:scale-110",
          featured ? "bg-primary text-primary-foreground" : "bg-accent text-primary"
        )}
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4.5" />}
      </div>
      <div>
        <p className="text-sm font-semibold">{t(`aiTools.types.${type}`)}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
          {t(`aiTools.descriptions.${type}`)}
        </p>
      </div>
    </button>
  )
}

interface AiToolsGridProps {
  cvId: string
  /** ATS skoru düşükse ATS Optimize aracını bağlamsal olarak öne çıkarmak için. */
  atsScore?: number
}

export function AiToolsGrid({ cvId, atsScore }: AiToolsGridProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [coverLetterOpen, setCoverLetterOpen] = useState(false)

  const summaryMutation = useRewriteSummary(cvId)
  const experienceMutation = useRewriteExperience(cvId)
  const skillsMutation = useRewriteSkills(cvId)
  const atsMutation = useAtsOptimize(cvId)
  const linkedinMutation = useGenerateLinkedinSummary(cvId)

  function goToOutput(output: AIOutput) {
    navigate(getAiOutputUrl(cvId, output.id))
  }

  const resultHandlers = {
    onSuccess: goToOutput,
    onError: (error: unknown) => showAiErrorToast(error, t("errors.generic")),
  }

  const atsIsLow = atsScore !== undefined && atsScore < 70

  const tools: ToolDef[] = [
    {
      type: "ats_optimization",
      isPending: atsMutation.isPending,
      featured: atsIsLow,
      onClick: () => atsMutation.mutate({}, resultHandlers),
    },
    {
      type: "cover_letter",
      isPending: false,
      featured: true,
      onClick: () => setCoverLetterOpen(true),
    },
    {
      type: "linkedin_summary",
      isPending: linkedinMutation.isPending,
      featured: false,
      onClick: () => linkedinMutation.mutate(undefined, resultHandlers),
    },
    {
      type: "summary_rewrite",
      isPending: summaryMutation.isPending,
      featured: false,
      onClick: () => summaryMutation.mutate(undefined, resultHandlers),
    },
    {
      type: "experience_rewrite",
      isPending: experienceMutation.isPending,
      featured: false,
      onClick: () => experienceMutation.mutate(undefined, resultHandlers),
    },
    {
      type: "skills_rewrite",
      isPending: skillsMutation.isPending,
      featured: false,
      onClick: () => skillsMutation.mutate(undefined, resultHandlers),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {t("aiTools.heading")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.type} {...tool} />
          ))}
        </div>
      </CardContent>

      <CoverLetterDialog
        cvId={cvId}
        open={coverLetterOpen}
        onOpenChange={setCoverLetterOpen}
        onGenerated={goToOutput}
      />
    </Card>
  )
}
