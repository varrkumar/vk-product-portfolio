/*
 * covers.ts — one cover image per entry, used for homepage hover thumbnails.
 * When a real cover exists, import it here. Halo + Sous have no image yet;
 * they're omitted so the homepage shows no thumbnail for those rows.
 */
import type { ImageMetadata } from 'astro';

import workbenchHr   from '../assets/workbench-hr/dashboard-flow.png';
import biomotivate   from '../assets/biomotivate/after-discover.png';
import gotr          from '../assets/girls-on-the-run/cover.jpg';
import depop         from '../assets/depop-pop-ups/cover.png';
import dsc           from '../assets/data-science-club/mascot-agents.png';
import wip           from '../assets/women-in-product/logo-brand.png';
import echos         from '../assets/echos/hackathon-prototype.png';

export const COVERS: Partial<Record<string, ImageMetadata>> = {
  'workbench-hr':   workbenchHr,
  'biomotivate':    biomotivate,
  'girls-on-the-run': gotr,
  'depop-pop-ups':  depop,
  'data-science-club': dsc,
  'women-in-product':  wip,
  'echos':          echos,
};
