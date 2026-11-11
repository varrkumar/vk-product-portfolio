/*
 * Site-wide visual flags. Change here; every component reads from here.
 *
 * FRAME_STYLE — controls how images are framed across the whole site:
 *   'hairline'  1px solid --ink-20 border (clean, typographic)
 *   'taped'     no border; two tape strips across the top corners (notebook, tactile)
 *   Visit /frame-demo to compare both before committing.
 *
 * WORDMARK_SVG — when true, looks for public/wordmark.svg and renders it instead
 *   of the italic serif "vk." text. Place your handwriting export at that path.
 */
export const FRAME_STYLE: 'hairline' | 'taped' = 'hairline';
export const WORDMARK_SVG = false;
