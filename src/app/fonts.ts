import localFont from 'next/font/local';

/** Festora's brand display serif — the same family festora-v1 uses for headings. */
export const marcellus = localFont({
  src: '../fonts/Marcellus-Regular.woff2',
  weight: '400',
  variable: '--font-marcellus',
  display: 'swap',
});

/** Satoshi — shipped in festora-v1's public assets; reused here for UI and body copy. */
export const satoshi = localFont({
  src: '../fonts/Satoshi-Variable.woff2',
  weight: '300 900',
  variable: '--font-satoshi',
  display: 'swap',
});

/** Ticket data: dates, serials, labels. */
export const plexMono = localFont({
  src: [
    { path: '../fonts/IBMPlexMono-400.woff2', weight: '400' },
    { path: '../fonts/IBMPlexMono-500.woff2', weight: '500' },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
});

/*
 * None of the three families above contain the Indian rupee sign (U+20B9).
 * These ~1 KB single-glyph subsets sit next in each font stack so ₹ renders
 * in a matching style instead of whatever system font the browser picks.
 */
export const rupeeSerif = localFont({ src: '../fonts/Rupee-Serif.woff2', variable: '--font-rupee-serif', adjustFontFallback: false, preload: false });
export const rupeeSans = localFont({ src: '../fonts/Rupee-Sans.woff2', weight: '100 900', variable: '--font-rupee-sans', adjustFontFallback: false, preload: false });
export const rupeeMono = localFont({ src: '../fonts/Rupee-Mono.woff2', variable: '--font-rupee-mono', adjustFontFallback: false, preload: false });

export const fontVariables = [marcellus, satoshi, plexMono, rupeeSerif, rupeeSans, rupeeMono].map((f) => f.variable).join(' ');
