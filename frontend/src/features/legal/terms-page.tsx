import { useTranslation } from "react-i18next"

import { useSeo } from "@/lib/use-seo"

export function TermsPage() {
  const { t } = useTranslation()
  const sections = t("legal.terms.sections", { returnObjects: true }) as {
    title: string
    body: string
  }[]

  useSeo({
    title: t("seo.terms.title"),
    description: t("seo.terms.description"),
    path: "/terms",
  })

  return (
    <article className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          {t("legal.terms.title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("legal.lastUpdated")}</p>
      </div>

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
