'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

type Props = HTMLMotionProps<'div'> & { delay?: number; y?: number; as?: 'div' | 'li' | 'p' | 'span' };

/** One consistent entrance: rise + fade, expo-out, triggered once in view. */
export function Reveal({ delay = 0, y = 28, as = 'div', children, ...rest }: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: reduce ? 0.2 : 1.05, ease: [0.16, 1, 0.3, 1], delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Line-by-line masked headline reveal. Each child line slides up from behind a clip. */
export function MaskedLines({ lines, className = '', lineClassName = '', delay = 0 }: { lines: React.ReactNode[]; className?: string; lineClassName?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={reduce ? { opacity: 0 } : { y: '105%' }}
            whileInView={reduce ? { opacity: 1 } : { y: '0%' }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{ duration: reduce ? 0.2 : 1.2, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
