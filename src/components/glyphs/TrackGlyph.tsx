import type { MissionId } from '@/content/event';

/**
 * Monoline mission glyphs drawn in the Festora mark's language: square terminals,
 * one stroke weight, and the ticket notch where it means something.
 * Every element uses pathLength=1 so CSS can draw it on hover.
 */
const P = { pathLength: 1, vectorEffect: 'non-scaling-stroke' as const };

const GLYPHS: Record<MissionId, React.ReactNode> = {
  // Small-Business Startup: a shopfront with an awning and an open door.
  startup: (
    <>
      <path {...P} d="M8 20V8h32v12" />
      <path {...P} d="M6 20l3-9h30l3 9" />
      <path {...P} d="M6 20v3a4 4 0 0 0 8 0v-3M14 20v3a4 4 0 0 0 8 0v-3M22 20v3a4 4 0 0 0 8 0v-3M30 20v3a4 4 0 0 0 8 0v-3M38 20v3a4 4 0 0 0 4-4v2" />
      <path {...P} d="M10 23v19h28V23" />
      <path {...P} d="M19 42V29h10v13" />
    </>
  ),
  // Better City: a skyline, like the Hyderabad streets the mission builds for.
  city: (
    <>
      <path {...P} d="M5 42h38" />
      <path {...P} d="M8 42V24h8v18M16 42V12h10v30M26 42V20h7v22M33 42V7h8v35" />
      <path {...P} d="M19 18h4M19 24h4M19 30h4M36 14h2M36 20h2" />
    </>
  ),
};

export function TrackGlyph({ id, className = '' }: { id: MissionId; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className={`glyph ${className}`} aria-hidden="true">
      {GLYPHS[id]}
    </svg>
  );
}
