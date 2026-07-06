import { ArrowRight, FileUp, Sparkles, Target } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function OverviewEmptyState() {
  const { t } = useTranslation()

  const steps = [
    { icon: FileUp, text: t("overview.empty.step1") },
    { icon: Sparkles, text: t("overview.empty.step2") },
    { icon: Target, text: t("overview.empty.step3") },
  ]

  return (
    <div className="mx-auto max-w-md py-14 text-center">
      <div className="bg-accent text-primary mx-auto flex size-16 items-center justify-center rounded-full">
        <FileUp className="size-7" />
      </div>
      <h2 className="font-heading mt-5 text-xl font-semibold tracking-tight">
        {t("overview.empty.title")}
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {t("overview.empty.description")}
      </p>

      <div className="mt-10 grid grid-cols-3 gap-4 text-left">
        {steps.map((step, index) => (
          <div key={step.text} className="space-y-2">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full font-mono text-xs font-semibold">
              {index + 1}
            </span>
            <p className="text-muted-foreground text-xs leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>

      <Button
        asChild
        size="lg"
        className="group mt-7 h-11 px-7 text-base shadow-sm transition-shadow duration-300 hover:shadow-md hover:shadow-primary/20"
      >
        <Link to="/cvs">
          {t("overview.empty.cta")}
          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  )
}
