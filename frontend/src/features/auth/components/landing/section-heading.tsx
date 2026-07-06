import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

interface SectionHeadingProps {
  eyebrow: string
  heading: ReactNode
  description?: string
  align?: "center" | "left"
}

/** Bölüm başlığı deseni: caption (eyebrow) + heading + opsiyonel açıklama.
 * Landing sayfasındaki tüm bölümlerde (How it works, Capabilities, FAQ) aynı
 * tipografik ses için tekrar kullanılır. */
export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "center",
}: SectionHeadingProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={align === "center" ? "mx-auto max-w-xl text-center" : "max-w-xl"}
    >
      <p className="text-primary text-xs font-medium tracking-[0.14em] uppercase">{eyebrow}</p>
      <h2 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {heading}
      </h2>
      {description && (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty">
          {description}
        </p>
      )}
    </motion.div>
  )
}
