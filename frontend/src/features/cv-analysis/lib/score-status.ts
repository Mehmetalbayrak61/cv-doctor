import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

export type ScoreTier = "good" | "warning" | "critical"

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return "good"
  if (score >= 50) return "warning"
  return "critical"
}

export const scoreTierMeta = {
  good: {
    icon: CheckCircle2,
    colorVar: "var(--success)",
    textClass: "text-success",
    trackClass: "bg-success/15",
    fillClass: "bg-success",
  },
  warning: {
    icon: AlertTriangle,
    colorVar: "var(--warning)",
    textClass: "text-warning",
    trackClass: "bg-warning/15",
    fillClass: "bg-warning",
  },
  critical: {
    icon: XCircle,
    colorVar: "var(--destructive)",
    textClass: "text-destructive",
    trackClass: "bg-destructive/15",
    fillClass: "bg-destructive",
  },
} as const
