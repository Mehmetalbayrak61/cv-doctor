import { Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { SectionHeading } from "@/features/auth/components/landing/section-heading"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useSeo } from "@/lib/use-seo"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PricingPage() {
  const { t } = useTranslation()
  const { token } = useAuth()

  useSeo({
    title: t("seo.pricing.title"),
    description: t("seo.pricing.description"),
    path: "/pricing",
  })

  const freeFeatures = t("pricing.free.features", { returnObjects: true }) as string[]
  const faqItems = t("pricing.faq.items", { returnObjects: true }) as {
    question: string
    answer: string
  }[]

  return (
    <div>
      <section className="mx-auto max-w-2xl px-6 pt-20 pb-4">
        <SectionHeading
          eyebrow={t("pricing.eyebrow")}
          heading={t("pricing.title")}
          description={t("pricing.subtitle")}
        />
      </section>

      <section className="mx-auto max-w-md px-6 py-12">
        <div>
          <Card className="h-full">
            <CardContent className="flex h-full flex-col gap-6">
              <div>
                <p className="font-medium">{t("pricing.free.name")}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t("pricing.free.description")}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold tracking-tight">
                  {t("pricing.free.price")}
                </span>
                <span className="text-muted-foreground text-sm">{t("pricing.free.period")}</span>
              </div>
              <ul className="flex-1 space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {token ? (
                <Button disabled variant="outline" className="w-full">
                  {t("pricing.free.cta")}
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/register">{t("landing.ctaPrimary")}</Link>
                </Button>
              )}
            </CardContent>
          </Card>

        </div>

        <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed">
          {t("pricing.billingNote")}
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16">
        <SectionHeading eyebrow={t("pricing.faq.eyebrow")} heading={t("pricing.faq.heading")} />
        <Accordion type="single" collapsible className="mt-10">
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
