import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="px-6 py-24">
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="bg-final-cta-gradient relative mx-auto flex max-w-4xl flex-col items-center gap-6 overflow-hidden rounded-3xl px-8 py-16 text-center"
      >
        {/* Bu bant her iki temada da sabit koyu-teal bir yüzey (bkz. .bg-final-cta-gradient),
            bu yüzden metin de temaya göre yön değiştiren --primary-foreground yerine
            sabit beyaz kullanır. */}
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
          {t("landing.finalCta.heading")}
        </h2>
        <p className="max-w-md text-base leading-relaxed text-white/80">
          {t("landing.finalCta.subheading")}
        </p>
        {/* variant="secondary" yerine sabit renkler: aynı theme-bağımsız gerekçe.
            Metin, hero'daki birincil CTA ile bilinçli olarak aynı: tekrar eden,
            tek bir net eylem çağrısı — sayfanın neresinde olursa olsun aynı sonucu vaat eder. */}
        <Button
          asChild
          size="lg"
          className="group h-11 bg-white px-6 text-base text-neutral-900 shadow-md transition-shadow duration-300 hover:bg-white/90 hover:shadow-lg"
        >
          <Link to="/register">
            {t("landing.ctaPrimary")}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </motion.div>
    </section>
  )
}
