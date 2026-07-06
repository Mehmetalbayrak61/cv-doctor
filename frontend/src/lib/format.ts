export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

const RELATIVE_UNITS: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 2592000, divisor: 86400, unit: "day" },
  { limit: 31536000, divisor: 2592000, unit: "month" },
]

/** "2 gün önce" / "2 days ago" gibi göreceli zaman ifadesi. Dashboard'daki
 * son analiz/AI işlemi listeleri gibi taranan (okunmayan) yerlerde tam tarihten
 * daha hızlı kavranıyor. */
export function formatRelativeDate(iso: string, locale: string): string {
  const diffSeconds = (Date.now() - new Date(iso).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  for (const { limit, divisor, unit } of RELATIVE_UNITS) {
    if (diffSeconds < limit) {
      return rtf.format(-Math.round(diffSeconds / divisor), unit)
    }
  }
  return rtf.format(-Math.round(diffSeconds / 31536000), "year")
}
