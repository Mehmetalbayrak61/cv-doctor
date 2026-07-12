import { Mail } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useSeo } from "@/lib/use-seo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const SUPPORT_EMAIL = "destek@cvdoktoru.com.tr"

export function ContactPage() {
  const { t } = useTranslation()

  useSeo({
    title: t("seo.contact.title"),
    description: t("seo.contact.description"),
    path: "/contact",
  })

  return (
    <div>
      <section className="mx-auto max-w-xl px-6 pt-20 pb-4 text-center">
        <p className="text-primary text-xs font-medium tracking-[0.14em] uppercase">
          {t("contact.eyebrow")}
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t("contact.title")}
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty">
          {t("contact.subtitle")}
        </p>
      </section>

      <section className="mx-auto max-w-xl space-y-6 px-6 py-12">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Mail className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{t("contact.supportEmailLabel")}</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-medium hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-base">
              {t("contact.form.heading")}
            </CardTitle>
            <CardDescription>{t("contact.form.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => event.preventDefault()}
              aria-disabled
            >
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">{t("contact.form.name")}</Label>
                <Input id="contact-name" name="name" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">{t("contact.form.email")}</Label>
                <Input id="contact-email" name="email" type="email" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">{t("contact.form.subject")}</Label>
                <Input id="contact-subject" name="subject" disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">{t("contact.form.message")}</Label>
                <Textarea id="contact-message" name="message" rows={4} disabled />
              </div>
              <Button type="submit" disabled className="w-full">
                {t("contact.form.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
