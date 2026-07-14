import { useTranslation } from "react-i18next"

import { useSeo } from "@/lib/use-seo"

interface AccountDeletionSection {
  title: string
  body?: string
  items?: string[]
  ordered?: boolean
}

export function AccountDeletionPage() {
  const { t } = useTranslation()
  const sections = t("legal.accountDeletion.sections", { returnObjects: true }) as
    AccountDeletionSection[]

  useSeo({
    title: t("seo.accountDeletion.title"),
    description: t("seo.accountDeletion.description"),
    path: "/account-deletion",
  })

  return (
    <article className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          {t("legal.accountDeletion.title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("legal.lastUpdated")}</p>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        {t("legal.accountDeletion.intro")}
      </p>

      <div className="space-y-6">
        {sections.map((section) => {
          const ListTag = section.ordered ? "ol" : "ul"
          return (
            <section key={section.title} className="space-y-2">
              <h2 className="font-medium">{section.title}</h2>
              {section.body && (
                <p className="text-muted-foreground text-sm leading-relaxed">{section.body}</p>
              )}
              {section.items && (
                <ListTag
                  className={
                    section.ordered
                      ? "text-muted-foreground list-inside list-decimal space-y-1.5 text-sm leading-relaxed"
                      : "text-muted-foreground list-inside list-disc space-y-1.5 text-sm leading-relaxed"
                  }
                >
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ListTag>
              )}
            </section>
          )
        })}
      </div>
    </article>
  )
}
