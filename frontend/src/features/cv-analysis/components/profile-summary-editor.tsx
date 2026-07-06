import { Check, Copy, Sparkles } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/** Editör görünümünde salt-okunur çıktı: gelecekte "CV'ye Uygula" gibi bir
 * eylem eklenirse CardAction'a ikinci bir buton olarak katılabilir — şimdilik
 * eklenmedi, sadece Kopyala var. */
export function ProfileSummaryEditor({ content }: { content: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success(t("aiTools.copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t("aiTools.copyFailed"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2 text-base">
          <Sparkles className="text-primary size-4" />
          {t("analysis.correctedProfileSummary")}
        </CardTitle>
        <CardAction>
          <Button size="sm" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {t(copied ? "aiTools.copied" : "aiTools.copy")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/60 rounded-lg border p-5">
          <p className="text-sm leading-[1.85] whitespace-pre-wrap">{content}</p>
        </div>
      </CardContent>
    </Card>
  )
}
