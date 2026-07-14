import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { useSeo } from "@/lib/use-seo"

export function PrivacyPage() {
  const { t } = useTranslation()
  const sections = t("legal.privacy.sections", { returnObjects: true }) as {
    title: string
    body: string
    link?: { to: string; label: string }
  }[]

  useSeo({
    title: t("seo.privacy.title"),
    description: t("seo.privacy.description"),
    path: "/privacy",
  })

  return (
    <article className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          {t("legal.privacy.title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("legal.lastUpdated")}</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="font-medium">{section.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{section.body}</p>
            {section.link && (
              <Link
                to={section.link.to}
                className="text-primary block text-sm underline underline-offset-2"
              >
                {section.link.label}
              </Link>
            )}
          </section>
        ))}
      </div>
    </article>
  )
}
