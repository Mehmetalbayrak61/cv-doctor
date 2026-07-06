import { History } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { OUTPUT_TYPE_ICONS } from "@/features/cv-analysis/lib/output-type-icons"
import type { AIOutput } from "@/features/cv-analysis/types/rewrite"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimelineList } from "@/components/timeline-list"
import { getAiOutputUrl } from "@/lib/ai-output-url"
import { formatDate } from "@/lib/format"

export interface VersionHistoryItem {
  output: AIOutput
  version: number
}

interface AiOutputVersionHistoryProps {
  items: VersionHistoryItem[]
  currentOutputId: string
  cvId: string
  jobId?: string
}

/** Aynı çıktı tipinin geçmiş üretimleri — gerçek veriden türetilir (her "Tekrar
 * Oluştur" yeni bir kayıt ekler, eskisi silinmez). Versiyon numarası backend'de
 * saklı bir alan değil, listedeki sıradan (en eski → en yeni) türetilir. */
export function AiOutputVersionHistory({
  items,
  currentOutputId,
  cvId,
  jobId,
}: AiOutputVersionHistoryProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-1.5 text-base">
          <History className="size-4" />
          {t("aiOutput.versionHistoryHeading")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TimelineList
          items={items.map(({ output, version }) => {
            const isCurrent = output.id === currentOutputId
            return {
              key: output.id,
              icon: OUTPUT_TYPE_ICONS[output.output_type],
              title: isCurrent ? `v${version} · ${t("aiOutput.current")}` : `v${version}`,
              meta: formatDate(output.created_at, i18n.language),
              onClick: isCurrent
                ? undefined
                : () => navigate(getAiOutputUrl(cvId, output.id, jobId)),
            }
          })}
        />
      </CardContent>
    </Card>
  )
}
