/*
 * entries.ts — single source of truth for every portfolio entry.
 *
 * Used by: landing page, section index pages (/work, /projects, /design),
 * CaseStudyHeader next-entry footer, and anywhere an entry title or
 * route is referenced so nothing is typed twice.
 *
 * Loop order for the five case studies (next-entry footer):
 *   01 us-bank -> 02 workbench-hr -> 03 biomotivate -> 04 halo -> 05 girls-on-the-run -> 01
 *
 * Editing rules:
 * - Every fact comes from notes/intake-*.md or the raw files. No invented details.
 * - handed / turnedOut: short phrases (aim for <=12 words each), shown inline on the landing page.
 * - summary: one sentence, <=35 words, used as the hero lede.
 * - footerQ: the question shown on the PREVIOUS entry's footer, framing this entry's angle.
 * - draft: true = noindex, not linked from landing page (US Bank until manager approves).
 */

export type Section = 'work' | 'projects' | 'design';
export type Depth = 'case-study' | 'short';

export interface Entry {
  slug: string;
  section: Section;
  /** "01"–"05" for the five numbered case studies; undefined for short entries */
  num?: string;
  title: string;
  /** Company, class, or org name shown in the hero eyebrow and landing row */
  context: string;
  year: string;
  role: string;
  /** One sentence, <=35 words. Used as the hero lede and landing-page summary. */
  summary: string;
  /** Short phrase: what was assigned or given */
  handed: string;
  /** Short phrase: what it turned out to really be about */
  turnedOut: string;
  /**
   * Question shown on the PREVIOUS entry's "Next entry" footer to frame this entry's angle.
   * Stored on the destination entry; the footer looks it up from the next item in CASE_STUDIES.
   */
  footerQ: string;
  depth: Depth;
  /** If true: add noindex meta, do not link from landing page. Remove once approved. */
  draft?: boolean;
}

// ─── Five numbered case studies, in loop order ────────────────────────────────

export const CASE_STUDIES: Entry[] = [
  {
    slug: 'us-bank',
    section: 'work',
    num: '01',
    title: 'U.S. Bank',
    context: 'U.S. Bank',
    year: '2026',
    role: 'Product Management Intern',
    summary:
      'I redesigned how teams at U.S. Bank ask the AI Center of Excellence for help: from a confusing form to a cited chatbot to a platform with an intake agent, then ran a workshop that became the reuse roadmap.',
    handed: 'make it easy for teams to request AI work',
    turnedOut: 'reuse was a documentation problem, not a search problem',
    footerQ: 'What does it actually take to reuse what AI teams have already built?',
    depth: 'case-study',
  },
  {
    slug: 'workbench-hr',
    section: 'work',
    num: '02',
    title: 'WorkBench HR',
    context: 'WorkBench HR',
    year: '2026',
    role: 'Product and UX',
    summary:
      'A startup founder came to us with only an idea: AI HR for small businesses. I ran feature prioritization, designed the core screens, built the front end, and assembled the pitch.',
    handed: 'take an AI HR idea from zero to something real',
    turnedOut: 'design the whole vision, build only what proves it',
    footerQ: "What's the smallest thing you can build that proves the whole idea?",
    depth: 'case-study',
  },
  {
    slug: 'biomotivate',
    section: 'work',
    num: '03',
    title: 'Biomotivate',
    context: 'Biomotivate',
    year: '2025',
    role: 'Product Intern',
    summary:
      'I was hired to fix the interface of a VR therapy platform at an addiction recovery house. The real problem was that patients had stopped finding anything in it worth watching.',
    handed: 'fix the interface',
    turnedOut: 'patients had stopped finding anything worth watching',
    footerQ: "Honestly, I wouldn't have even noticed it.",
    depth: 'case-study',
  },
  {
    slug: 'halo',
    section: 'projects',
    num: '04',
    title: 'Halo',
    context: 'CMU UCRE',
    year: '2026',
    role: 'Project Lead',
    summary:
      'Users of AI design tools rarely notice the bias in what those tools generate. Halo is a companion that learns which biases you care about, asks before you generate, and flags what it finds.',
    handed: 'help everyday users of AI design tools notice and address bias',
    turnedOut: "users don't look for bias while generating, so Halo comes to them",
    footerQ: 'What happens when a campaign sells the wrong reason to show up?',
    depth: 'case-study',
  },
  {
    slug: 'girls-on-the-run',
    section: 'projects',
    num: '05',
    title: 'Girls on the Run',
    context: 'Design for America',
    year: '2025–26',
    role: 'UX Research and Design',
    summary:
      'The recruitment posters for Girls on the Run coaches sold low time commitment. Coaches actually stay for the girls, and that gap was why recruitment was not working.',
    handed: 'support coach recruitment and expand reach',
    turnedOut: 'the posters sold time commitment; coaches stay for the girls',
    footerQ: 'What does it take to make it easy to ask an entire AI team for help?',
    depth: 'case-study',
  },
];

// ─── Short entries ─────────────────────────────────────────────────────────────

export const SHORT_ENTRIES: Entry[] = [
  {
    slug: 'sous',
    section: 'projects',
    title: 'Sous',
    context: 'CMU Human-AI Interaction',
    year: '2026',
    role: '[TODO: role]',
    summary:
      'A hands-free AI cooking companion that watches your pan, tracks where you are in the recipe, and speaks up only when it is useful.',
    handed: 'help home cooks follow recipes hands-free',
    turnedOut: 'knowing when to advance and when to stay quiet is the whole problem',
    footerQ: '',
    depth: 'short',
  },
  {
    slug: 'depop-pop-ups',
    section: 'projects',
    title: 'Depop Pop-Ups',
    context: 'CMU BTG',
    year: '2026',
    role: 'Product Strategy',
    summary:
      'A product strategy pitch for Depop: bring the in-person thrifting experience into the app through pop-up events, keeping the transaction on the platform.',
    handed: 'pitch a product strategy for Depop',
    turnedOut: 'the real risk was transactions leaving the platform',
    footerQ: '',
    depth: 'short',
  },
  {
    slug: 'data-science-club',
    section: 'design',
    title: 'Data Science Club',
    context: 'CMU',
    year: '2023–25',
    role: 'Design Director',
    summary:
      "Two years as Design Director of CMU's Data Science Club: brand identity, event graphics, and the website for the first Poker AI competition, which the next board reused the following year.",
    handed: 'design the club identity and the competition site',
    turnedOut: 'design something the next board can reuse',
    footerQ: '',
    depth: 'short',
  },
  {
    slug: 'women-in-product',
    section: 'design',
    title: 'Women in Product',
    context: 'CMU',
    year: '2025–26',
    role: 'Director of Publicity',
    summary:
      'Brand identity, social media, and a website for Women in Product at CMU, with a logo designed from the start to feel inclusive.',
    handed: 'run publicity for Women in Product at CMU',
    turnedOut: '[TODO: turned-out line]',
    footerQ: '',
    depth: 'short',
  },
  {
    slug: 'echos',
    section: 'design',
    title: 'echos',
    context: 'XHacks → independent',
    year: '[TODO: year]',
    role: '[TODO: role]',
    summary:
      'A voice-based, location-based social app: leave short voice notes pinned to places for friends, strangers, or your future self to find.',
    handed: '[TODO: handed line]',
    turnedOut: '[TODO: turned-out line]',
    footerQ: '',
    depth: 'short',
  },
];

// ─── Combined list (case studies first, then short entries) ───────────────────

export const ALL_ENTRIES: Entry[] = [...CASE_STUDIES, ...SHORT_ENTRIES];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the next case study in the loop (wraps from last back to first). */
export function nextCaseStudy(currentSlug: string): Entry {
  const idx = CASE_STUDIES.findIndex(e => e.slug === currentSlug);
  return CASE_STUDIES[(idx + 1) % CASE_STUDIES.length];
}

/** Returns all entries in a given section, case studies first. */
export function bySection(section: Section): Entry[] {
  return ALL_ENTRIES.filter(e => e.section === section);
}
