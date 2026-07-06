import { CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { SkillGapItem, SkillPriority } from "../types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const PRIORITY_BAR: Record<SkillPriority, { width: string; className: string }> = {
  high: { width: "85%", className: "bg-destructive" },
  medium: { width: "55%", className: "bg-warning" },
  low: { width: "30%", className: "bg-success" },
}
const PRIORITY_BADGE: Record<SkillPriority, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
}
const PRIORITY_ORDER: Record<SkillPriority, number> = { high: 0, medium: 1, low: 2 }

interface SkillMatchCardProps {
  matchedSkills: string[]
  missingSkills: string[]
  skillGap: SkillGapItem[]
}

/** Beceri eşleşmesinin tek, birleşik sunumu: üstte eşleşen/eksik beceri
 * rozetleri, altında öğrenme yol haritası kartları. Backend her beceri için
 * sayısal bir skor döndürmüyor — bu yüzden "mini score" yerine `priority`
 * (low/medium/high) görsel bir öncelik çubuğuna çevrilir, uydurma sayı yok. */
export function SkillMatchCard({ matchedSkills, missingSkills, skillGap }: SkillMatchCardProps) {
  const { t } = useTranslation()
  const sortedGap = [...skillGap].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="text-base">
          {t("jobMatch.result.skillMatch")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {t("jobMatch.result.matchedSkills")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.length === 0 ? (
                <span className="text-muted-foreground text-sm">—</span>
              ) : (
                matchedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="hover:bg-success/20 cursor-default bg-success/10 text-success transition-colors"
                  >
                    <CheckCircle2 />
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {t("jobMatch.result.missingSkills")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.length === 0 ? (
                <span className="text-muted-foreground text-sm">—</span>
              ) : (
                missingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="hover:border-primary/40 hover:bg-accent cursor-default transition-colors"
                  >
                    {skill}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        {sortedGap.length > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">
              {t("jobMatch.result.learningRoadmap")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {sortedGap.map((item) => (
                <div
                  key={item.skill}
                  className="hover:border-primary/30 hover:bg-muted/30 space-y-2 rounded-lg border p-3.5 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{item.skill}</p>
                    <Badge variant="secondary" className={PRIORITY_BADGE[item.priority]}>
                      {t("jobMatch.result.priorityBadge", {
                        priority: t(`jobMatch.priority.${item.priority}`),
                      })}
                    </Badge>
                  </div>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className={cn("h-full rounded-full", PRIORITY_BAR[item.priority].className)}
                      style={{ width: PRIORITY_BAR[item.priority].width }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">{item.estimated_learning_time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedGap.length === 0 && matchedSkills.length === 0 && missingSkills.length === 0 && (
          <p className="text-muted-foreground text-sm">{t("jobMatch.result.skillGapEmpty")}</p>
        )}
      </CardContent>
    </Card>
  )
}
