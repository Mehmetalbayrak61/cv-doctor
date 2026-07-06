import { Target } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import type { JobMatchHistoryItem } from "../types"
import { MatchStatusBadge } from "./match-status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { formatDate } from "@/lib/format"

/** "Son Eşleşmeler" — Dashboard'daki mini-kart diliyle aynı (bkz. RecentAnalyses):
 * ikon chip + başlık + tarih + durum rozeti, hover-lift. Eski düz `<ul>` listesinin
 * yerini alır. */
export function RecentMatches({ items }: { items: JobMatchHistoryItem[] }) {
  const { t, i18n } = useTranslation()

  if (items.length === 0) {
    return <EmptyState icon={Target} title={t("jobMatch.history.empty")} />
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((match) => (
        <Link
          key={match.id}
          to={`/jobs/${match.job_description_id}/match/${match.cv_document_id}`}
        >
          <Card className="group h-full transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/[0.06]">
            <CardContent className="space-y-3">
              <div className="bg-accent text-primary flex size-8 items-center justify-center rounded-lg">
                <Target className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{match.job_title}</p>
                <p className="text-muted-foreground truncate text-xs">{match.cv_file_name}</p>
              </div>
              <div className="space-y-2">
                <MatchStatusBadge match={match} />
                <p className="text-muted-foreground text-xs font-medium">
                  {formatDate(match.created_at, i18n.language)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
