import { TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

interface WelcomeHeaderProps {
  firstName?: string
  activityLast7Days: number
}

export function WelcomeHeader({ firstName, activityLast7Days }: WelcomeHeaderProps) {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {t("overview.welcome", { name: firstName ?? "" })}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">{t("overview.subtitle")}</p>
      {activityLast7Days > 0 && (
        <span className="bg-accent text-primary mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium">
          <TrendingUp className="size-3.5" />
          {t("overview.weeklySummary", { count: activityLast7Days })}
        </span>
      )}
    </div>
  )
}
