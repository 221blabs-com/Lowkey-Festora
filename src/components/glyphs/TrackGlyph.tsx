import type { TrackId } from '@/content/event';

/**
 * Monoline track glyphs drawn in the Festora mark's language: square terminals,
 * one stroke weight, and the ticket notch where it means something.
 * Every element uses pathLength=1 so CSS can draw it on hover.
 */
const P = { pathLength: 1, vectorEffect: 'non-scaling-stroke' as const };

const GLYPHS: Record<TrackId, React.ReactNode> = {
  health: (
    <>
      <path {...P} d="M18 6h12v12h12v12H30v12H18V30H6V18h12z" />
      <path {...P} d="M12 24h7l3-5 4 10 3-5h7" />
    </>
  ),
  fintech: (
    <>
      <circle {...P} cx="24" cy="24" r="18" />
      <path {...P} d="M17 15h14M17 21h14M21 15c7 0 8 12 0 12h-4l12 10" />
    </>
  ),
  cities: (
    <>
      <path {...P} d="M5 42h38" />
      <path {...P} d="M8 42V24h8v18M16 42V12h10v30M26 42V20h7v22M33 42V7h8v35" />
      <path {...P} d="M19 18h4M19 24h4M19 30h4M36 14h2M36 20h2" />
    </>
  ),
  edtech: (
    <>
      <path {...P} d="M24 13C18 9 11 9 6 11v27c5-2 12-2 18 2 6-4 13-4 18-2V11c-5-2-12-2-18 2z" />
      <path {...P} d="M24 13v27" />
    </>
  ),
  agritech: (
    <>
      <path {...P} d="M8 42h32" />
      <path {...P} d="M24 42V20" />
      <path {...P} d="M24 28C14 28 10 22 10 14c8 0 14 4 14 14z" />
      <path {...P} d="M24 21c0-8 6-13 14-13 0 8-5 13-14 13z" />
    </>
  ),
  security: (
    <>
      <path {...P} d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z" />
      <circle {...P} cx="24" cy="21" r="4" />
      <path {...P} d="M24 25v8" />
    </>
  ),
  automation: (
    <>
      <circle {...P} cx="11" cy="12" r="5" />
      <circle {...P} cx="37" cy="12" r="5" />
      <circle {...P} cx="24" cy="37" r="5" />
      <rect {...P} x="19" y="19" width="10" height="10" />
      <path {...P} d="M15 15l4 4M33 15l-4 4M24 29v3" />
    </>
  ),
  // Open innovation: the Festora ticket itself — an open door.
  open: (
    <>
      <path {...P} d="M5 14h38v7a3 3 0 0 0 0 6v7H5v-7a3 3 0 0 0 0-6z" />
      <path {...P} d="M32 16v16" />
      <path {...P} d="M12 24h12M20 20l4 4-4 4" />
    </>
  ),
};

export function TrackGlyph({ id, className = '' }: { id: TrackId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={`glyph ${className}`} aria-hidden="true">
      {GLYPHS[id]}
    </svg>
  );
}
