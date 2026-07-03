import { useTranslation } from "react-i18next"

/** Faz 1 iskelet sayfası — gerçek dashboard içeriği (istatistikler, son CV'ler) Faz 3'te eklenecek. */
export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="text-2xl font-semibold">{t("nav.dashboard")}</h1>
    </section>
  )
}
