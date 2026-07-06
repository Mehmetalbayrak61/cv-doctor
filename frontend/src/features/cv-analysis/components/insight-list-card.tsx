import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InsightListCardProps {
  icon: LucideIcon
  title: string
  items: string[]
  tone?: "default" | "success" | "destructive"
  /** Öncelik hissi gereken listeler için (ör. İyileştirme Önerileri): ikon
   * yerine sıra numarası gösteren rozet — mevcut API dizi sırasını sahte bir
   * "kritik/öneri" kategorisi uydurmadan önceliğe dönüştürür. */
  numbered?: boolean
}

const chipClass = {
  default: "bg-accent text-primary",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
}

const iconClass = {
  default: "text-primary",
  success: "text-success",
  destructive: "text-destructive",
}

export function InsightListCard({
  icon: Icon,
  title,
  items,
  tone = "default",
  numbered = false,
}: InsightListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2 text-base">
          <Icon className={cn("size-4.5", iconClass[tone])} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">—</p>
        ) : (
          <ul className="space-y-3.5">
            {items.map((item, index) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums",
                    chipClass[tone]
                  )}
                >
                  {numbered ? index + 1 : <Icon className="size-3" />}
                </span>
                <span className="text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
