import { Check, Copy, Download, Loader2, RefreshCcw, Share2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { CoverLetterDialog } from "@/features/cv-analysis/components/cover-letter-dialog"
import {
  useAtsOptimize,
  useGenerateCoverLetter as useGenerateCvCoverLetter,
  useGenerateLinkedinSummary,
  useRewriteExperience,
  useRewriteSkills,
  useRewriteSummary,
} from "@/features/cv-analysis/hooks/use-rewrites"
import type { AIOutput, AIOutputType, CoverLetterRequest } from "@/features/cv-analysis/types/rewrite"
import {
  useEstimateSalary,
  useGenerateInterviewPrep,
  useGenerateJobCoverLetter,
  useOptimizeKeywords,
} from "@/features/job-match/hooks/use-job-tools"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAiOutputUrl } from "@/lib/ai-output-url"
import { getApiErrorMessage, showAiErrorToast } from "@/lib/api-error"

interface AiOutputToolsRailProps {
  output: AIOutput
  cvId: string
  jobId?: string
  cvFileName: string
}

/** Dosya adı olarak güvenli, anlamlı bir parça üretir: aksan/özel karakterleri
 * sadeleştirir, boşlukları tire yapar (ör. "Ayşe_CV.pdf" → "Ayse-CV"). */
const COMBINING_DIACRITICS_RE = /[̀-ͯ]/g

function slugifyFilenamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS_RE, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildDownloadFilename(cvFileName: string, outputType: AIOutputType, createdAt: string): string {
  const baseName = cvFileName.replace(/\.[^/.]+$/, "")
  const datePart = new Date(createdAt).toISOString().slice(0, 10)
  return `${slugifyFilenamePart(baseName)}_${outputType}_${datePart}.txt`
}

/** Sağ raydaki eylem merkezi: Tekrar Oluştur / Kopyala / İndir / Paylaş.
 * "Tekrar Oluştur" çıktı tipine göre doğru üretim ucunu tetikler — CV-özel Ön
 * Yazı hariç hepsi tek tıkla, o ise (job_title zorunlu olduğu için) aynı
 * CoverLetterDialog'u önceki girdilerle (input_context) önceden doldurarak açar. */
export function AiOutputToolsRail({ output, cvId, jobId, cvFileName }: AiOutputToolsRailProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [coverLetterOpen, setCoverLetterOpen] = useState(false)
  const isJobScoped = !!jobId

  const summaryMutation = useRewriteSummary(cvId)
  const experienceMutation = useRewriteExperience(cvId)
  const skillsMutation = useRewriteSkills(cvId)
  const atsMutation = useAtsOptimize(cvId)
  const linkedinMutation = useGenerateLinkedinSummary(cvId)
  const cvCoverLetterMutation = useGenerateCvCoverLetter(cvId)
  const jobKeywordsMutation = useOptimizeKeywords(jobId ?? "", cvId)
  const jobCoverLetterMutation = useGenerateJobCoverLetter(jobId ?? "", cvId)
  const interviewPrepMutation = useGenerateInterviewPrep(jobId ?? "", cvId)
  const salaryMutation = useEstimateSalary(jobId ?? "", cvId)

  function handleRegenerateSuccess(newOutput: AIOutput) {
    toast.success(t("aiOutput.regenerateSuccess"))
    navigate(getAiOutputUrl(cvId, newOutput.id, jobId))
  }
  function handleRegenerateError(error: unknown) {
    showAiErrorToast(error, t("errors.generic"))
  }
  const handlers = { onSuccess: handleRegenerateSuccess, onError: handleRegenerateError }

  const pendingByType: Record<AIOutputType, boolean> = {
    summary_rewrite: summaryMutation.isPending,
    experience_rewrite: experienceMutation.isPending,
    skills_rewrite: skillsMutation.isPending,
    ats_optimization: atsMutation.isPending,
    linkedin_summary: linkedinMutation.isPending,
    ats_keyword_insertion: jobKeywordsMutation.isPending,
    interview_prep: interviewPrepMutation.isPending,
    salary_estimation: salaryMutation.isPending,
    cover_letter: isJobScoped ? jobCoverLetterMutation.isPending : cvCoverLetterMutation.isPending,
  }
  const isRegenerating = pendingByType[output.output_type]

  function handleRegenerate() {
    switch (output.output_type) {
      case "summary_rewrite":
        summaryMutation.mutate(undefined, handlers)
        return
      case "experience_rewrite":
        experienceMutation.mutate(undefined, handlers)
        return
      case "skills_rewrite":
        skillsMutation.mutate(undefined, handlers)
        return
      case "ats_optimization":
        atsMutation.mutate({}, handlers)
        return
      case "linkedin_summary":
        linkedinMutation.mutate(undefined, handlers)
        return
      case "ats_keyword_insertion":
        jobKeywordsMutation.mutate(undefined, handlers)
        return
      case "interview_prep":
        interviewPrepMutation.mutate(undefined, handlers)
        return
      case "salary_estimation": {
        const context = (output.input_context ?? {}) as { country?: string; city?: string }
        salaryMutation.mutate({ country: context.country, city: context.city }, handlers)
        return
      }
      case "cover_letter":
        if (isJobScoped) {
          jobCoverLetterMutation.mutate(undefined, handlers)
        } else {
          setCoverLetterOpen(true)
        }
        return
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output.content)
      setCopied(true)
      toast.success(t("aiTools.copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("aiTools.copyFailed"))
    }
  }

  function handleDownload() {
    const blob = new Blob([output.content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = buildDownloadFilename(cvFileName, output.output_type, output.created_at)
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: t(`aiTools.types.${output.output_type}`), text: output.content })
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          toast.error(getApiErrorMessage(error, t("errors.generic")))
        }
      }
      return
    }
    try {
      await navigator.clipboard.writeText(output.content)
      toast.success(t("aiOutput.shareFallback"))
    } catch {
      toast.error(t("aiTools.copyFailed"))
    }
  }

  const coverLetterDefaults: Partial<CoverLetterRequest> | undefined =
    output.output_type === "cover_letter" && !isJobScoped
      ? {
          job_title: (output.input_context?.job_title as string | undefined) ?? "",
          company_name: (output.input_context?.company_name as string | undefined) ?? "",
          job_description: (output.input_context?.job_description as string | undefined) ?? "",
        }
      : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {t("aiOutput.toolsHeading")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full" disabled={isRegenerating} onClick={handleRegenerate}>
          {isRegenerating ? <Loader2 className="animate-spin" /> : <RefreshCcw />}
          {t("aiOutput.regenerate")}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleCopy}>
          {copied ? <Check /> : <Copy />}
          {t(copied ? "aiTools.copied" : "aiTools.copy")}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleDownload}>
          <Download />
          {t("aiTools.download")}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleShare}>
          <Share2 />
          {t("aiOutput.share")}
        </Button>
      </CardContent>

      <CoverLetterDialog
        cvId={cvId}
        open={coverLetterOpen}
        onOpenChange={setCoverLetterOpen}
        onGenerated={handleRegenerateSuccess}
        defaultValues={coverLetterDefaults}
      />
    </Card>
  )
}
