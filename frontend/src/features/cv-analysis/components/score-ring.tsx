import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import { getScoreTier, scoreTierMeta, type ScoreTier } from "../lib/score-status"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
  label: string
  score: number
  size?: number
  /** Küçük, yoğun bağlamlar için (ör. dashboard'daki "Son Analizler" kartları):
   * durum rozetini gizler, rakam/etiket ölçeğini halkanın boyutuna oturtur. */
  compact?: boolean
  /** Etiket başka bir yerde (ör. kartın kendi başlığı) zaten gösteriliyorsa
   * halkanın altındaki tekrar eden etiketi gizler. */
  hideLabel?: boolean
  /** Skor, CV kalite skorundan (getScoreTier: 80/50) farklı eşiklere sahip bir
   * alana aitse (ör. iş eşleşme uyum skoru: 75/50) doğru halka rengi için dışarıdan
   * enjekte edilir. Verilmezse varsayılan CV kalite eşiği kullanılır. */
  tier?: ScoreTier
  /** Dahili "İyi/Orta/Zayıf" durum satırını gizler — çağıran taraf kendi (farklı
   * eşikli/metinli) durum rozetini ayrıca gösterecekse kullanılır. */
  hideStatus?: boolean
}

/** Hero skor göstergesi: conic-gradient halka + ortada büyük mono rakam + durum rozeti. */
export function ScoreRing({
  label,
  score,
  size = 132,
  compact = false,
  hideLabel = false,
  tier: tierProp,
  hideStatus = false,
}: ScoreRingProps) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const clampedScore = Math.min(100, Math.max(0, score))
  const animatedScore = useMotionValue(shouldReduceMotion ? clampedScore : 0)
  const displayedScore = useTransform(animatedScore, (value) => Math.round(value))
  const sweep = useTransform(animatedScore, (value) => `${value * 3.6}deg`)
  const animationControls = useRef<ReturnType<typeof animate> | null>(null)
  const tier = tierProp ?? getScoreTier(clampedScore)
  const meta = scoreTierMeta[tier]
  const Icon = meta.icon
  const trackColor = `color-mix(in oklch, ${meta.colorVar} 14%, transparent)`
  const ringBackground = useTransform(
    sweep,
    (angle) => `conic-gradient(${meta.colorVar} ${angle}, ${trackColor} 0deg)`
  )

  useEffect(() => {
    animationControls.current?.stop()

    if (shouldReduceMotion) {
      animatedScore.set(clampedScore)
      return
    }

    const currentScore = animatedScore.get()
    const controls = animate(animatedScore, [currentScore, clampedScore], {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    })
    animationControls.current = controls

    return () => controls.stop()
  }, [animatedScore, clampedScore, shouldReduceMotion])

  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "gap-1.5" : "gap-3")}>
      <motion.div
        role="progressbar"
        aria-valuenow={clampedScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clampedScore}`}
        className="relative grid shrink-0 place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          background: ringBackground,
        }}
      >
        <div
          className="bg-card absolute rounded-full"
          style={{ inset: compact ? 4 : 9 }}
        />
        <div className="relative flex flex-col items-center">
          <motion.span
            className={cn(
              "font-mono font-semibold tracking-tight tabular-nums",
              compact ? "text-base" : "text-4xl"
            )}
          >
            {displayedScore}
          </motion.span>
          {!compact && <span className="text-muted-foreground text-[11px]">/ 100</span>}
        </div>
      </motion.div>
      <div className={compact ? "space-y-0" : "space-y-1"}>
        {!hideLabel && (
          <p className={cn("font-medium", compact ? "text-[10px] tracking-wide uppercase" : "text-sm")}>
            {label}
          </p>
        )}
        {!compact && !hideStatus && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              meta.textClass
            )}
          >
            <Icon className="size-3.5" />
            {t(`analysis.scoreStatus.${tier}`)}
          </span>
        )}
      </div>
    </div>
  )
}
