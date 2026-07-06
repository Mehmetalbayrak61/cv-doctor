import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ActivitySquare, CheckCircle2 } from "lucide-react"
import type { ReactNode } from "react"

/**
 * Login/Register sayfalarını saran split-screen düzen: solda marka/değer önerisi
 * paneli (diagnostik ızgara + teal glow), sağda form kartı. Mobilde sol panel gizlenir.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  const highlights = t("auth.layout.highlights", { returnObjects: true }) as string[]

  return (
    <div className="grid min-h-[calc(100vh-65px)] lg:grid-cols-2">
      <div className="bg-diagnostic-grid relative hidden overflow-hidden border-r bg-foreground/[0.02] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="bg-primary/25 absolute -top-24 -left-24 size-80 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-accent absolute -right-16 bottom-0 size-72 rounded-full blur-3xl"
        />

        <Link to="/" className="relative z-10 flex items-center gap-2 text-lg font-semibold">
          <ActivitySquare className="text-primary size-5" strokeWidth={2.25} />
          {t("app.name")}
        </Link>

        <div className="relative z-10 max-w-sm space-y-6">
          <p className="font-heading text-3xl leading-tight font-medium tracking-tight">
            {t("auth.layout.headline")}
          </p>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="text-muted-foreground flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground relative z-10 text-xs">
          {t("auth.layout.footnote")}
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="animate-fade-up w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
