import { CheckCircle2, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { ScoreRing } from "@/features/cv-analysis/components/score-ring"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function HeroSection() {
  const { t } = useTranslation()
  const sampleStrengths = t("landing.sampleReport.strengths", { returnObjects: true }) as string[]
  const sampleImprovements = t("landing.sampleReport.improvements", {
    returnObjects: true,
  }) as string[]

  return (
    <section className="bg-diagnostic-grid relative overflow-hidden">
      <div aria-hidden className="bg-hero-wash absolute inset-0" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_1fr] lg:py-32">
        <div className="space-y-7">
          <span className="animate-fade-up border-primary/25 bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide">
            <Sparkles className="size-4" />
            {t("landing.eyebrow")}
          </span>

          <h1
            className="animate-fade-up font-heading text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {t("landing.headline")}
          </h1>

          <p
            className="animate-fade-up text-muted-foreground max-w-lg text-lg leading-relaxed text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            {t("landing.subheadline")}
          </p>

          <div
            className="animate-fade-up flex flex-wrap items-center gap-4 pt-2"
            style={{ animationDelay: "240ms" }}
          >
            <Button
              asChild
              size="lg"
              className="h-11 px-6 text-base shadow-sm transition-shadow duration-300 hover:shadow-md hover:shadow-primary/20"
            >
              <Link to="/register">{t("landing.ctaPrimary")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6 text-base">
              <a href="#nasil-calisir">{t("landing.ctaSecondary")}</a>
            </Button>
          </div>

          <p
            className="animate-fade-up text-muted-foreground text-sm"
            style={{ animationDelay: "300ms" }}
          >
            {t("landing.ctaHint")}
          </p>
        </div>

        <div
          className="animate-fade-up relative flex justify-center lg:justify-end"
          style={{ animationDelay: "200ms" }}
        >
          <Card className="w-full max-w-md shadow-xl shadow-foreground/[0.06]">
            <CardContent className="space-y-5 py-7">
              <p className="text-muted-foreground text-center text-sm font-medium">
                {t("landing.sampleReportLabel")}
              </p>
              <div className="flex justify-center gap-6">
                <ScoreRing label={t("analysis.overallScore")} score={82} size={96} />
                <ScoreRing label={t("analysis.atsScore")} score={74} size={96} />
              </div>

              <div className="border-border/60 space-y-4 border-t pt-5">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {t("analysis.strengths")}
                  </p>
                  <ul className="space-y-1.5">
                    {sampleStrengths.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="text-success mt-0.5 size-4 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {t("landing.sampleReport.improvementsLabel")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleImprovements.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div
            className="border-border bg-background/70 absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md sm:-left-8"
            aria-hidden
          >
            <CheckCircle2 className="text-success size-4" />
            {t("landing.analysisCompleteBadge")}
          </div>
        </div>
      </div>
    </section>
  )
}
