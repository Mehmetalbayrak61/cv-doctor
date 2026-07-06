import { ArrowRight, Check } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { SectionHeading } from "@/features/auth/components/landing/section-heading"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PricingPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const shouldReduceMotion = useReducedMotion()

  const freeFeatures = t("pricing.free.features", { returnObjects: true }) as string[]
  const proFeatures = t("pricing.pro.features", { returnObjects: true }) as string[]
  const faqItems = t("pricing.faq.items", { returnObjects: true }) as {
    question: string
    answer: string
  }[]

  const handleProCta = () => {
    toast.info(t("pricing.billingNote"))
  }

  return (
    <div>
      <section className="mx-auto max-w-2xl px-6 pt-20 pb-4">
        <SectionHeading
          eyebrow={t("pricing.eyebrow")}
          heading={t("pricing.title")}
          description={t("pricing.subtitle")}
        />
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-6 sm:grid-cols-2"
        >
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

          <Card className="border-primary relative h-full overflow-visible shadow-lg shadow-foreground/[0.06]">
            <Badge className="absolute -top-3 left-6">{t("pricing.pro.badge")}</Badge>
            <CardContent className="flex h-full flex-col gap-6">
              <div>
                <p className="font-medium">{t("pricing.pro.name")}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t("pricing.pro.description")}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold tracking-tight">
                  {t("pricing.pro.price")}
                </span>
                <span className="text-muted-foreground text-sm">
                  {t("pricing.pro.priceNote")}
                </span>
              </div>
              <ul className="flex-1 space-y-3">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="text-primary mt-0.5 size-4 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleProCta} className="group w-full">
                {t("pricing.pro.cta")}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

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
