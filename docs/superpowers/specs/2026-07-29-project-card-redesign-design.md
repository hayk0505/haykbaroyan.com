# Project Card Redesign — Design

**Status:** approved, ready for planning
**Extends:** `docs/superpowers/plans/2026-07-26-angular-frontend.md` (same project, same SDD ledger — new tasks append at Task 31)
**New reference:** `Hayk Baroyan Portfolio_v3.html` (repo root) — a self-contained bundled export whose actual page markup is a compressed/escaped JSON payload, not directly readable as HTML. A decoded copy of its template was extracted to this session's scratchpad; the exact values quoted below are ground truth for planning/implementation — treat them as authoritative rather than re-decoding the file.

## Why

The v3 reference reworks how each project is presented on `/projects`: a numbered index + status line replaces today's single badge pill, the action icon moves out of the card's top-right corner into a text+icon CTA row at the bottom, and each screenshot gains a fake browser-chrome frame (traffic-light dots + a URL pill) above it. The page shell around the cards — nav, hero eyebrow/heading/description, footer — is unchanged; its text was verified identical to the live `projects-page.html`/`.scss`, so this work is scoped entirely to `ProjectCard` and the two data entries it renders.

## Goals

- Redesign `ProjectCard`'s template and styles to match the v3 reference card layout exactly (including the two hover micro-interactions the reference adds).
- Add new copy fields to `ProjectEntry`/`ProjectCard`: `previewUrl` (decorative browser-bar URL) and `ctaLabel` (bottom CTA row text); rename `badgeLabel` → `statusLabel`.
- Derive the "01"/"02" index from the project's position in the list rather than storing it in data.
- Swap `imageSide` for both existing entries to match the reference's actual layout (see Data changes — this reference alternates the opposite way from the current live site).

## Non-goals

- No change to `projects-page.html`/`.scss`'s intro section, `HeaderNav`, or `Footer` — already match the reference.
- No change to real navigation behavior: `linkHref`, `routerLink`, and `external` keep their current values (both projects still link out to their GitHub repos, both `external: true`). `previewUrl` and `ctaLabel` are decorative copy only — the reference itself uses placeholder `href="#"` links throughout, so its copy doesn't imply new internal case-study routes or a live-demo page. Concretely: the reference renders project 2's CTA icon as `→` (as if it were an in-app link), but since `external` stays `true` for the real GitHub link, the icon keeps rendering `↗` via the existing `external() ? '↗' : '→'` logic. This is a deliberate deviation — the icon reflects real link behavior, not the mockup's placeholder copy.
- No new shared design tokens. Every *reused* color in the reference maps 1:1 onto an existing `_tokens.scss` entry (`#a68763`→`$color-accent`, `#211f1a`→`$color-bg-surface-alt`, `#eae0d2`→`$color-cream`, `#d7c9ae`→`$color-chip`, `#2d2d2d`→`$color-ink`, `#dfd3ba`→`$color-bg-elevated-light`, `#2b2921`→`$color-bg-elevated-dark`, `#f4eede`→`$color-input-bg`; `#54503f` is treated as equivalent to `$color-ink-muted` at `#57503f` — a few RGB units apart, not a real distinct color). Three values in the reference have no existing token and are single-use decorative shades scoped to one component, so they're added as local SCSS variables in `project-card.scss` rather than shared tokens (see Styling): the dark chrome-wrapper background `#1a1915`, the light-variant screenshot-placeholder background `#d3c6a9`, and the muted-accent `#8a6f4a` (used for the light variant's middle chrome dot and its status-label color).

## Data changes — `app/src/app/data/projects.data.ts`

```ts
export interface ProjectEntry {
  statusLabel: string;   // renamed from badgeLabel
  heading: string;
  description: string;
  tags: string[];
  linkHref: string;
  routerLink: string;
  external: boolean;
  imageSide: 'left' | 'right';
  variant: 'dark' | 'light';
  previewUrl: string;    // new — decorative URL shown in the chrome bar
  ctaLabel: string;      // new — CTA row text
  screenshotCaption: string;
  imageSrc?: string;
}
```

Per-entry changes (index is derived in the template, not stored):

| Field | DigitalDustLibrary (today → new) | EU Deepfake Toolkit (today → new) |
|---|---|---|
| `statusLabel` (was `badgeLabel: '01 · IN BUILD — EXTERNAL ↗'` / `'02 · LIVE DEMO — CASE STUDY ↗'`) | `'IN BUILD · EXTERNAL SITE'` | `'LIVE DEMO · CASE STUDY'` |
| `previewUrl` (new) | `'digitaldustlibrary.com'` | `'haykbaroyan.com/projects/eu-deepfake'` |
| `ctaLabel` (new) | `'Visit live site'` | `'Read case study & run demo'` |
| `imageSide` | `'left'` → **`'right'`** | `'right'` → **`'left'`** |

Everything else (`heading`, `description`, `tags`, `linkHref`, `routerLink`, `external`, `variant`, `screenshotCaption`, `imageSrc`) is unchanged.

The `imageSide` swap is a real, confirmed layout change: in the reference, project 1's `r-cardbody` markup comes *before* its `r-thumb` markup (content left, image right), and project 2's `r-thumb` comes first (image left, content right) — the opposite of the current live alternation.

## Component — `project-card.ts`

- Add `index = input.required<number>()`.
- Add `previewUrl = input.required<string>()`.
- Add `ctaLabel = input.required<string>()`.
- Rename `badgeLabel` → `statusLabel`.
- `hasDestination`, `external`, `imageSide`, `variant` computed/inputs are unchanged.

## Template — `project-card.html` / `projects-page.html`

`projects-page.html`'s `@for` passes the new inputs, including the derived index:

```html
@for (project of projects; track project.heading; let i = $index) {
  <app-project-card
    [index]="i + 1"
    [previewUrl]="project.previewUrl"
    [ctaLabel]="project.ctaLabel"
    [statusLabel]="project.statusLabel"
    ... (existing inputs, minus badgeLabel)
  />
}
```

`project-card.html`'s `content` template is restructured:

**Card body** (single flex column, no more two-wrapper `justify-content: space-between` split — replaced by `margin-top: auto` on the tags row, matching the reference exactly):
1. Top row: `{{ index() }}` (zero-padded, e.g. `01`) + `{{ statusLabel() }}`, `display:flex; align-items:center; gap:14px`.
2. `<h2>` heading (unchanged binding).
3. `<p>` description (unchanged binding).
4. Tags row — unchanged `@for` over `tags()`, but now `margin-top: auto` instead of living in a separate bottom wrapper.
5. New CTA row: `{{ ctaLabel() }}` text + the circular icon span (`{{ external() ? '↗' : '→' }}`) — this is the same icon markup/logic that currently lives in the top row, just relocated here.

**Image panel** (rendered left or right per `imageSide()`, same conditional structure as today) is wrapped in a new chrome shell:
```html
<div class="project-card__image" ...>
  <div class="project-card__chrome-bar">
    <span class="project-card__chrome-dot project-card__chrome-dot--1"></span>
    <span class="project-card__chrome-dot project-card__chrome-dot--2"></span>
    <span class="project-card__chrome-dot project-card__chrome-dot--3"></span>
    <span class="project-card__chrome-url">{{ previewUrl() }}</span>
  </div>
  <div class="project-card__screenshot">
    @if (imageSrc()) { <img ... /> } @else { <span>{{ screenshotCaption() }}</span> }
  </div>
</div>
```
The photo/placeholder `@if`/`@else` logic itself is untouched — only nested one level deeper inside the new `__screenshot` box, which the chrome bar now sits above.

## Styling — `project-card.scss`

- Grid ratio: `1fr 1.1fr` → **`1fr 1.15fr`** (base, image-left case) and `1.1fr 1fr` → **`1.15fr 1fr`** (`--image-right` modifier) — image column stays `1fr`, content column grows slightly.
- New hover interactions (mirroring the exact `transition`/`:hover` pattern already used in `action-card.scss`):
  - `.project-card--dark { transition: border-color 0.15s ease; &:hover { border-color: rgba($color-cream, 0.5); } }`
  - `.project-card--light { transition: transform 0.15s ease; border: none; &:hover { transform: translateY(-2px); } }` — the reference drops the border on the light variant entirely (it reads fine against the dark page background without one); the dark variant keeps its existing `1px solid rgba($color-cream, 0.16)` border.
- `.project-card__image` becomes a flex column (`padding: 20px 20px 0`) holding the new chrome bar + `.project-card__screenshot`, instead of being the directly-styled photo/placeholder box itself.
- New `.project-card__chrome-bar`: `display:flex; align-items:center; gap:8px; padding:0 4px 12px`.
- New `.project-card__chrome-dot`: 10px circle. Colors per variant:
  - Dark: 1st `$color-accent`, 2nd `$color-chip`, 3rd `rgba($color-cream, 0.3)`.
  - Light: 1st `$color-accent`, 2nd the local one-off `$_muted-accent: #8a6f4a`, 3rd `rgba($color-ink, 0.25)`.
- New `.project-card__chrome-url`: `flex:1; margin-left:10px; font:400 10.5px $font-label; border-radius:7px; padding:6px 12px`. Dark: `color: rgba($color-cream, 0.5); background: $color-bg-surface;`. Light: `color: rgba($color-ink, 0.55); background: $color-input-bg;`.
- `.project-card__screenshot` (renamed from today's `.project-card__image` inner styling): keeps the existing diagonal-stripe-placeholder-or-photo behavior, `border-radius: 10px` only on the top corners (chrome bar now owns the card's outer top corner), `min-height: 230px` (reduced from 340px since the chrome bar now takes some of that vertical space — total card height stays visually close to today's).
  - Dark placeholder background: unchanged `$color-bg-elevated-dark` pattern, but the chrome-bar's own wrapper (`.project-card__image` dark) uses the local one-off `$_dark-chrome-bg: #1a1915` (close to but distinct from `$color-bg-surface-alt`, per the reference).
  - Light placeholder background: local one-off `$_light-screenshot-bg: #d3c6a9` (distinct from `$color-bg-elevated-light`, which the wrapper itself still uses).
- Index number: `font: 700 30px $font-heading; color: $color-accent;`.
- Status label: `font: 400 11px $font-label; letter-spacing: 0.12em;`. Dark: `color: rgba($color-cream, 0.55)`. Light: `color: $_muted-accent` (the same `#8a6f4a` used for the light chrome dot).
- Heading: bump `40px/0.98` → `42px/0.96`, letter-spacing `-0.02em` → `-0.03em`, margin `18px 0 14px` → `20px 0 14px` (mobile override stays as-is).
- Description: `line-height 1.6 → 1.62`, `max-width 460px → 480px`, add `margin-bottom: 24px` (was `margin: 0`) — the description now sits directly above the `margin-top: auto` tags row rather than in a separate top wrapper.
- CTA row (new): `display:flex; align-items:center; gap:10px; margin-top:26px; font:700 12px $font-label;` containing the relocated 34px icon circle (`.project-card__icon` — styling unchanged, dark/light variants unchanged).
- `.projects-page__list` gap: `24px` → `26px` (in `projects-page.scss`).

### Mobile (`@media (max-width: $breakpoint-mobile)`)

No new breakpoint logic — the existing single-column stacking stays. The chrome bar renders above the screenshot in the stacked layout the same way it does on desktop; `.project-card__image` mobile min/max-height rules (currently `150px`/`170px`) apply to the combined chrome+screenshot wrapper, same as they apply to the image wrapper today.

## Testing

- `project-card.spec.ts`: update for the renamed `statusLabel` input, the two new required inputs (`index`, `previewUrl`, `ctaLabel`), and the relocated CTA icon markup (now paired with `ctaLabel()` text instead of standing alone in the top row).
- `projects-page.spec.ts`: update for the new `[index]`/`[previewUrl]`/`[ctaLabel]` bindings passed from the `@for` loop.
- `projects.data.ts`'s two entries get the new field values and swapped `imageSide` per the table above.
- No new test framework or coverage expectations beyond what the existing plan (Tasks 1–30) already established.

## File Structure Additions

None — this work only modifies existing files (`project-card.ts/.html/.scss`, `projects-page.html/.scss`, `projects.data.ts`, and their `.spec.ts` files). No new components or routes.
