import { Lock, ShieldCheck, Sparkles, Zap, type LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"

const ICONS: LucideIcon[] = [Sparkles, ShieldCheck, Lock, Zap]

export function TrustBar() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const items = t("landing.trust.items", { returnObjects: true }) as {
    label: string
    description: string
  }[]

  return (
    <div className="border-border border-y">
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-6 py-10 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border/60"
      >
        {items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length]
          return (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2.5 px-2 text-center sm:px-5"
            >
              <div className="bg-accent text-primary flex size-9 items-center justify-center rounded-full">
                <Icon className="size-4" />
              </div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-muted-foreground text-xs leading-snug text-balance">
                {item.description}
              </p>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
