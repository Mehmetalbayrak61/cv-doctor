import { useTranslation } from "react-i18next"

/** Faz 1 iskelet sayfası — gerçek landing tasarımı Faz 3'te yapılacak. */
export function LandingPage() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{t("app.name")}</h1>
      <p className="text-muted-foreground mt-4 text-lg">{t("app.tagline")}</p>
    </section>
  )
}
