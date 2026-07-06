import { History } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { useAiOutputs } from "../hooks/use-rewrites"
import { OUTPUT_TYPE_ICONS } from "../lib/output-type-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TimelineList } from "@/components/timeline-list"
import { getAiOutputUrl } from "@/lib/ai-output-url"
import { formatDate } from "@/lib/format"

export function AiHistoryTimeline({ cvId }: { cvId: string }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const outputsQuery = useAiOutputs(cvId)

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-1.5 text-base">
          <History className="size-4" />
          {t("aiTools.history")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {outputsQuery.isPending && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {outputsQuery.data && outputsQuery.data.length === 0 && (
          <p className="text-muted-foreground text-sm">{t("aiTools.historyEmpty")}</p>
        )}

        {outputsQuery.data && outputsQuery.data.length > 0 && (
          <TimelineList
            items={outputsQuery.data.map((output) => ({
              key: output.id,
              icon: OUTPUT_TYPE_ICONS[output.output_type],
              title: t(`aiTools.types.${output.output_type}`),
              meta: formatDate(output.created_at, i18n.language),
              onClick: () => navigate(getAiOutputUrl(cvId, output.id)),
            }))}
          />
        )}
      </CardContent>
    </Card>
  )
}
