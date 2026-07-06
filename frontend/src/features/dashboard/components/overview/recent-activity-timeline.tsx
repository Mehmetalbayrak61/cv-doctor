import { useTranslation } from "react-i18next"

import type { RecentActivityItem } from "../../hooks/use-dashboard-overview"
import { OUTPUT_TYPE_ICONS } from "@/features/cv-analysis/lib/output-type-icons"
import { Card, CardContent } from "@/components/ui/card"
import { TimelineList } from "@/components/timeline-list"
import { formatRelativeDate } from "@/lib/format"

export function RecentActivityTimeline({ items }: { items: RecentActivityItem[] }) {
  const { t, i18n } = useTranslation()

  return (
    <Card>
      <CardContent>
        <TimelineList
          items={items.map((item) => ({
            key: item.id,
            icon: OUTPUT_TYPE_ICONS[item.outputType],
            title: t(`aiTools.types.${item.outputType}`),
            meta: `${item.cvFileName} · ${formatRelativeDate(item.createdAt, i18n.language)}`,
          }))}
        />
      </CardContent>
    </Card>
  )
}
