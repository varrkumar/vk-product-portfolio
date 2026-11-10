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
- `--paper: #ffffff` (background — white for now; revisit if a tinted paper feel is wanted later)
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

Every case study page uses the 3-column grid: **120px gutter | max-640px main | max-270px margin**. Sections are separated by padding only — no horizontal rules. The "show your work" toggle controls two CSS classes: `.sw-note` (margin notes) and `.sw-mark` (inline pencil marks); both transition opacity 0↔1.

### Section order

| # | Label | Component | Notes |
|---|-------|-----------|-------|
| — | — | `<CaseStudyHeader entryNum="03" />` | Logo + nav + toggle |
| — | — | `<HeroReframe original="…" reframed="…" entryNum marginNote marginSub />` | Wavy SVG strikethrough in .sw-mark; handwritten margin note in .sw-note |
| 01 | the brief | `<SectionRow num label>` with `<Fragment slot="main">` and `<Fragment slot="margin">` | Plain prose. Margin note in .sw-note. Inline SVG annotations via `<Annotate>`. |
| 02 | listening | `<SectionRow>` | Research context. |
| — | — | Pull quote row: bare `<section class="cs-row">` with empty gutter, blockquote in col 2, `<Tally>` + note in col 3 as `.sw-note` | |
| 03 | the turn | `<InsightLine num label validated observed assumed>` | 50px wide text spanning col 2+3. Confidence markers below. |
| 04 | the decision | `<Fork num label context options rationale knew />` | Chosen option: hand-drawn circle SVG (.sw-mark) + "what I chose" label (.sw-note). Rejected: pencil strikethrough + "path not taken" note (.sw-note). Margin: "What I knew at the time" list (.sw-note). |
| 05 | versions | `<Versions num label versions defaultIdx />` | Tabs + range scrubber. Wide (col 2+3). Version panels with sketch placeholder. Handwritten note per version in .sw-note. |
| 06 | what happened | `<SectionRow>` wrapping `<OutcomeStats stats />` | 3 large numbers. Honest margin note. |
| 07 | if again | `<Reflection num label>` | Handwritten (Kalam) wide text in pencil. |
| — | — | `<footer class="cs-row">` | Next entry link + p.s. note |

### Component signatures

```astro
<CaseStudyHeader entryNum="03" />

<HeroReframe
  original="Why is the sharing interface confusing?"
  reframed="Why won't scientists share an idea before it's finished?"
  marginNote="Lead product designer. 14 weeks…"
  marginSub="(this reframe is the whole story…)"
/>

<SectionRow num="01" label="the brief" pb="88px">
  <Fragment slot="main">…</Fragment>
  <Fragment slot="margin">…</Fragment>
</SectionRow>

<SectionRow num="03" label="the turn" wide>
  <Fragment slot="main">…wide content…</Fragment>
</SectionRow>

<InsightLine num="03" label="the turn"
  validated="Validated in 6 of 6 interviews"
  observed="Observed in usage logs"
  assumed="Assumed: true outside this lab">
  The interface wasn't the barrier. <em>The social contract was.</em>
</InsightLine>

<Fork
  num="04" label="the decision"
  context="Prose framing of the choice."
  options={[
    { label: "Option A — the path not taken.", pathNotTaken: "Why I'd pick it in another situation." },
    { label: "Option B — what I actually did.", chosen: true },
  ]}
  rationale="Why I chose B, written in past tense."
  knew={[
    { text: "Evidence that pointed here.", confidence: "observed" },
    { text: "Something I had to assume.", confidence: "assumed" },
  ]}
/>

<Versions
  num="05" label="versions" defaultIdx={3}
  versions={[{ name, when, text, note }]}
/>

<OutcomeStats stats={[{ number: "2.8×", label: "more ideas shared" }]} />

<Reflection num="07" label="if again">
  Next time I'd…
</Reflection>

<Annotate type="circle|underline|box|bracket|strike-through">phrase</Annotate>
```

### show your work system

Add `.sw-note` to any margin aside that should toggle. Add `.sw-mark` to any inline SVG pencil annotation. The toggle in `CaseStudyHeader` sets/unsets `html.show-work`. The default is ON (the class is added on page load in the header script).

## Signature interactions

- **Show your work** toggle on every case study. Off: clean, skimmable narrative. On: margins fill with the messy middle (assumptions, what changed my mind, what I cut).
- **Reframes**: key sentences show an earlier belief struck through, followed by the new one.
- **Forks**: decisions shown statically — options side by side, chosen one circled in pencil, rejected ones struck through with "path not taken" notes, margin column lists what I knew at the time with confidence markers.
- **Versions**: a scrubber through design iterations (v0 → final) with a margin note at each step.
- **Evidence markers**: insights tagged `assumed` / `observed` / `validated`.

## Personal layer

Rule: every hidden detail must be true about me, and none may block content. Max one hidden moment per page, never on the main reading path. Ideas: local time with a true status line, 404 as "a page I didn't write", a /drafts page of killed ideas, margin asides in my own voice, a console note for engineers, a "currently" line, one recurring hand-drawn glyph marking insights. Build this layer last.

## Tech

- **Astro** (TypeScript, strict), static output, deployed on Vercel with a custom domain. Check the current Astro docs before using an API; don't rely on memory for version-specific details.
- **Content collections** with a typed schema for case studies, so every case study has structured frontmatter: problem, role, timeline, constraints, decisions (options, chosen, rationale, confidence: assumed/observed/validated), outcome, reflection. Interactions render from this data.
- **MDX** for case study bodies, with custom components: `<CaseStudyHeader>`, `<HeroReframe>`, `<SectionRow>`, `<InsightLine>`, `<Fork>`, `<Versions>`, `<OutcomeStats>`, `<Reflection>`, `<Tally>`, `<Annotate>`.
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

## Content and notes

All project content lives in `notes/` (git-ignored; some intakes hold confidential details). Read the relevant intake before writing any case study or entry, and never publish anything an intake marks confidential.

- `notes/handoff.md`: where the last session left off. Read it first.
- `notes/content-map.md`: site sections, which projects are case studies vs. short entries, throughlines. Start here.
- `notes/intake-<project>.md`: one per project (biomotivate, us-bank, workbench-hr, halo, dfa-gotr, sous, depop-popups, dsc, women-in-product, echos). `[TODO]` = missing from me; `(inferred)` = not confirmed. Keep both as visible placeholders, don't fill them in.
- `notes/voice-guide.md`: how I write. Follow it for all copy.
- `notes/creative-direction.md`: design decisions log. Where it conflicts with this file on visual tokens (e.g. paper color), this file wins.
- Raw images and decks: `case study raw contents/<project>/` (also git-ignored).

Decisions from Nov 9, 2026 that override older text in this file:
- **"Your call" is dropped.** Decisions are shown, not quizzed: a static `<Fork>` component lays the options side by side, the chosen one circled in pencil ("what I chose"), the others struck through with a handwritten "path not taken: when I'd pick it" note, then the reasoning; margin lists "What I knew at the time" with confidence markers. Ignore "Your call candidate" fields in the intakes.
- **Case study hero is traditional:** use `<CaseHero>` (eyebrow, title, one-line lede, Role / Timeline / Team / Focus / Results row, wide cover image). The reframe ("handed: … / turned out: …") lives only as its handwritten margin note. `<HeroReframe>` is no longer used on case studies. See `src/pages/work/biomotivate.astro` as the reference page.
- **Nav is Work · Projects · Design · About** (not Work, Play, About). Play pieces live under Design.

## Working with me

- Show me the result in the browser (`npm run dev`) before moving to the next step.
- Ask before adding dependencies or new colors/fonts.
- Never invent facts about my projects or me. Use clear placeholders like `[TODO: outcome metric]` instead.
