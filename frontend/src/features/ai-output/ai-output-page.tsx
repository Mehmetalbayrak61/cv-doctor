import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { AiOutputExplanation } from "./components/ai-output-explanation"
import { AiOutputHero } from "./components/ai-output-hero"
import { AiOutputToolsRail } from "./components/ai-output-tools-rail"
import { AiOutputVersionHistory, type VersionHistoryItem } from "./components/ai-output-version-history"
import { Card, CardContent } from "@/components/ui/card"
import { ErrorState } from "@/components/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAiOutputs } from "@/features/cv-analysis/hooks/use-rewrites"
import { useCv } from "@/features/dashboard/hooks/use-cvs"
import { useJobAiOutputs } from "@/features/job-match/hooks/use-job-tools"

export function AiOutputPage() {
  const { t } = useTranslation()
  const { cvId = "", outputId = "", jobId } = useParams()
  const isJobScoped = !!jobId

  const cvQuery = useCv(cvId)
  const cvOutputsQuery = useAiOutputs(cvId)
  const jobOutputsQuery = useJobAiOutputs(jobId ?? "", cvId)
  const outputsQuery = isJobScoped ? jobOutputsQuery : cvOutputsQuery

  const output = outputsQuery.data?.find((item) => item.id === outputId)

  const versionItems: VersionHistoryItem[] = useMemo(() => {
    if (!output || !outputsQuery.data) return []
    const sameType = outputsQuery.data
      .filter((item) => item.output_type === output.output_type)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return sameType.map((item, index) => ({ output: item, version: index + 1 })).reverse()
  }, [output, outputsQuery.data])

  const currentVersion = versionItems.find((item) => item.output.id === outputId)?.version ?? 1
  const backHref = isJobScoped ? `/jobs/${jobId}/match/${cvId}` : `/cvs/${cvId}`
  const isPending = cvQuery.isPending || outputsQuery.isPending
  const notFound = !isPending && (cvQuery.isError || outputsQuery.isError || !cvQuery.data || !output)

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-6 py-10 lg:px-10">
      {isPending && (
        <div className="space-y-6">
          <Skeleton className="h-5 w-20" />
          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 py-6">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
            <div className="space-y-6">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {notFound && (
        <ErrorState
          title={t("aiOutput.notFoundTitle")}
          retryLabel={t("common.retry")}
          onRetry={() => outputsQuery.refetch()}
        />
      )}

      {!isPending && !notFound && cvQuery.data && output && (
        <>
          <AiOutputHero
            outputType={output.output_type}
            cvFileName={cvQuery.data.file_name}
            version={currentVersion}
            createdAt={output.created_at}
            backHref={backHref}
          />

          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <Card className="shadow-sm lg:col-span-2">
              <CardContent className="p-6 sm:p-8">
                <div className="bg-muted/40 rounded-xl border p-8 sm:p-10">
                  <article
                    aria-label={t(`aiTools.types.${output.output_type}`)}
                    className="mx-auto max-w-[70ch]"
                  >
                    <p className="text-base leading-[1.85] text-pretty whitespace-pre-wrap">
                      {output.content}
                    </p>
                  </article>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 lg:sticky lg:top-20">
              <AiOutputToolsRail
                output={output}
                cvId={cvId}
                jobId={jobId}
                cvFileName={cvQuery.data.file_name}
              />
              <AiOutputExplanation outputType={output.output_type} />
              <AiOutputVersionHistory
                items={versionItems}
                currentOutputId={outputId}
                cvId={cvId}
                jobId={jobId}
              />
            </div>
          </div>
        </>
      )}
    </section>
  )
}
