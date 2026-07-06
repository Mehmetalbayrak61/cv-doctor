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
  const tier = tierProp ?? getScoreTier(score)
  const meta = scoreTierMeta[tier]
  const Icon = meta.icon
  const trackColor = `color-mix(in oklch, ${meta.colorVar} 14%, transparent)`

  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "gap-1.5" : "gap-3")}>
      <div
        className="relative grid shrink-0 place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${meta.colorVar} ${score * 3.6}deg, ${trackColor} 0deg)`,
        }}
      >
        <div
          className="bg-card absolute rounded-full"
          style={{ inset: compact ? 4 : 9 }}
        />
        <div className="relative flex flex-col items-center">
          <span
            className={cn(
              "font-mono font-semibold tracking-tight tabular-nums",
              compact ? "text-base" : "text-4xl"
            )}
          >
            {score}
          </span>
          {!compact && <span className="text-muted-foreground text-[11px]">/ 100</span>}
        </div>
      </div>
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
