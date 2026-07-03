import { useTranslation } from "react-i18next"

/** Faz 1 iskelet sayfası — gerçek kayıt formu Faz 3'te (React Hook Form + Zod) eklenecek. */
export function RegisterPage() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-2xl font-semibold">{t("nav.register")}</h1>
    </section>
  )
}
