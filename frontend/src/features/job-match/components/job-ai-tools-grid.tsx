import { Loader2, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { OUTPUT_TYPE_ICONS } from "@/features/cv-analysis/lib/output-type-icons"
import type { AIOutputType } from "@/features/cv-analysis/types/rewrite"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface JobAiToolsGridProps {
  onOptimizeCv: () => void
  isOptimizing: boolean
  onGenerateCoverLetter: () => void
  isGeneratingCoverLetter: boolean
}

/** Sadece ilana özel (job-scoped) 2 araç: ATS Optimize + Ön Yazı. "LinkedIn
 * Özeti" ve "Deneyim Güçlendir" kasıtlı olarak burada YOK — bunların backend'de
 * ilana özel bir karşılığı yok, sadece ilanı hiç dikkate almayan CV-geneli
 * versiyonları var (CV Detay ekranında). Onları burada göstermek kullanıcıyı
 * "ilana özel" sanıp aslında jenerik bir çıktı almasına yol açardı. */
export function JobAiToolsGrid({
  onOptimizeCv,
  isOptimizing,
  onGenerateCoverLetter,
  isGeneratingCoverLetter,
}: JobAiToolsGridProps) {
  const { t } = useTranslation()

  const tools: { type: AIOutputType; onClick: () => void; isPending: boolean }[] = [
    { type: "ats_keyword_insertion", onClick: onOptimizeCv, isPending: isOptimizing },
    { type: "cover_letter", onClick: onGenerateCoverLetter, isPending: isGeneratingCoverLetter },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {t("jobMatch.aiTools.heading")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon: LucideIcon = OUTPUT_TYPE_ICONS[tool.type]
            return (
              <button
                key={tool.type}
                type="button"
                onClick={tool.onClick}
                disabled={tool.isPending}
                className={cn(
                  "group border-border bg-card relative flex h-full flex-col items-start gap-3 rounded-xl border p-4 text-left transition-[transform,box-shadow] duration-300 ease-out disabled:pointer-events-none disabled:opacity-60",
                  "motion-safe:hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/[0.06]"
                )}
              >
                <div className="bg-accent text-primary flex size-9 items-center justify-center rounded-lg transition-transform duration-300 ease-out group-hover:scale-110">
                  {tool.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Icon className="size-4.5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t(`aiTools.types.${tool.type}`)}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {t(`aiTools.descriptions.${tool.type}`)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
