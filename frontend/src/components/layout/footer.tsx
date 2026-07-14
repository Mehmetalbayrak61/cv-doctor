import { ActivitySquare } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm sm:flex-row">
        <Link to="/" className="text-muted-foreground flex items-center gap-2 font-medium">
          <ActivitySquare className="text-primary size-4" strokeWidth={2.25} />
          {t("app.name")}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            {t("footer.about")}
          </Link>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
            {t("footer.pricing")}
          </Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
            {t("footer.privacy")}
          </Link>
          <Link to="/terms" className="text-muted-foreground hover:text-foreground">
            {t("footer.terms")}
          </Link>
          <Link to="/refund" className="text-muted-foreground hover:text-foreground">
            {t("footer.refund")}
          </Link>
          <Link to="/account-deletion" className="text-muted-foreground hover:text-foreground">
            {t("footer.accountDeletion")}
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            {t("footer.contact")}
          </Link>
        </nav>
        <p className="text-muted-foreground text-xs">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </footer>
  )
}
