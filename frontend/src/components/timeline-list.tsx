import type { LucideIcon } from "lucide-react"

export interface TimelineListItem {
  key: string
  icon: LucideIcon
  title: string
  meta: string
  onClick?: () => void
}

/** Dashboard'daki "Son AI İşlemleri" ve CV detayındaki "AI Geçmişi" arasında
 * paylaşılan tek zaman çizelgesi görseli — ikon + başlık + meta satırı,
 * bölücülerle ayrılmış. Her iki ekranda da aynı bileşen kullanılır. */
export function TimelineList({ items }: { items: TimelineListItem[] }) {
  return (
    <div className="divide-border divide-y">
      {items.map((item) => {
        const row = (
          <div className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
            <div className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
              <item.icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5 text-left">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-muted-foreground truncate text-xs">{item.meta}</p>
            </div>
          </div>
        )

        if (!item.onClick) {
          return <div key={item.key}>{row}</div>
        }

        return (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className="hover:bg-muted/60 -mx-2.5 w-[calc(100%+1.25rem)] rounded-md px-2.5 text-left transition-colors duration-200"
          >
            {row}
          </button>
        )
      })}
    </div>
  )
}
