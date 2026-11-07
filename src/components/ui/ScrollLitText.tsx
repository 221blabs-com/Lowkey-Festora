'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/** Words brighten from dim to full as the paragraph travels up the viewport. */
export function ScrollLitText({ text, highlight = [], className = '' }: { text: string; highlight?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = text.split(' ');
  const hl = new Set(highlight.map((h) => h.toLowerCase()));

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={hl.has(w.replace(/[^\w-]/g, '').toLowerCase())} still={!!reduce}>
            {w}
          </Word>
        ))}
      </span>
    </p>
  );
}

function Word({ children, progress, range, accent, still }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean; still: boolean }) {
  // Same markup either way (hydration-safe); reduced motion just keeps every word fully lit.
  const opacity = useTransform(progress, range, still ? [1, 1] : [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className={accent ? 'text-ember' : undefined}>
        {children}
      </motion.span>{' '}
    </>
  );
}
