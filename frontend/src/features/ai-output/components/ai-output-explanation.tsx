import { Info } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { AIOutputType } from "@/features/cv-analysis/types/rewrite"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** Statik, tip-bazlı ürün metni — "bu çıktı ne işe yarar / nasıl kullanılmalı".
 * AI tarafından üretilmiş bir içerik DEĞİL, sabit rehber metni. */
export function AiOutputExplanation({ outputType }: { outputType: AIOutputType }) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-1.5 text-base">
          <Info className="size-4" />
          {t("aiOutput.explanationHeading")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="space-y-1.5">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("aiOutput.whatForLabel")}
          </h3>
          <p className="text-pretty leading-[1.75]">
            {t(`aiOutput.explanations.${outputType}.whatFor`)}
          </p>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t("aiOutput.howToUseLabel")}
          </h3>
          <p className="text-pretty leading-[1.75]">
            {t(`aiOutput.explanations.${outputType}.howToUse`)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
