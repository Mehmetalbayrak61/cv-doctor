# PLAN — Frontend UI/UX Modernization (CLARITY BREAK)

Core Focus: modernize CV Doktor's score/chart visuals and surrounding UI without changing any business logic, API contracts, or i18n keys' meaning. No new runtime deps except `recharts` in Rock G (network access required for that rock only).

Baseline proof for every rock (frontend only, no test suite in this repo):
- `cd frontend && npm run build` (tsc -b && vite build) — must succeed with zero type errors.
- `cd frontend && npm run lint` (oxlint) — must report zero new errors.
- Manual smoke: rock's own PROOF line below (component renders, prints described behavior) — verified by Fable reading the rendered diff/dev server, not just Codex's claim.

Order matters: B before D (list page reuses card/elevation convention from B); E last (touches shared primitives A/B may have just changed). C has no ordering dependency on A — `ScoreRing` uses semantic status tokens (`--success`/`--warning`/`--destructive`), not `--chart-*`; verified in `frontend/src/features/cv-analysis/lib/score-status.ts`.

**Manual verification owner:** every "Manual:" proof step below is performed by Fable (this driving session) in the dev server, not delegated and not accepted on Codex's word. The acceptance artifact is the Level 10 review note in `SAME-PAGE-LOG.md` / the rock's close-out; Fable is the acceptance owner for each rock's proof, the user is the acceptance owner for the final commit gate.

## Rock A — Motion for score visuals (High)

**Files:** `src/features/cv-analysis/components/score-ring.tsx`, `src/features/job-match/components/match-hero.tsx`, `src/features/cv-analysis/components/analysis-hero.tsx`, `src/features/dashboard/components/overview/kpi-grid.tsx`, `src/features/dashboard/components/overview/recent-analyses.tsx`

**Approach:** Animate `ScoreRing`'s conic-gradient sweep on mount/update using `framer-motion`'s `useMotionValue`/`animate()` (no new dependency — already installed). Clamp the incoming `score` to 0–100 before animating. On mount, animate the shared motion value FROM 0 TO the score, so the count-up/sweep-in effect actually happens on first render. On every subsequent update, stop the previous animation controls first (`.stop()`), then start the new animation FROM the motion value's own current live position (`motionValue.get()` at the moment of retrigger — NOT a separately-tracked "last rendered value" ref, which would go stale mid-flight and cause a visible jump if a new score arrives while the previous animation is still running) TO the new score. This guarantees the ring is always animating from wherever it visually is right now, never from a stale snapshot. Animate the numeric value with a count-up on the same motion value (rendered via `useTransform`, rounded). Under `useReducedMotion()`, skip the animation entirely and set the final sweep/number synchronously (no partial motion, no stale intermediate value). Apply the same fade/slide entrance already used on marketing pages (`animate-fade-up` or an equivalent `motion.div` variant) to `KpiCard`s and `RecentAnalyses` cards on first mount, staggered — same reduced-motion rule applies to these entrances too, not just the ring.

**Non-goals:** no new chart type, no layout changes.

**Proof:** `npm run build` + `npm run lint` green. Manual: open `/dashboard` and a CV analysis result in the dev server, confirm the ring sweeps and the number counts up on load/update instead of snapping instantly; change a mounted ring's score two or three times in a row (e.g. re-analyze, or a temporary test prop) and confirm the sweep and number always settle on the latest value with no stale/overlapping animation; confirm `prefers-reduced-motion: reduce` disables the ring sweep AND the KPI/recent-analyses entrance animations, showing final states immediately.

## Rock B — Progress bar & elevation consistency (Medium)

**Files:** `src/features/cv-analysis/components/quality-card.tsx`, `src/features/job-match/components/skill-match-card.tsx`, `src/components/ui/progress.tsx`, `src/components/ui/card.tsx`, `src/features/admin/admin-page.tsx`, `src/features/dashboard/components/cv-list-item.tsx`, `src/features/cv-analysis/components/analysis-hero.tsx`, `src/features/job-match/components/match-hero.tsx`, `src/features/dashboard/components/overview/recent-analyses.tsx`, `src/features/job-match/components/job-card.tsx`

**Approach:**
1. Replace the hand-rolled bar markup in `quality-card.tsx` with the shared `Progress` component. Instead of an open-ended color prop, give it a small closed `tone?: "success" | "warning" | "destructive"` prop mapped to a static, statically-discoverable Tailwind class table (no dynamic class construction).
2. Replace `skill-match-card.tsx`'s `PRIORITY_BAR` continuous fake-percentage bar with a discrete 3-segment priority indicator (filled segments = priority level), since priority is categorical (high/medium/low), not a measured quantity — keep the existing "no invented numbers" intent from the code comment, just make the visual honestly discrete instead of continuous.
3. Add an explicit elevation convention: a `shadow`/`elevated` variant (or documented utility class) on `Card`, migrate every ad hoc `shadow-sm`/`hover:shadow-lg` one-off found in the audit (`analysis-hero.tsx`, `match-hero.tsx`, `recent-analyses.tsx`, `job-card.tsx`) to use it.
4. `admin-page.tsx`'s `StatGridSkeleton`: swap the raw `animate-pulse` div for the shared `Skeleton` component.
5. `cv-list-item.tsx`: add a hover state consistent with `job-card.tsx`/`recent-analyses.tsx`, and swap the hardcoded `text-destructive` icon for the existing `Button` ghost/destructive variant. Confirm the delete-confirmation flow (if any) still works after the markup change.

**Non-goals:** no data/API changes; priority indicator stays categorical (do not introduce a numeric priority score).

**Proof:** `npm run build` + `npm run lint` green. Manual, explicit checks (not "looks the same as before" — the bar IS changing shape): quality card's `Progress` bar renders the correct tier color (success/warning/destructive) at each tier; skill-gap card's priority indicator shows exactly 1/2/3 filled segments for low/medium/high; every migrated card (`analysis-hero`, `match-hero`, `recent-analyses`, `job-card`) shows the same elevation convention consistently in both themes; `cv-list-item` shows visible hover feedback, a visible focus ring on the delete button, and the delete action still completes successfully; admin skeleton visually matches the app's other skeletons.

## Rock C — Chart color tokens + hero consistency (Medium)

**Files:** `src/index.css`, `src/features/cv-analysis/components/analysis-hero.tsx`, `src/features/job-match/components/match-hero.tsx`

**Approach:** Give `--chart-1..5` real hue-differentiated values (light + dark variants) instead of grayscale, so any future multi-series usage has actual color separation; keep them consistent with the existing single-accent brand discipline (vary lightness/hue around the teal primary + neutral complements, not a rainbow). This is worth doing regardless of any single consumer — the audit flagged them as dead/unfit tokens independent of Rock G. Rock G's radar (single-series) uses exactly ONE of these five tokens (`--chart-1`) as its series color, which is a genuine but partial consumer — Rock C does not claim Rock G uses all five, only that `--chart-1` is verifiably wired to a real render. Bring `analysis-hero.tsx` up to `match-hero.tsx`'s polish level (glow blur backdrop behind the ring, bolder tier badge treatment) so the two hero moments read as the same design language.

**Non-goals:** do not touch `--success`/`--warning`/`--destructive` status semantics.

**Proof:** `npm run build` + `npm run lint` green. Manual: visually diff `analysis-hero` vs `match-hero` side by side in both light and dark mode — same visual weight; render a swatch of all five `--chart-1..5` values in both themes and confirm each pair of adjacent swatches meets at least a 3:1 contrast ratio against its neighbors and against `--background`/`--card` (WCAG 1.4.11 non-text contrast threshold, checked via devtools color picker or a contrast-checker tool); separately confirm Rock G's radar renders visibly using `--chart-1`.

## Rock D — Modernize CV list page (Medium)

**Files:** `src/features/dashboard/cv-list-page.tsx`, `src/features/dashboard/components/cv-list-item.tsx`, `src/features/dashboard/components/cv-list-skeleton.tsx`

**Approach:** Convert the single-column bordered-row list to a responsive card grid matching the `job-card.tsx` pattern (same elevation convention from Rock B), keep all existing actions (open/delete/etc.) and empty/error states intact. Update the skeleton to match the new grid shape.

**Non-goals:** no changes to routing, data fetching, or list filtering/sorting logic.

**Proof:** `npm run build` + `npm run lint` green. Manual: `/dashboard/cvs` (or the routed path) renders a responsive grid at desktop and mobile (narrowest supported) widths; open and delete actions both still work end to end, including the pending-deletion state; a CV with a very long filename doesn't break the card layout; empty, error, and loading states still render correctly in the new grid shape.

## Rock E — Timeline visual + accessibility polish (Low/Medium)

**Files:** `src/components/timeline-list.tsx`, `src/features/cv-analysis/components/score-ring.tsx`, `src/features/dashboard/components/overview/ai-suggestions.tsx`, `src/features/cv-analysis/components/ai-tools-grid.tsx`

**Approach:** Add a real connector line + dot to `TimelineList` rows (vertical line through icon circles, last item's line clipped) — verify it stays aligned when a row's title wraps to two lines. Add `role="progressbar"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, and an `aria-label` (score + label) to `ScoreRing`. Fix `ai-suggestions.tsx`'s fragile `badgeClass.split(" ")[1]` icon-color lookup by giving `PRIORITY_META` an explicit `iconClass` field instead of deriving it from another class string. Add explicit `focus-visible` classes matching the shared `Button` focus style to BOTH `ai-tools-grid.tsx`'s raw `<button>` `ToolCard` AND `timeline-list.tsx`'s clickable row button (the audit flagged both, the original plan only fixed one).

**Non-goals:** no new dependency; `ScoreRing`'s fixed pixel sizes may get one small-viewport breakpoint at most, not a full responsive system.

**Proof:** `npm run build` + `npm run lint` green. Manual: inspect `ScoreRing` in devtools accessibility tree (role + aria-value present); tab through `ai-tools-grid` and `timeline-list` and confirm a visible focus ring on both; check the timeline connector on a single-item list, a multi-item list, a list with a wrapped (two-line) title, and both clickable and non-clickable rows, at mobile and desktop widths.

## Rock F — Admin panel visualization (High impact, admin-only scope)

**Files:** `src/features/admin/admin-page.tsx`, `src/features/admin/components/stat-card.tsx`, `src/features/admin/components/usage-summary-row.tsx`

**Approach:** Dropped the original sparkline-per-`StatCard` idea entirely — verified in `admin-page.tsx` that every `StatCard` (`total_users`, `verified_users`, `total_cv_documents`, `total_cv_analyses`, `total_job_descriptions`, `total_job_matches`) receives a single lifetime total with no per-bucket series behind it at all; a sparkline there would be fabricated data. Similarly, `ai_usage_last_24h/7d/30d` are three independent **cumulative windows**, not sequential time buckets, so they must not be rendered as a trend/sparkline (would imply a false time series). The only change in this rock: replace `usage-summary-row.tsx`'s tooltip-only (`title=`) column labels with one shared, visible labeled header row (calls/tokens/cost) used by both the summary section and the by-feature section, so touch/keyboard users can read them without hovering. (Dropped the optional relative-magnitude bar from an earlier revision of this plan — it made scope ambiguous without adding a clearly-needed fix; the header-label fix alone addresses the audit's actual finding.)

**Non-goals:** no new dependency, no changes to what data is fetched, no invented time-series visualization anywhere in this rock.

**Proof:** `npm run build` + `npm run lint` green. Manual: `/admin` shows one shared visible-header grid/table structure (not tooltip-only) used consistently by both the usage-summary and by-feature sections; verify with keyboard navigation and touch (no hover-only affordance remains), at narrow viewport width, and with a long feature-name label (localization/overflow check).

## Rock G — Multi-axis quality radar chart (stretch, new dependency)

**Files:** `frontend/package.json`, `frontend/package-lock.json` (will be modified by `npm install recharts` — reviewed for the dependency it adds, not read line-by-line like hand-written source), `src/features/cv-analysis/components/analysis-result.tsx`, new `src/features/cv-analysis/components/quality-radar.tsx`

**Approach:** Add `recharts` (lightest maintained React chart lib, tree-shakeable, SVG-based, composes fine with Tailwind/theme tokens) as a new dependency. Build a small radar/spider chart component for the 5-axis quality breakdown (language/section/experience/education/skills), placed above or beside the existing `QualityCard` grid in `analysis-result.tsx` (the existing cards stay — this is additive, not a replacement). Use `--chart-1` as the single series color for the radar fill/stroke, not one hue per axis — a 5-color-per-axis radar has no defined legend or meaning for a single respondent's scores, so per-axis color would be decorative noise rather than information. If per-axis color is wanted later, it needs a real legend; out of scope for this rock.

**Non-goals:** do not remove the per-axis `QualityCard`s; the radar is a summary view, not a replacement for the detail cards. Not deferred despite being the smallest-impact rock — kept in this cycle per explicit user choice; scope is kept tight (single-series, additive) to match that impact level.

**Proof:** `npm run build` + `npm run lint` green (after `npm install recharts` — this rock's Codex build call needs `-c sandbox_workspace_write.network_access=true`, announced before running). Manual: CV analysis result page renders a 5-axis radar chart above/alongside the quality cards using `--chart-1`, values match the cards' scores; check it at mobile width (not clipped/unreadable) and in both light and dark mode (readable contrast) with axis labels visible; with an all-100 score set, confirm the shape reaches the outer edge without overflowing/clipping the container; with an all-zero score set (which geometrically collapses to a single center point on any radar chart — that collapse itself is not a bug), confirm the axis labels stay readable and a visually-hidden text summary of the five scores is present as an accessible fallback for screen-reader/keyboard users, since the SVG chart itself won't be meaningfully navigable at any score.
