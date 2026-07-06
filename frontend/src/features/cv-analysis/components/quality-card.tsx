import { ScoreRing } from "./score-ring"
import { getScoreTier, scoreTierMeta } from "../lib/score-status"
import type { QualityAssessment } from "@/features/dashboard/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Sadece bir skor değil — mini halka (görsel özet) + ilerleme çubuğu (kesin
 * konum) + açıklama (neden) birlikte, kullanıcı düşük skorun sebebini
 * kartı okumadan anlamak zorunda kalmasın diye üçü aynı anda gösterilir. */
export function QualityCard({ label, quality }: { label: string; quality: QualityAssessment }) {
  const tier = getScoreTier(quality.score)
  const meta = scoreTierMeta[tier]

  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-4">
          <ScoreRing compact hideLabel size={60} label={label} score={quality.score} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-medium">{label}</p>
            <div className={cn("h-1.5 w-full overflow-hidden rounded-full", meta.trackClass)}>
              <div
                className={cn("h-full rounded-full transition-[width]", meta.fillClass)}
                style={{ width: `${quality.score}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{quality.comment}</p>
      </CardContent>
    </Card>
  )
}
