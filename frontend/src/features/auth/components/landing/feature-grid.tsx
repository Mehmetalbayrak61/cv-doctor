import {
  Briefcase,
  DollarSign,
  FileScan,
  Mail,
  MessagesSquare,
  Target,
  type LucideIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"

import { SectionHeading } from "./section-heading"
import { Card, CardContent } from "@/components/ui/card"

const ICONS: LucideIcon[] = [FileScan, Target, Mail, Briefcase, MessagesSquare, DollarSign]

export function FeatureGrid() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const items = t("landing.capabilities.items", { returnObjects: true }) as {
    title: string
    description: string
  }[]

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow={t("landing.capabilities.eyebrow")}
        heading={t("landing.capabilities.heading")}
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length]
          return (
            <motion.div
              key={item.title}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="group h-full transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/[0.06]">
                <CardContent className="space-y-3">
                  <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-lg transition-transform duration-300 ease-out group-hover:scale-110">
                    <Icon className="size-5" />
                  </div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
