import { scoreTierMeta, type ScoreTier } from "@/features/cv-analysis/lib/score-status"

/** İlan uyum skoru (compatibility_score) için eşikler CV kalite skorundan
 * (getScoreTier: 80/50) kasıtlı olarak farklı: kullanıcı bu ekranlar için 75/50
 * eşiğini onayladı (Yüksek/Orta/Düşük uyum). Görsel dil (ikon/renk) yine de
 * ortak scoreTierMeta'dan — İş İlanları listesi ve Eşleşme Sonucu ekranı arasında
 * tutarlı tek bir tanım. */
export function getMatchTier(score: number): ScoreTier {
  if (score >= 75) return "good"
  if (score >= 50) return "warning"
  return "critical"
}

export { scoreTierMeta }
