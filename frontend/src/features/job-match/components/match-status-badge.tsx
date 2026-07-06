import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { JobMatchHistoryItem } from "../types"
import { getMatchTier, scoreTierMeta } from "../lib/match-tier"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** İlan kartlarında ve Son Eşleşmeler mini-kartlarında ortak kullanılan durum
 * rozeti — mevcut match history verisinden türetilir, yeni bir alan/endpoint
 * gerektirmez. */
export function MatchStatusBadge({ match }: { match: JobMatchHistoryItem | undefined }) {
  const { t } = useTranslation()

  if (!match) {
    return <Badge variant="outline">{t("jobMatch.status.none")}</Badge>
  }
  if (match.status === "pending") {
    return (
      <Badge variant="outline">
        <Loader2 className="animate-spin" />
        {t("jobMatch.status.pending")}
      </Badge>
    )
  }
  if (match.status === "failed") {
    return <Badge variant="destructive">{t("jobMatch.failed")}</Badge>
  }
  if (match.status === "completed" && match.result) {
    const score = match.result.compatibility_score
    const tier = getMatchTier(score)
    const meta = scoreTierMeta[tier]
    const Icon = meta.icon
    return (
      <Badge variant="secondary" className={cn(meta.trackClass, meta.textClass)}>
        <Icon />
        {t(`jobMatch.status.tier.${tier}`)} · {score}
      </Badge>
    )
  }
  return <Badge variant="outline">{t("jobMatch.status.none")}</Badge>
}
