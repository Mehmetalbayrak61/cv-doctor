import { Contact, Gauge, Mail, Target, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickAction {
  label: string
  icon: LucideIcon
  to: string
}

interface QuickActionsProps {
  /** Kullanıcının en son yüklediği CV — yoksa (ör. ileride bu bölüm CV'siz bir
   * kullanıcıya da gösterilirse) araçlar CV listesine düşer, asla kırık bir
   * bağlantıya değil. */
  latestCvId: string | null
  atsScore: number | null
  jobMatchCount: number
}

export function QuickActions({ latestCvId, atsScore, jobMatchCount }: QuickActionsProps) {
  const { t } = useTranslation()
  const cvDetailOrList = latestCvId ? `/cvs/${latestCvId}` : "/cvs"

  const actions: QuickAction[] = [
    // CV Analiz Et her zaman CV listesine gider: kullanıcı burada hem yeni CV
    // yükleyebilir hem de analiz edilecek CV'yi seçebilir.
    { label: t("overview.quickActions.analyze"), icon: Gauge, to: "/cvs" },
    { label: t("overview.quickActions.coverLetter"), icon: Mail, to: cvDetailOrList },
    { label: t("overview.quickActions.atsOptimize"), icon: Target, to: cvDetailOrList },
    { label: t("overview.quickActions.linkedin"), icon: Contact, to: cvDetailOrList },
  ]

  if (atsScore !== null && atsScore < 70) {
    actions.sort((a, b) => Number(b.icon === Target) - Number(a.icon === Target))
  } else if (jobMatchCount === 0 && actions[0]?.icon !== Gauge) {
    actions.sort((a, b) => Number(b.icon === Gauge) - Number(a.icon === Gauge))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("overview.quickActions.heading")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="group border-border hover:border-primary/30 hover:bg-accent flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors duration-200"
          >
            <action.icon className="text-primary size-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {action.label}
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
