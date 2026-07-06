import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BadgeListCardProps {
  icon: LucideIcon
  title: string
  items: string[]
  variant?: "secondary" | "outline"
}

export function BadgeListCard({ icon: Icon, title, items, variant = "secondary" }: BadgeListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="text-primary flex items-center gap-2 text-base">
          <Icon className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">—</p>
        ) : (
          items.map((item) => (
            <Badge
              key={item}
              variant={variant}
              className={cn(
                "cursor-default py-1 transition-colors duration-200",
                variant === "outline"
                  ? "hover:border-primary/40 hover:bg-accent"
                  : "hover:bg-primary/15"
              )}
            >
              {item}
            </Badge>
          ))
        )}
      </CardContent>
    </Card>
  )
}
