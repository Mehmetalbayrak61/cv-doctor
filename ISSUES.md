# ISSUES — Frontend UI/UX Audit (CLARITY BREAK, State of the Company)

Scope: frontend UI/UX and visual-design quality, triggered by "grafikleri daha iyi, UI modern çağa uygun" isteği. Backend/mimari dışarıda. Son iki commit'te dark mode ve touch-target işi zaten yapıldığı için burada tekrar flag'lenmedi.

Her satır: `[impact] açıklama — dosya`. Filtrelenmemiş tam liste; rock seçimi sıradaki adımda.

## High impact

- [high] `ScoreRing`'in conic-gradient halkası skor değişince transition/animasyon olmadan aniden "zıplıyor"; `framer-motion` zaten kurulu ama burada kullanılmıyor — en çok tekrar kullanılan bileşen. `frontend/src/features/cv-analysis/components/score-ring.tsx`
- [high] Ürün ekranları (dashboard, cv-analysis, job-match — yani skor/grafik görsellerinin yaşadığı yer) `framer-motion`'ı hiç kullanmıyor; sadece landing/pricing sayfaları giriş animasyonu, gradient wash, `useReducedMotion` ile "modern" hissi taşıyor. Kurulu kütüphane ürün tarafında atıl.
- [high] `admin-page.tsx` metrikleri saf metin/rakam (StatCard, UsageSummaryRow); veri 24h/7d/30d zaman serisi olduğu halde hiç bar/sparkline/trend yok — en az modernleşmiş ekran (admin-only olduğu için öncelik düşebilir).

## Medium impact

- [med] `quality-card.tsx` ve `skill-match-card.tsx` kendi progress bar'larını elle çiziyor, mevcut Radix tabanlı `components/ui/progress.tsx`'i kullanmıyor — design-system bypass + tutarsız transition davranışı.
- [med] `index.css`'teki `--chart-1..5` token'ları hiçbir yerde kullanılmıyor (dead tokens) ve hepsi gri tonlarında (chroma 0) — gerçek çok-serili bir grafik bunları kullansa bile renk ayrışması olmaz. "Grafikleri modernize et" isteğiyle doğrudan ilgili.
- [med] `match-hero.tsx` (glow blur arkaplan, kalın tier badge, shadow) ile `analysis-hero.tsx` (düz sunum) aynı kavramsal "hero skor" anını farklı cila seviyesinde gösteriyor.
- [med] `skill-match-card.tsx`'teki `PRIORITY_BAR` kategorik bir değeri (high/medium/low) sabit yüzdelerle (85%/55%/30%) sanki ölçülmüş bir oranmış gibi gösteriyor — yanıltıcı affordance.
- [med] `cv-list-page.tsx` tek sütun, düz çerçeveli liste; job-match'teki kart-grid + hover deseninin yanında en dağınık/eski görünen sayfa.
- [med] Kart elevation'ı tutarsız: base `Card` sadece `ring-1`, ama özellikler kendi `shadow-sm` / `hover:shadow-lg` tariflerini elle ekliyor — elevation bir `Card` varyantı değil.
- [med] `admin-page.tsx`'teki `StatGridSkeleton` paylaşılan `Skeleton` yerine ham `animate-pulse` div kullanıyor.
- [med] `usage-summary-row.tsx` sütun etiketlerini sadece `title` tooltip ile veriyor — dokunmatik/klavye kullanıcısı için görünmez.
- [med] `cv-list-item.tsx` hover state'i olmayan düz bir satır; sil ikonunda `Button` varyantı yerine ham `text-destructive`.

## Low impact

- [low] `timeline-list.tsx` gerçek bir timeline çizgisi/noktası olmadan düz `divide-y` listesi — dashboard ve CV/job AI history'de tekrar kullanılan en az "chart-like" parça.
- [low] `ScoreRing`'de `role="progressbar"` / `aria-valuenow` / `aria-label` yok — ekran okuyucu sadece ham rakamı görüyor.
- [low] `ai-suggestions.tsx` ikon rengini `meta.badgeClass.split(" ")[1]` ile string-parse ederek alıyor — class sırası değişirse sessizce bozulur.
- [low] `ai-tools-grid.tsx`'teki `ToolCard` ve `timeline-list.tsx` satırı `Button` sisteminin dışında ham `<button>`; kendi `focus-visible` tanımı yok, global outline'a güveniyor.
- [low] `ScoreRing`'e sabit piksel `size` veriliyor (132/112/168/104/96/64/60), çok dar ekranlarda responsive küçülme yok.
- [low] `analysis-result.tsx`'te 5 eksenli kalite verisi (dil/bölüm/deneyim/eğitim/beceri) olduğu halde radar/spider chart gibi çok-boyutlu bir görselleştirme yok — özellik fırsatı, hata değil.
- [low] Projede hiç chart kütüphanesi yok (recharts/visx/d3/nivo); tüm "grafikler" CSS ile elle yapılmış. Trend çizgisi/sparkline/radar eklemek yeni bağımlılık gerektirir.
- [low] Count-up/sayı animasyonu kütüphanesi yok; skor rakamlarını canlandırmak istenirse ya yeni bağımlılık ya da `framer-motion`'ın `animate()`/`useSpring` API'si kullanılmalı (muhtemelen ikincisi yeterli, yeni paket gerekmez).

## Already solid (not issues, noted so they aren't re-flagged)

- Radius ölçeği (`--radius-sm..4xl`) merkezi ve tutarlı kullanılıyor.
- Kodda hiç hardcoded hex/rgb renk yok, tema token'ları disiplinli kullanılmış.
- Skeleton/empty/error state'leri admin dışında zaten geniş kapsamda var (overview, cv-detail, match-result).
- Renk-tek-başına durum anlatımı yok (ikon + metin + renk birlikte) — WCAG açısından iyi.
