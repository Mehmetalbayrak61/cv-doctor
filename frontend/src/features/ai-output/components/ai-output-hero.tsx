import { ArrowLeft, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { OUTPUT_TYPE_ICONS } from "@/features/cv-analysis/lib/output-type-icons"
import type { AIOutputType } from "@/features/cv-analysis/types/rewrite"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"

interface AiOutputHeroProps {
  outputType: AIOutputType
  cvFileName: string
  version: number
  createdAt: string
  backHref: string
}

/** Başlık + hangi AI çıktısı olduğu + CV adı + versiyon + tarih — CV Detay'ın
 * AnalysisHero'suyla aynı görsel dil, aynı "dosya bilgisi ikinci planda" ilkesi. */
export function AiOutputHero({ outputType, cvFileName, version, createdAt, backHref }: AiOutputHeroProps) {
  const { t, i18n } = useTranslation()
  const Icon = OUTPUT_TYPE_ICONS[outputType]

  return (
    <div className="space-y-4">
      <Link
        to={backHref}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        {t("common.back")}
      </Link>

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="bg-accent text-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-6" />
          </div>
          <div className="min-w-0">
            <span className="border-primary/30 bg-card text-primary mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
              <Sparkles className="size-3.5" />
              {t("aiOutput.eyebrow")}
            </span>
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {t(`aiTools.types.${outputType}`)}
            </h1>
            <p className="text-muted-foreground/80 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="truncate">{cvFileName}</span>
              <Badge variant="outline">v{version}</Badge>
              <span>{formatDate(createdAt, i18n.language)}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
