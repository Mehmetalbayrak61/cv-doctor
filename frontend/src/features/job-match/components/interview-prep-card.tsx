import { Contact, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useGenerateInterviewPrep } from "../hooks/use-job-tools"
import { parseInterviewQuestions } from "../lib/parse-interview-questions"
import type { AIOutput } from "@/features/cv-analysis/types/rewrite"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { showAiErrorToast } from "@/lib/api-error"
import { cn } from "@/lib/utils"

interface InterviewPrepCardProps {
  jobId: string
  cvId: string
  latestOutput: AIOutput | undefined
}

function sectionHeadingLabel(heading: string, t: (key: string) => string): string {
  const lower = heading.toLowerCase()
  if (lower.includes("teknik")) return t("jobMatch.result.technicalQuestions")
  if (lower.includes("ik") || lower.includes("i̇k")) return t("jobMatch.result.hrQuestions")
  return heading
}

/** Mülakat soruları yapılandırılmış veri değil, serbest metin (bkz.
 * parse-interview-questions.ts). Ayrıştırma başarılı olursa mini kartlara
 * bölünür; olmazsa (ör. mock sağlayıcı) düz, okunabilir metin kartına düşer. */
export function InterviewPrepCard({ jobId, cvId, latestOutput }: InterviewPrepCardProps) {
  const { t } = useTranslation()
  const mutation = useGenerateInterviewPrep(jobId, cvId)
  const [output, setOutput] = useState<AIOutput | undefined>(latestOutput)

  useEffect(() => {
    setOutput(latestOutput)
  }, [latestOutput])

  function handleGenerate() {
    mutation.mutate(undefined, {
      onSuccess: setOutput,
      onError: (error) => showAiErrorToast(error, t("errors.generic")),
    })
  }

  const parsed = output ? parseInterviewQuestions(output.content) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {t("jobMatch.result.interviewPrepHeading")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!output && (
          <div className="rounded-lg border border-dashed px-6 py-7">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
              <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-lg">
                <Contact className="size-5" />
              </div>
              <p className="text-muted-foreground text-sm">
                {t("jobMatch.result.interviewPrepEmptyDescription")}
              </p>
              <Button size="sm" disabled={mutation.isPending} onClick={handleGenerate}>
                {mutation.isPending && <Loader2 className="animate-spin" />}
                {t("jobMatch.result.generateInterviewPrep")}
              </Button>
            </div>
          </div>
        )}

        {output && parsed && (
          <div className="space-y-4">
            <span className="border-primary/30 bg-accent text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5" />
              {t("jobMatch.result.aiGenerated")}
            </span>
            <div className={cn("grid gap-5", parsed.length > 1 && "sm:grid-cols-2")}>
              {parsed.map((section, index) => (
                <div key={index} className="space-y-2">
                  {section.heading && (
                    <p className="text-muted-foreground text-xs font-medium">
                      {sectionHeadingLabel(section.heading, t)}
                    </p>
                  )}
                  <ol className="space-y-2">
                    {section.questions.map((question, qIndex) => (
                      <li
                        key={qIndex}
                        className="hover:border-primary/30 hover:bg-muted/30 flex items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors duration-200"
                      >
                        <span className="bg-accent text-primary flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold">
                          {qIndex + 1}
                        </span>
                        {question}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {output && !parsed && (
          <div className="space-y-3">
            <span className="border-primary/30 bg-accent text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5" />
              {t("jobMatch.result.aiGenerated")}
            </span>
            <div className="bg-muted/60 rounded-lg border p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{output.content}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
