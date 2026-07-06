import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"

import { SectionHeading } from "./section-heading"

export function HowItWorks() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const steps = t("landing.howItWorks.steps", { returnObjects: true }) as {
    title: string
    description: string
  }[]

  return (
    <section id="nasil-calisir" className="mx-auto max-w-6xl px-6 py-24 scroll-mt-16">
      <SectionHeading
        eyebrow={t("landing.howItWorks.eyebrow")}
        heading={t("landing.howItWorks.heading")}
      />

      <div className="relative mt-16 grid gap-10 sm:grid-cols-3">
        <div
          aria-hidden
          className="bg-border/60 absolute top-6 right-[16.5%] left-[16.5%] hidden h-px sm:block"
        />
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center text-center sm:items-start sm:text-left"
          >
            <span className="bg-primary text-primary-foreground font-heading relative z-10 flex size-12 items-center justify-center rounded-full text-lg font-semibold tabular-nums">
              {index + 1}
            </span>
            <p className="mt-5 text-lg font-semibold tracking-tight">{step.title}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
