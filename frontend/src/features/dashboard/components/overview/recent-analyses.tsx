import { FileText } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import type { RecentAnalysis } from "../../hooks/use-dashboard-overview"
import { Card, CardContent } from "@/components/ui/card"
import { formatRelativeDate } from "@/lib/format"

export function RecentAnalyses({ items }: { items: RecentAnalysis[] }) {
  const { t, i18n } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(({ cv, analysis }, index) => (
        <motion.div
          key={cv.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link className="block h-full" to={`/cvs/${cv.id}`}>
          <Card elevation="interactive" className="group h-full">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-accent text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{cv.file_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatRelativeDate(analysis.created_at, i18n.language)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-[11px] font-medium uppercase">{t("analysis.overallScore")}</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{analysis.result?.overall_score ?? 0}<span className="text-muted-foreground text-xs">/100</span></p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-[11px] font-medium uppercase">{t("analysis.atsScore")}</p>
                  <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{analysis.result?.ats_score ?? 0}<span className="text-muted-foreground text-xs">/100</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
