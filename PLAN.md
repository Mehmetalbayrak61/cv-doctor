# PLAN — Frontend UI/UX Modernization (CLARITY BREAK)

Core Focus: modernize CV Doktor's score/chart visuals and surrounding UI without changing any business logic, API contracts, or i18n keys' meaning. No new runtime deps except `recharts` in Rock G (network access required for that rock only).

Baseline proof for every rock (frontend only, no test suite in this repo):
- `cd frontend && npm run build` (tsc -b && vite build) — must succeed with zero type errors.
- `cd frontend && npm run lint` (oxlint) — must report zero new errors.
- Manual smoke: rock's own PROOF line below (component renders, prints described behavior) — verified by Fable reading the rendered diff/dev server, not just Codex's claim.

Order matters: C (tokens) before A (motion may reference chart colors); B before D (list page reuses card/elevation convention from B); E last (touches shared primitives A/B may have just changed).

## Rock A — Motion for score visuals (High)

**Files:** `src/features/cv-analysis/components/score-ring.tsx`, `src/features/job-match/components/match-hero.tsx`, `src/features/cv-analysis/components/analysis-hero.tsx`, `src/features/dashboard/components/overview/kpi-grid.tsx`, `src/features/dashboard/components/overview/recent-analyses.tsx`

**Approach:** Animate `ScoreRing`'s conic-gradient sweep on mount/update using `framer-motion`'s `useMotionValue`/`animate()` (no new dependency — already installed), respecting `prefers-reduced-motion` via `useReducedMotion()` like the landing page already does. Animate the numeric value with a count-up (`useSpring`/`animate` on a motion value rendered via `useTransform`, rounded) instead of an instant snap. Apply the same fade/slide entrance already used on marketing pages (`animate-fade-up` or an equivalent `motion.div` variant) to `KpiCard`s and `RecentAnalyses` cards on first mount, staggered.

**Non-goals:** no new chart type, no layout changes.

**Proof:** `npm run build` + `npm run lint` green. Manual: open `/dashboard` and a CV analysis result in the dev server, confirm the ring sweeps and the number counts up on load/update instead of snapping instantly, and that setting `prefers-reduced-motion: reduce` disables the animation.

## Rock B — Progress bar & elevation consistency (Medium)

**Files:** `src/features/cv-analysis/components/quality-card.tsx`, `src/features/job-match/components/skill-match-card.tsx`, `src/components/ui/progress.tsx`, `src/components/ui/card.tsx`, `src/features/admin/admin-page.tsx`, `src/features/dashboard/components/cv-list-item.tsx`

**Approach:**
1. Replace the hand-rolled bar markup in `quality-card.tsx` with the shared `Progress` component (extend its variant/color prop if needed to accept the tier color).
2. Replace `skill-match-card.tsx`'s `PRIORITY_BAR` continuous fake-percentage bar with a discrete 3-segment priority indicator (filled segments = priority level), since priority is categorical (high/medium/low), not a measured quantity — keep the existing "no invented numbers" intent from the code comment, just make the visual honestly discrete instead of continuous.
3. Add an explicit elevation convention: a `shadow`/`elevated` variant (or documented utility class) on `Card`, migrate the ad hoc `shadow-sm`/`hover:shadow-lg` one-offs in `analysis-hero.tsx`, `match-hero.tsx`, `recent-analyses.tsx`, `job-card.tsx` to use it.
4. `admin-page.tsx`'s `StatGridSkeleton`: swap the raw `animate-pulse` div for the shared `Skeleton` component.
5. `cv-list-item.tsx`: add a hover state consistent with `job-card.tsx`/`recent-analyses.tsx`, and swap the hardcoded `text-destructive` icon for the existing `Button` ghost/destructive variant.

**Non-goals:** no data/API changes; priority indicator stays categorical (do not introduce a numeric priority score).

**Proof:** `npm run build` + `npm run lint` green. Manual: quality card and skill-gap card render identical visual weight/animation as before (bars still fill), admin page skeleton visually matches other skeletons, CV list row shows hover feedback.

## Rock C — Chart color tokens + hero consistency (Medium)

**Files:** `src/index.css`, `src/features/cv-analysis/components/analysis-hero.tsx`, `src/features/job-match/components/match-hero.tsx`

**Approach:** Give `--chart-1..5` real hue-differentiated values (light + dark variants) instead of grayscale, so any future multi-series usage (and Rock G's radar chart) has actual color separation; keep them consistent with the existing single-accent brand discipline (vary lightness/hue around the teal primary + neutral complements, not a rainbow). Bring `analysis-hero.tsx` up to `match-hero.tsx`'s polish level (glow blur backdrop behind the ring, bolder tier badge treatment) so the two hero moments read as the same design language.

**Non-goals:** do not touch `--success`/`--warning`/`--destructive` status semantics.

**Proof:** `npm run build` + `npm run lint` green. Manual: visually diff `analysis-hero` vs `match-hero` side by side (light + dark mode) — same visual weight; confirm `--chart-*` tokens render as distinct hues via devtools if consumed in Rock G.

## Rock D — Modernize CV list page (Medium)

**Files:** `src/features/dashboard/cv-list-page.tsx`, `src/features/dashboard/components/cv-list-item.tsx`, `src/features/dashboard/components/cv-list-skeleton.tsx`

**Approach:** Convert the single-column bordered-row list to a responsive card grid matching the `job-card.tsx` pattern (same elevation convention from Rock B), keep all existing actions (open/delete/etc.) and empty/error states intact. Update the skeleton to match the new grid shape.

**Non-goals:** no changes to routing, data fetching, or list filtering/sorting logic.

**Proof:** `npm run build` + `npm run lint` green. Manual: `/dashboard/cvs` (or the routed path) renders a responsive grid at desktop and mobile widths, empty and loading states still render correctly.

## Rock E — Timeline visual + accessibility polish (Low/Medium)

**Files:** `src/components/timeline-list.tsx`, `src/features/cv-analysis/components/score-ring.tsx`, `src/features/dashboard/components/overview/ai-suggestions.tsx`, `src/features/cv-analysis/components/ai-tools-grid.tsx`

**Approach:** Add a real connector line + dot to `TimelineList` rows (vertical line through icon circles, last item's line clipped). Add `role="progressbar"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, and an `aria-label` (score + label) to `ScoreRing`. Fix `ai-suggestions.tsx`'s fragile `badgeClass.split(" ")[1]` icon-color lookup by giving `PRIORITY_META` an explicit `iconClass` field instead of deriving it from another class string. Add explicit `focus-visible` classes to `ai-tools-grid.tsx`'s raw `<button>` `ToolCard` matching the shared `Button` focus style.

**Non-goals:** no new dependency; `ScoreRing`'s fixed pixel sizes may get one small-viewport breakpoint at most, not a full responsive system.

**Proof:** `npm run build` + `npm run lint` green. Manual: inspect `ScoreRing` in devtools accessibility tree (role + aria-value present), tab through `ai-tools-grid` and confirm a visible focus ring, timeline shows a connector line.

## Rock F — Admin panel visualization (High impact, admin-only scope)

**Files:** `src/features/admin/admin-page.tsx`, `src/features/admin/components/stat-card.tsx`, `src/features/admin/components/usage-summary-row.tsx`

**Approach:** Add a small inline sparkline/bar-per-bucket treatment to `StatCard` for the 24h/7d/30d series (CSS-only bar sparkline, no new chart dep — reuse the `--chart-*` tokens from Rock C). Replace `usage-summary-row.tsx`'s tooltip-only (`title=`) column labels with visible column headers (e.g. a small header row above the summary rows, or inline labels), so touch/keyboard users can read them without hovering.

**Non-goals:** no new dependency, no changes to what data is fetched.

**Proof:** `npm run build` + `npm run lint` green. Manual: `/admin` shows visible column headers (no longer tooltip-only) and a lightweight trend indicator per stat.

## Rock G — Multi-axis quality radar chart (stretch, new dependency)

**Files:** `frontend/package.json`, `src/features/cv-analysis/components/analysis-result.tsx`, new `src/features/cv-analysis/components/quality-radar.tsx`

**Approach:** Add `recharts` (lightest maintained React chart lib, tree-shakeable, SVG-based, composes fine with Tailwind/theme tokens) as a new dependency. Build a small radar/spider chart component for the 5-axis quality breakdown (language/section/experience/education/skills), using the now-real `--chart-1..5` tokens from Rock C, placed above or beside the existing `QualityCard` grid in `analysis-result.tsx` (the existing cards stay — this is additive, not a replacement).

**Non-goals:** do not remove the per-axis `QualityCard`s; the radar is a summary view, not a replacement for the detail cards.

**Proof:** `npm run build` + `npm run lint` green (after `npm install recharts` — this rock's Codex build call needs `-c sandbox_workspace_write.network_access=true`, announced before running). Manual: CV analysis result page renders a 5-axis radar chart above/alongside the quality cards, values match the cards' scores.
