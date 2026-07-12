import { FileScan, Mail, Sparkles, Target, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { useSeo } from "@/lib/use-seo"
import { Card, CardContent } from "@/components/ui/card"

const FEATURE_ICONS: LucideIcon[] = [FileScan, Target, Sparkles, Mail]

export function AboutPage() {
  const { t } = useTranslation()
  const features = t("about.features.items", { returnObjects: true }) as {
    title: string
    description: string
  }[]

  useSeo({
    title: t("seo.about.title"),
    description: t("seo.about.description"),
    path: "/about",
  })

  return (
    <div>
      <section className="mx-auto max-w-2xl px-6 pt-20 pb-4 text-center">
        <p className="text-primary text-xs font-medium tracking-[0.14em] uppercase">
          {t("about.eyebrow")}
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t("about.title")}
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty">
          {t("about.intro")}
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="space-y-2">
              <h2 className="font-heading text-lg font-medium">{t("about.mission.title")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("about.mission.body")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2">
              <h2 className="font-heading text-lg font-medium">{t("about.vision.title")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("about.vision.body")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="font-heading mb-6 text-center text-2xl font-semibold tracking-tight">
          {t("about.features.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((item, index) => {
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length]
            return (
              <Card key={item.title}>
                <CardContent className="space-y-3">
                  <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="font-heading text-lg font-medium">{t("about.contact.title")}</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          {t("about.contact.body")}
        </p>
        <Link to="/contact" className="text-primary mt-4 inline-block text-sm font-medium hover:underline">
          {t("contact.title")} →
        </Link>
      </section>
    </div>
  )
}
