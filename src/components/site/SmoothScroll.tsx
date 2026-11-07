'use client';

import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from 'framer-motion';

/** Same Lenis setup as festora-v1, disabled entirely for reduced-motion users. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: { offset: -72 } }}>
      {children}
    </ReactLenis>
  );
}
