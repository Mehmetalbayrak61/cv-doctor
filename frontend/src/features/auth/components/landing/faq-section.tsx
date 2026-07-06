import { useTranslation } from "react-i18next"

import { SectionHeading } from "./section-heading"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FaqSection() {
  const { t } = useTranslation()
  const faqItems = t("landing.faq.items", { returnObjects: true }) as {
    question: string
    answer: string
  }[]

  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <SectionHeading eyebrow={t("landing.faq.eyebrow")} heading={t("landing.faq.heading")} />
      <Accordion type="single" collapsible className="mt-10">
        {faqItems.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
