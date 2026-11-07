'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Hyderabad's Charminar as a monoline architectural elevation — drawn with the
 * same square-terminal stroke as the Festora mark, and inked in on scroll.
 */
const minaret = (cx: number) => [
  // shaft, three stepped stages
  `M${cx - 15} 380V206M${cx + 15} 380V206`,
  `M${cx - 21} 206h42v-7h-42z`,
  `M${cx - 12} 199V156M${cx + 12} 199V156`,
  `M${cx - 18} 156h36v-6h-36z`,
  `M${cx - 10} 150V116M${cx + 10} 150V116`,
  `M${cx - 16} 116h32v-6h-32z`,
  `M${cx - 7} 110V96M${cx + 7} 96V110`,
  // onion dome + finial
  `M${cx - 8} 96C${cx - 17} 87 ${cx - 13} 72 ${cx} 60C${cx + 13} 72 ${cx + 17} 87 ${cx + 8} 96Z`,
  `M${cx} 60V44`,
  // balcony arch details
  `M${cx - 8} 240q8-12 16 0M${cx - 8} 300q8-12 16 0M${cx - 6} 176q6-9 12 0M${cx - 5} 134q5-8 10 0`,
];

const gallery = Array.from({ length: 7 }, (_, i) => {
  const x0 = 126 + i * 21.4;
  return `M${x0 + 3} 196V186Q${x0 + 3} 176 ${x0 + 10.7} 173Q${x0 + 18.4} 176 ${x0 + 18.4} 186V196`;
});

const PATHS = [
  'M40 380H360',
  // main block
  'M115 380V200H285V380',
  'M115 200V164H285V200',
  'M108 164H292M108 158H292',
  'M118 158V150M140 158V150M162 158V150M184 158V150M206 158V150M228 158V150M250 158V150M272 158V150',
  // great arch (outer + inner)
  'M152 380V292Q152 244 200 214Q248 244 248 292V380',
  'M162 380V294Q162 254 200 228Q238 254 238 294V380',
  // side niches
  'M124 300V262Q124 248 133 244Q142 248 142 262V300M258 300V262Q258 248 267 244Q276 248 276 262V300',
  'M124 360V330Q124 318 133 314Q142 318 142 330V360M258 360V330Q258 318 267 314Q276 318 276 330V360',
  ...gallery,
  ...minaret(100),
  ...minaret(300),
];

export function Charminar({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="30 28 340 360" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" className={className} role="img" aria-label="Line drawing of the Charminar, Hyderabad">
      {PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.1 + i * 0.035 }}
        />
      ))}
    </svg>
  );
}
