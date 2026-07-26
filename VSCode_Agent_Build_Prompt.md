# Prompt for VS Code coding agent — haykbaroyan.com frontend

Paste the block below into your VS Code agent (Claude Code / Copilot / Cursor) once the Angular workspace is scaffolded. It assumes the repo already contains `design-reference/portfolio-mockup.html`.

Note on the design reference: the file you gave me (`Hayk Baroyan Portfolio.html`) is a compiled/bundled prototype export (fonts and JS packed as base64 blobs, custom `sc-if`/`sc-camel-on-click` prototype tags for the fake in-file routing) — not something a coding agent can parse directly. I decompiled it and saved a clean, plain static HTML export at `design-reference/portfolio-mockup.html`, with the three screens marked as `<div data-screen="home">`, `<div data-screen="projects">`, `<div data-screen="cv">`, and the prototype-only routing attributes stripped out. That's the file to point the agent at — it has the exact markup, copy, and inline styles from the approved design.

---

## The prompt

```
Build the Angular frontend for haykbaroyan.com using `design-reference/portfolio-mockup.html`
as the exact source of truth for layout, copy, colors, fonts, and spacing. Do not redesign or
reinterpret anything — convert the existing markup faithfully into Angular. The file has three
sections marked with data-screen="home" / "projects" / "cv" — these are Home (`/`), Projects
(`/projects`), and CV (`/cv`) respectively.

ARCHITECTURE
- Angular, standalone components, Angular Router with three routes: '', 'cv', 'projects'.
- No SSR. Use `ng add @angular/ssr` purely for its prerendering (SSG) capability — configure
  build-time prerendering for all three known routes. There is no live Node server involved;
  the output must be static files servable directly by a reverse proxy (Caddy), same as any
  other static site. Do not wire up a runtime rendering server.
- A fourth route, `/projects/eu-deepfake`, will be added later (it has its own existing .NET
  backend to embed a live demo) — don't build it now, but don't structure routing in a way
  that makes adding it later awkward.

COMPONENT BREAKDOWN
Extract shared pieces before building the three pages, so nothing gets rebuilt slightly
differently three times:
- `HeaderNavComponent` — the site header/nav (logo, Home/CV/Projects links, Contact
  mailto, Email/LinkedIn/GitHub pill buttons). Identical across all three screens except
  which nav link is highlighted active — pass the active route in or derive it from the
  Router.
- `FooterComponent` — the copyright + contact links bar, identical across all three screens.
- `TagChipComponent` — the small pill/badge used everywhere (tech stack tags on the home
  cards, project cards, and CV experience/skills sections). Take label text and a
  filled/outlined variant as inputs rather than repeating the inline styles per instance.
- `SectionHeadingComponent` — the repeated "220px label column + content column" layout
  used for Experience / Skills / Education on the CV page (heading + small caption under it).
- `ActionCardComponent` — the two large CTA cards on the Home page (CV card / Projects
  card). Take heading, description, tags, filled-or-outlined style, and a routerLink as inputs.
- `ProjectCardComponent` — the project entries on the Projects page (DigitalDustLibrary /
  EU Deepfake Toolkit). Take image-side (left/right), heading, description, tags, link, and
  filled-or-outlined style as inputs so the alternating layout is one component, not two.
- `ExperienceEntryComponent` and `EducationEntryComponent` — repeated entries in their
  respective CV sections.

PAGES
- `HomeComponent` (`/`) — hero (availability label, headline, intro paragraph) + the two
  ActionCards + footer.
- `ProjectsComponent` (`/projects`) — page intro + two ProjectCards (DigitalDustLibrary
  links externally; EU Deepfake Toolkit will route internally to `/projects/eu-deepfake`
  once that page exists — for now just point it at a routerLink to that path even though
  the route doesn't resolve yet).
- `CvComponent` (`/cv`) — name/tagline header + "Download CV — PDF" button, then
  Experience, Skills (tech tag cloud + AI Tools card + Languages card), and Education
  sections, using the sub-components above.

DATA, NOT HARDCODED MARKUP
Pull actual content (experience entries, education entries, skills/tags, project blurbs)
from typed constants/data files (e.g. `experience.data.ts`, `education.data.ts`,
`projects.data.ts`), not hardcoded directly in templates — this mirrors the CV page and the
downloadable PDF needing to render from one shared data source later, so keep content and
template separate now. Source content is in `CV_Data.md` and `Projects_Page_Content.md` in
the repo root — use those for the actual copy/dates/companies.

STYLING
Convert the inline styles in the reference file into proper Angular component stylesheets
(component-scoped SCSS), pulling the repeated hex values (#26251f, #1c1b17, #EAE0D2,
#2D2D2D, #A68763, #D7C9AE, and the rgba(234,224,210,x) opacity variants) into a shared
SCSS variables/tokens file rather than repeating literals across components. Fonts: Space
Mono (headings), JetBrains Mono (labels/tags/dates), Instrument Sans (body text) — load via
Google Fonts as already linked in the reference file's <head>.

NOT YET DESIGNED — FLAG, DON'T IMPROVISE
The reference file has a "Contact" link in the nav (currently just a mailto:) but no actual
contact form UI — that hasn't been designed yet. Build a simple, unstyled-but-functional
form for now (name, email, message fields + submit) rather than inventing a polished design
for it, and flag it clearly as a placeholder pending real design. Functionally it needs to
POST to `/api/contact` (a Cloudflare Worker will intercept that path and call Resend — no
Angular-side backend work needed) and include a Cloudflare Turnstile widget before submit.
```
