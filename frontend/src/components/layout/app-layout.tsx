import { Link, Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"

/**
 * Tüm sayfaları saran üst düzey layout: üst navigasyon + sayfa içeriği.
 * Faz 3'te sidebar, dark mode toggle ve dil seçici burada genişletilecek.
 */
export function AppLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold">
            {t("app.name")}
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
            <Button asChild>
              <Link to="/register">{t("nav.register")}</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
