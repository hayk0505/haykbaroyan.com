# haykbaroyan.com — Design Brief

## What this site is

A personal portfolio/professional site for Hayk Baroyan — Senior Front-End Engineer (React, Angular) currently expanding into backend development (C#/.NET 10). This is the "professional shell": the site you'd hand a recruiter, hiring manager, or client. It is deliberately separate from DigitalDustLibrary (his multi-author blog/magazine, different domain, different tone/audience).

Built in Angular with prerendering (SSG) for SEO/indexation.

## Audience & tone

Primary audience: recruiters and HR doing an initial screen — they spend seconds, not minutes, and want fast, unambiguous answers (who is this, what do they do, are they qualified, how do I reach them). Secondary audience: technical hiring managers / peers who click through to see actual work.

Tone: professional, confident, not corporate-stiff. Should read as competent and building-in-public rather than purely a static resume — this is meant to say something about him, not just list facts.

## Site structure

**`/` — Landing**
- Title + tagline + short description (see copy below), above the fold
- Two cards below: **CV** and **Projects** — CV should carry slightly more visual weight/priority since it's the primary artifact a recruiter is there for
- Persistent nav/contact links (email, LinkedIn, GitHub) visible on every page, not just buried in CV
- Must stack cleanly on mobile (a lot of traffic will be a recruiter tapping a LinkedIn link on a phone)

**`/cv`**
- Experience — chronological, ending at VOLO (no mention of kondgaming ownership)
- Skills
- Contact section (includes a working contact form — separate infra concern, not a design blocker)
- "Download CV as PDF" button

**`/projects`**
- Two cards:
  - **DigitalDustLibrary** — external link out to the live site
  - **EU Deepfake Toolkit** — internal link to `/projects/eu-deepfake`
- Each card: thumbnail/screenshot, short blurb, tech stack tags

**`/projects/eu-deepfake`**
- Write-up/description of the thesis project + an embedded live demo (has its own working backend already — this is a real interactive tool, not just a screenshot page)

## Copy (current draft, adjustable)

**Title:** Hayk Baroyan
**Tagline:** Front-End Engineer, building full-stack.
**Description:** Senior front-end engineer with deep React and Angular experience, now going deep on .NET 10 to build and ship complete systems myself — not just the UI layer. Co-founder of a 9-person startup, and finishing a Master's on multimodal deepfake detection.

(This is the "builder/founder" framing — leans into the fuller story rather than a bare-bones recruiter-only summary. Open to swapping for something leaner if the design reads too busy with this much text in the hero.)

## Style references

_Paste mood-board links, competitor/inspiration sites, color preferences, or font direction here before handing this off for design._

-
-
-
