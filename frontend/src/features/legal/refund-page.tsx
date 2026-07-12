import { useTranslation } from "react-i18next"

import { useSeo } from "@/lib/use-seo"

export function RefundPage() {
  const { t } = useTranslation()
  const sections = t("legal.refund.sections", { returnObjects: true }) as {
    title: string
    body: string
  }[]

  useSeo({
    title: t("seo.refund.title"),
    description: t("seo.refund.description"),
    path: "/refund",
  })

  return (
    <article className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          {t("legal.refund.title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("legal.lastUpdated")}</p>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{t("legal.refund.intro")}</p>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="font-medium">{section.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  )
}
