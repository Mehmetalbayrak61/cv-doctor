import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | number
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
          <Icon className="size-4.5" />
        </div>
        <div>
          <p className="font-mono text-xl leading-none font-medium tabular-nums">{value}</p>
          <p className="text-muted-foreground mt-1 text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
