# Header Nav Redesign — Design

**Status:** approved, ready for planning
**Extends:** `docs/superpowers/plans/2026-07-26-angular-frontend.md` (same project, same SDD ledger — new tasks append at Task 33)
**New reference:** a photo (not a file in the repo) showing a compact rounded-pill navbar (dark bar containing a leading circular icon, inline text links "Work / About / Playground / Resource", and a trailing email pill) — used purely for the *concept* of "one rounded-pill container, items in a single inline row, leading circular icon slot." None of its literal labels, routes, or colors are used; this site's real nav links, logo, and existing color tokens replace them entirely.
**New asset:** `app/public/logo.svg` (already added to the repo, currently untracked) — a 200×200 rounded-square mark, `#2d2d2d` fill with a cream (`#ece3d0`-ish) stroked "d" glyph and dot. Pairs with the already-in-progress `favicon.ico` swap sitting uncommitted in the working tree (unrelated to this task, not touched here).

## Why

The current `HeaderNav` (`app/src/app/shared/header-nav/`) has a burger button and a nav-links panel, but `.header-nav__links` is `position: absolute; visibility: hidden` unconditionally — with no breakpoint guard, so the links are only ever reachable by opening the burger menu, on desktop too. There's also no site logo/mark in the header at all. This work replaces that with: a real logo linking home (replacing the "Home" text link), a burger-driven inline-expanding pill on mobile only, and the same pill visual treatment always-open on desktop with no burger.

## Goals

- Add `logo.svg` as a home link, positioned identically on mobile and desktop, immediately to the left of the nav pill.
- Remove "Home" from the nav link list (CV, Projects, Contact remain).
- Mobile (`≤ $breakpoint-mobile`, 720px): burger button is the pill's only visible content when closed; clicking it smoothly expands the same pill rightward to reveal the three links inline in one row, with the hamburger icon animating into an "X" (and back on close). The expanded state renders above other header content (z-index), not by pushing/reflowing it.
- Desktop (`> $breakpoint-mobile`): no burger button at all — the pill renders permanently expanded, showing the three links inline, with the same rounded-pill visual treatment (border, radius, background) the mobile pill uses when open.
- Leave the Email/LinkedIn/GitHub contact pills and the "Download CV" button exactly as they are today (`.header-nav__buttons` and its children are out of scope).

## Non-goals

- No tap-outside-to-close handler for the mobile menu. The existing full-screen dimming `.header-nav__backdrop` (and its click-to-close behavior) is removed — it fit the old "dropdown panel" pattern; the new inline-expanding pill doesn't need a scrim. Closing still works via re-clicking the burger (toggle) or clicking a nav link (existing `closeMenu()` call on link click, kept).
- No changes to `.header-nav__buttons`, `.header-nav__pill` (contact pills — note this existing class name collides with our new nav pill; see Renaming below), `.header-nav__download`, or any route/page content.
- No new design tokens — every color reuses existing `_tokens.scss` entries.

## Renaming to avoid collision

The existing contact-pill class is `.header-nav__pill` (singular, one per contact icon: Email/LinkedIn/GitHub). The new nav container needs its own distinct name to avoid confusion: `.header-nav__nav-pill` for the outer wrapper. Existing `.header-nav__pill`/`__pill-icon`/`__pill-label` are untouched.

## Template structure (`header-nav.html`)

```html
<header class="header-nav">
  <div class="header-nav__left">
    <a routerLink="/" class="header-nav__logo" aria-label="Home">
      <img src="/logo.svg" alt="" class="header-nav__logo-img" />
    </a>
    <div class="header-nav__nav-pill" [class.header-nav__nav-pill--open]="mobileMenuOpen()">
    <button
      type="button"
      class="header-nav__burger"
      (click)="toggleMenu()"
      [attr.aria-expanded]="mobileMenuOpen()"
      aria-label="Toggle navigation menu"
    >
      <span class="header-nav__burger-line header-nav__burger-line--top"></span>
      <span class="header-nav__burger-line header-nav__burger-line--mid"></span>
      <span class="header-nav__burger-line header-nav__burger-line--bottom"></span>
    </button>
    <nav class="header-nav__links">
      <a routerLink="/cv" routerLinkActive="header-nav__link--active" class="header-nav__link" (click)="closeMenu()">CV</a>
      <a routerLink="/projects" routerLinkActive="header-nav__link--active" class="header-nav__link" (click)="closeMenu()">Projects</a>
      <a routerLink="/contact" routerLinkActive="header-nav__link--active" class="header-nav__link" (click)="closeMenu()">Contact</a>
    </nav>
    </div>
  </div>
  <div class="header-nav__buttons">
    <!-- unchanged: Email / LinkedIn / GitHub pills + Download CV button -->
  </div>
</header>
```

`.header-nav` ends up with exactly two direct children — `.header-nav__left` (logo + nav-pill) and `.header-nav__buttons` — so its existing `justify-content: space-between` keeps working exactly as it does today. This replaces the old `.header-nav__container` (which only wrapped burger+links); the new `.header-nav__left` wraps the logo too, one level further out.

Removed entirely: the `@if (mobileMenuOpen()) { <div class="header-nav__backdrop" ...> }` block, and the `[routerLinkActiveOptions]="{ exact: true }"` Home link (link itself removed, not just the attribute).

`header-nav.ts` needs no changes at all — `mobileMenuOpen` signal, `toggleMenu()`, `closeMenu()` keep their exact current names/behavior, just applied to the new markup and the renamed `--open` modifier target (`.header-nav__nav-pill--open` instead of `.header-nav__links--open`).

## Mobile behavior (`≤ $breakpoint-mobile`)

`.header-nav__nav-pill` is `position: relative; display: inline-flex; align-items: center;`.

**Closed (default):**
- `.header-nav__burger`: 44×44px, `border-radius: 50%`, background `$color-bg-surface-alt`, `border: 1px solid rgba($color-cream, 0.22)`.
- `.header-nav__links`: `position: absolute; left: 44px; top: 0; height: 44px; display: flex; align-items: center; gap: 20px; padding: 0 20px 0 12px; white-space: nowrap; background: $color-bg-surface-alt; border: 1px solid rgba($color-cream, 0.22); border-left: none; border-radius: 0 22px 22px 0; opacity: 0; max-width: 0; overflow: hidden; pointer-events: none; z-index: 20; transition: max-width 0.25s ease, opacity 0.2s ease;`

**Open (`.header-nav__nav-pill--open`):**
- `.header-nav__burger` becomes `border-radius: 22px 0 0 22px` (flattens its right side so it visually fuses with the links panel into one continuous pill).
- `.header-nav__links` becomes `opacity: 1; max-width: 320px; pointer-events: auto;` — the `max-width` transition is what produces the smooth rightward expansion; `320px` comfortably fits three short links plus gaps and padding at this font size (verify against actual rendered width during implementation and adjust if links wrap).
- Because `.header-nav__links` is `position: absolute` (out of normal flow) with `z-index: 20`, expanding it never reflows or pushes the logo or `.header-nav__buttons` — it simply overlays on top of anything it visually overlaps, satisfying "opened menu must be on top of other elements in the header."

**Burger → X animation**, on `.header-nav__burger-line`, `transition: transform 0.2s ease, opacity 0.2s ease`:
- `--top`: closed = no transform; open = `translateY(7px) rotate(45deg)`
- `--mid`: closed = `opacity: 1`; open = `opacity: 0`
- `--bottom`: closed = no transform; open = `translateY(-7px) rotate(-45deg)`

(The 7px translate is derived from the existing 32px-tall burger's 3 lines at 2px height with 5px gaps, adjusted for the new 44px circular button — tune the exact value during implementation so the two rotated lines visually cross at the button's center; it does not need to be pixel-exact to this spec.)

## Desktop behavior (base rules, no media query) and mobile override

Matching this codebase's existing convention everywhere else (base rules target desktop; `@media (max-width: $breakpoint-mobile)` blocks add mobile-specific overrides), desktop is the *base* styling here, and all of the mobile-only pill/burger mechanics from the previous section live inside `@media (max-width: $breakpoint-mobile)` overrides:

**Base (desktop):**
- `.header-nav__burger { display: none; }` — no burger at all above the breakpoint.
- `.header-nav__links`: permanently visible pill — `display: flex; align-items: center; gap: 28px; padding: 12px 26px; background: $color-bg-surface-alt; border: 1px solid rgba($color-cream, 0.22); border-radius: 22px;` (no `position`, `opacity`, `max-width`, or `pointer-events` overrides needed at all — those only exist inside the mobile block below).
- `.header-nav__nav-pill { display: inline-flex; align-items: center; }`

**Mobile override (`@media (max-width: $breakpoint-mobile)`):**
- `.header-nav__nav-pill { position: relative; }`
- `.header-nav__burger { display: flex; ... }` (all of the 44×44 circular-button styling from the previous section)
- `.header-nav__links { position: absolute; left: 44px; top: 0; height: 44px; opacity: 0; max-width: 0; overflow: hidden; pointer-events: none; z-index: 20; transition: max-width 0.25s ease, opacity 0.2s ease; border-left: none; border-radius: 0 22px 22px 0; padding: 0 20px 0 12px; gap: 20px; }` (background/border color values stay the same as desktop's).
- `.header-nav__nav-pill--open .header-nav__burger { border-radius: 22px 0 0 22px; }`
- `.header-nav__nav-pill--open .header-nav__links { opacity: 1; max-width: 320px; pointer-events: auto; }`

The burger-line default styles and their `--open` transform rules (from the previous section) apply unscoped by any media query — harmless, since `.header-nav__burger`'s own `display: none` at desktop already makes its children's styling irrelevant there.

This produces the "same design, without burger menu, just open always" requirement on desktop — same background/border/radius language the mobile pill uses when open, permanently shown, no burger.

## Logo

```scss
.header-nav__logo {
  display: flex;
  margin-right: 14px; // spacing before the nav pill
}

.header-nav__logo-img {
  width: 40px;
  height: 40px;
  border-radius: 12px; // matches the mark's own rounded-square shape
  display: block;
}
```

Same rule at both breakpoints — no media query needed, matching "logo must be in the same place in both mobile + desktop."

## `header-nav.scss` structural changes

- Delete `.header-nav__backdrop` entirely (element removed from the template).
- Repurpose `.header-nav__container`'s rule (currently just `display: flex;`) as `.header-nav__left`'s rule — same `display: flex; align-items: center;` — now wrapping the logo + nav-pill instead of just the burger + links.
- Delete the current `.header-nav__links` / `.header-nav__links--open` rules and `.header-nav__burger` / `.header-nav__burger-line` rules; replace with the desktop-base + mobile-override rules above (`.header-nav__link--active` is kept as-is; `.header-nav__link` itself needs a small hover treatment now that it's no longer nested inside the old `.header-nav__links` rule — carry forward the existing `padding: 2px 12px` + `&:hover { background: rgba($color-cream, 0.06); }` treatment as `.header-nav__link`'s own top-level rule).
- `.header-nav` (outer flex row) keeps its existing `display: flex; align-items: center; justify-content: space-between;` — unchanged, since it still has exactly two direct children (`.header-nav__left`, `.header-nav__buttons`), same as before.

## Testing (`header-nav.spec.ts`)

- Remove the two backdrop tests ("renders no backdrop when the menu is closed" / "closes the mobile menu when the backdrop is clicked") — the element no longer exists.
- "closes the mobile menu when a nav link is clicked": change the clicked link from `a[routerLink="/"]` (the removed Home link) to `a[routerLink="/cv"]` (still closes via the same `closeMenu()` call).
- Add: a test asserting `a[routerLink="/"]` now renders as `.header-nav__logo` (the logo link) instead of a text "Home" link.
- Add: a test asserting the burger's `aria-expanded`/open class also flips `.header-nav__nav-pill`'s open modifier (or whatever the final open-state class ends up being applied to — assert against `.header-nav__nav-pill--open` presence).
- Existing CV-active / Contact-active / email-pill / GitHub-link / download-link tests are unaffected and stay as-is (they don't touch the removed elements).

## File Structure Additions

None — modifies only `header-nav.html`, `header-nav.scss`, `header-nav.spec.ts` (`header-nav.ts` is untouched, see above). `logo.svg` already exists in `app/public/` (untracked, will be committed as part of this work).
