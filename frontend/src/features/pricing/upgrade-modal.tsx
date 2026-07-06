import { ArrowRight, Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { t } = useTranslation()
  const benefits = t("upgradeModal.benefits", { returnObjects: true }) as string[]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="text-primary text-xs font-medium tracking-[0.14em] uppercase">
            {t("upgradeModal.eyebrow")}
          </p>
          <DialogTitle className="text-lg">{t("upgradeModal.title")}</DialogTitle>
          <DialogDescription>{t("upgradeModal.description")}</DialogDescription>
        </DialogHeader>

        <div className="bg-accent/60 space-y-2.5 rounded-lg p-4">
          <p className="text-sm font-medium">{t("upgradeModal.benefitsHeading")}</p>
          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm">
                <Check className="text-primary mt-0.5 size-4 shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("upgradeModal.dismiss")}
          </Button>
          <Button asChild className="group" onClick={() => onOpenChange(false)}>
            <Link to="/pricing">
              {t("upgradeModal.cta")}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
