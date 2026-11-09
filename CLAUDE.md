# vk_product_portfolio

Personal portfolio. Its central job is to communicate **product thinking**: how I approach ambiguous problems, research, find insights, make decisions, weigh trade-offs, and learn from results. Disciplines: product management, HCI, AI/ML, research, creative technology.

## Creative direction: "Margins"

The site is an annotated working notebook. The clean, final narrative lives in the main column. The thinking lives in the margins: annotations, struck-through reframes, rejected options, questions I asked myself.

Experience principles:
- Simple at first glance, surprising on exploration.
- Strong typographic hierarchy; editorial, asymmetric compositions; generous white space.
- Restrained, meaningful motion. Nothing animates without a reason.
- Navigation is always conventional and obvious (Work, Play, About). Surprise lives inside pages, never in finding your way around.
- No walls of text. No corporate or generic writing.

Avoid: SaaS landing-page aesthetics, glassmorphism, gradients, glows, generic card grids, random scroll animations, component-library look.

## Visual system

Colors (this is the whole palette, add nothing without asking):
- `--paper: #F3F0E8` (background — **temporary, will be revisited**; too close to Claude's UI cream)
- `--ink: #1C1B18` (text)
- `--pencil: #2D45B8` (annotations, the only accent; used sparingly)
- Derived greys only from ink at reduced opacity.

Type:
- Editorial serif with optical sizes for text and display: Newsreader (or Source Serif 4). Self-host via Fontsource.
- A mono for metadata, labels, dates: IBM Plex Mono.
- Margin notes use `--font-hand`. This is currently set to Kalam (a placeholder). It will be replaced with a font cut from real handwriting — do not change the font itself without being asked, only the token value. `--font-hand-alt` holds Nanum Pen Script for comparison purposes only.

Layout:
- Tufte-style sidenotes: wide main column + narrow margin column on desktop; margin notes collapse inline (tap to reveal) on mobile.
- Annotations are placed beside the text they refer to, not at the bottom.

Motion:
- Annotations draw in with SVG stroke animation (stroke-dashoffset), slow and quiet.
- Page transitions via the View Transitions API where supported.
- Everything must have a complete static fallback under `prefers-reduced-motion`.

## Case study anatomy

Each case study follows this section order. Sections are separated by white space only — no horizontal rules. Each section has a small mono number + short handwritten label positioned in the margin beside it.

| # | Name | Form |
|---|------|------|
| — | **Opening** | `<Reframe original="…" reframed="…" />`. Role/timeline/team in a margin note beside it. No eyebrow, no title, no grey summary. |
| 01 | **Brief** | 2–3 sentences of plain prose. What I was asked to do. |
| 02 | **Research / Found** | A `<PullQuote>` spanning main+margin, with `tally` count in the margin. Then plain prose. |
| 03 | **Insight** | One large-type moment (`font-size: var(--text-xl)` or larger). The turn. Use `<Annotate type="circle">` on the key phrase. |
| 04 | **Decision** | `<Options items={[…]} chosen={n} />`. Rejected options struck through, chosen circled by Rough Notation. Brief prose explaining why. |
| 05 | **Outcome** | Large numbers in `.outcome-metrics.span-to-margin`. An honest margin note. |
| — | **Coda** | One italic sentence. What I'd do differently or what I learned. |

Component palette:
- `<Reframe original="…" reframed="…" />` — animated strikethrough + new question
- `<PullQuote tally={n} tallyLabel="of N said this" tallyId="…">` — wide quote with tally marks
- `<Options items={[…]} chosen={n} />` — decision option list
- `<Annotate type="underline|circle|box|bracket|strike-through">` — Rough Notation in --pencil
- `<Margin id="…" type="note|annotation|question">` — sidenote beside prose

## Signature interactions

- **Show your work** toggle on every case study. Off: clean, skimmable narrative. On: margins fill with the messy middle (assumptions, what changed my mind, what I cut).
- **Reframes**: key sentences show an earlier belief struck through, followed by the new one.
- **Versions**: a scrubber through design iterations (v0 → final) with a margin note at each step.
- **Evidence markers**: insights tagged `assumed` / `observed` / `validated`.
- **Your call** (planned, build later): a blue-pencil margin question gives the reader the same options and evidence I had; they choose, then see my actual decision, reasoning and outcome. Leave room for it in the case study component system.

## Personal layer

Rule: every hidden detail must be true about me, and none may block content. Max one hidden moment per page, never on the main reading path. Ideas: local time with a true status line, 404 as "a page I didn't write", a /drafts page of killed ideas, margin asides in my own voice, a console note for engineers, a "currently" line, one recurring hand-drawn glyph marking insights. Build this layer last.

## Tech

- **Astro** (TypeScript, strict), static output, deployed on Vercel with a custom domain. Check the current Astro docs before using an API; don't rely on memory for version-specific details.
- **Content collections** with a typed schema for case studies, so every case study has structured frontmatter: problem, role, timeline, constraints, decisions (options, chosen, rationale, confidence: assumed/observed/validated), outcome, reflection. Interactions render from this data.
- **MDX** for case study bodies, with custom components: `<Margin>`, `<Reframe>`, `<PullQuote>`, `<Options>`, `<Annotate>`, `<Evidence>`, `<Versions>`, `<ShowYourWork>`, later `<YourCall>`.
- **Rough Notation** (`rough-notation`) is installed and wired via `Base.astro`. It draws in on scroll (IntersectionObserver), static under `prefers-reduced-motion`. Use it only via the `<Annotate>` component or by adding `data-rn-type` + `data-rn-color` attributes.
- **No UI framework by default.** Astro components render static HTML; interactive pieces are small vanilla TypeScript scripts or web components. Add a framework (Svelte or Preact) only if an interaction truly needs it, and ask first.
- **Page transitions:** native cross-document View Transitions in CSS (`@view-transition { navigation: auto; }`), no client-side router.
- **Fonts:** self-hosted variable fonts via Fontsource, preloaded, `font-display: swap`.
- **Styling:** plain CSS with custom properties for tokens (`src/styles/tokens.css`), scoped styles in components. No Tailwind, no component library.
- **Motion:** CSS first; GSAP or Motion only where CSS can't do it, and ask first.
- **Images:** Astro's built-in image optimization.
- **Extras:** `@astrojs/sitemap`, RSS later if there's writing, Plausible analytics at launch.
- **Budgets:** near-zero JS on the homepage, fast LCP, full keyboard access, all content readable linearly in the DOM, Lighthouse 95+ across the board.

Suggested structure:
```
src/
  content/case-studies/*.mdx
  content/play/*.mdx
  content.config.ts        (collection schemas)
  components/notebook/     (Margin, Reframe, Evidence, Versions, ShowYourWork)
  layouts/                 (Base, CaseStudy)
  pages/                   (index, work, play, about, 404, colophon)
  styles/                  (tokens.css, global.css)
```

## Build order

1. Design tokens, fonts, type scale, base layout with margin column.
2. One complete case study with real content and the signature interactions.
3. Homepage.
4. Work, Play, About.
5. Hidden personal layer.

## Working with me

- Show me the result in the browser (`npm run dev`) before moving to the next step.
- Ask before adding dependencies or new colors/fonts.
- Never invent facts about my projects or me. Use clear placeholders like `[TODO: outcome metric]` instead.
