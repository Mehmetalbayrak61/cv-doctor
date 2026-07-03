import { useTranslation } from "react-i18next"

/** Faz 1 iskelet sayfası — gerçek giriş formu Faz 3'te (React Hook Form + Zod) eklenecek. */
export function LoginPage() {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-2xl font-semibold">{t("nav.login")}</h1>
    </section>
  )
}
