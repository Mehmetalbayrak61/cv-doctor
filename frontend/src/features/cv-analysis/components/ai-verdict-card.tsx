import { Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@/components/ui/card"

/** Ekranın yıldızı: AI'nin genel değerlendirmesi. Kasıtlı olarak diğer tüm
 * kartlardan daha büyük, hafif marka tonuyla ayrışan bir arka plana sahip —
 * sayfadaki tek "vurgulu" kart. */
export function AiVerdictCard({ summary }: { summary: string }) {
  const { t } = useTranslation()

  return (
    <Card className="border-primary/25 bg-verdict-card">
      <CardContent className="space-y-4 py-8 sm:px-8">
        <span className="border-primary/30 bg-card text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <Sparkles className="size-3.5" />
          {t("analysis.summary")}
        </span>
        <p className="max-w-[68ch] text-base leading-[1.85] text-pretty">{summary}</p>
      </CardContent>
    </Card>
  )
}
