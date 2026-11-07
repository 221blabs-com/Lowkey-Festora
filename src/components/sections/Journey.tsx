'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { EVENT, FEES, MILESTONES } from '@/content/event';
import { formatINR } from '@/lib/format';
import { Reveal } from '@/components/ui/Reveal';

const PANEL_VW = 60;
const INTRO_VW = 40;
const TAIL_VW = 6;
const TRACK_VW = INTRO_VW + PANEL_VW * MILESTONES.length + TAIL_VW;

function fee(id: string) {
  if (id === 'online') return { amount: formatINR(FEES.online.amount), note: 'per participant' };
  if (id === 'finale') return { amount: formatINR(FEES.finale.amount), note: 'per participant · additional' };
  return null;
}

function Stop({ m, i, variant }: { m: (typeof MILESTONES)[number]; i: number; variant: 'h' | 'v' }) {
  const f = fee(m.id);
  return (
    <article aria-labelledby={`stop-${variant}-${m.id}`} className="relative flex h-full flex-col justify-between p-[clamp(1.5rem,3vw,3.5rem)]">
      <header className="flex items-start justify-between gap-6">
        <p className="label text-ember">Stop {m.index}</p>
        <p className="label text-muted text-right">{m.where}</p>
      </header>

      <div className="my-10 lg:my-0">
        <p className="font-display leading-[0.78] tracking-[-0.04em] text-[clamp(5.5rem,17vw,9rem)] lg:text-[clamp(7rem,13vw,15rem)] tabular">
          {m.dayRange.length > 1 ? (
            <>
              {m.dayRange[0]}
              <span className="text-outline text-sand">–{m.dayRange[1]}</span>
            </>
          ) : (
            m.dayRange[0]
          )}
        </p>
        <p className="label mt-4 text-muted">
          December 2026 · {m.format}
        </p>
      </div>

      <div className="grid gap-6 border-t border-[var(--rule-strong)] pt-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <h3 id={`stop-${variant}-${m.id}`} className="font-display text-h3">
            {m.label}
          </h3>
          <p className="mt-3 max-w-[46ch] text-muted">{m.body}</p>
          {m.id === 'finale' ? <p className="label mt-4 text-champagne/80">Venue · {EVENT.venue}</p> : null}
        </div>
        {f ? (
          <div className="sm:text-right">
            <p className="font-display text-[2.5rem] leading-none text-champagne">{f.amount}</p>
            <p className="label mt-2 text-muted">{f.note}</p>
          </div>
        ) : (
          <p className="label text-muted sm:text-right">No fee</p>
        )}
      </div>
      <span className="sr-only">{i < MILESTONES.length - 1 ? 'Next stop follows.' : ''}</span>
    </article>
  );
}

/** Semicircle bites where two ticket segments meet (the Festora notch). */
function Bites({ vertical = false }: { vertical?: boolean }) {
  return vertical ? (
    <>
      <span aria-hidden className="absolute -left-4 top-0 h-8 w-8 -translate-y-1/2 rounded-full bg-ink" />
      <span aria-hidden className="absolute -right-4 top-0 h-8 w-8 -translate-y-1/2 rounded-full bg-ink" />
      <span aria-hidden className="perf-x absolute inset-x-6 top-0 -translate-y-1/2 text-sand/60" />
    </>
  ) : (
    <>
      <span aria-hidden className="absolute -top-4 left-0 h-8 w-8 -translate-x-1/2 rounded-full bg-ink" />
      <span aria-hidden className="absolute -bottom-4 left-0 h-8 w-8 -translate-x-1/2 rounded-full bg-ink" />
      <span aria-hidden className="perf-y absolute inset-y-6 left-0 -translate-x-1/2 text-sand/60" />
    </>
  );
}

export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], ['0vw', `${-(TRACK_VW - 100)}vw`]);
  const fill = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <section ref={ref} id="journey" aria-labelledby="journey-title" className="relative lg:h-[340vh]">
      {/* Large screens: pinned horizontal travel along one long ticket */}
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:overflow-hidden">
        <div className="shell lg:hidden pt-[var(--section-y)]">
          <JourneyIntro id="journey-title" />
        </div>

        <motion.div style={reduce ? undefined : { x }} className="hidden lg:flex lg:items-stretch" >
          <div className="flex shrink-0 flex-col justify-center pl-[var(--gutter)] pr-12" style={{ width: `${INTRO_VW}vw` }}>
            <JourneyIntro />
          </div>
          <div className="relative flex h-[72svh] max-h-[46rem] shrink-0 bg-oxblood" style={{ width: `${PANEL_VW * MILESTONES.length}vw` }}>
            {MILESTONES.map((m, i) => (
              <div key={m.id} className="relative h-full" style={{ width: `${PANEL_VW}vw` }}>
                {i > 0 ? <Bites /> : null}
                <Stop m={m} i={i} variant="h" />
              </div>
            ))}
          </div>
          <div aria-hidden className="shrink-0" style={{ width: `${TAIL_VW}vw` }} />
        </motion.div>

        {/* Progress rail */}
        <div className="shell mt-8 hidden lg:block" aria-hidden>
          <div className="relative h-px bg-[var(--rule)]">
            <motion.div style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-ember" />
          </div>
          <div className="mt-3 flex justify-between label text-muted">
            <span>Anywhere in India</span>
            <span>{EVENT.city}</span>
          </div>
        </div>

        {/* Small screens: the same ticket, stacked */}
        <div className="shell lg:hidden pb-[var(--section-y)] pt-12">
          <div className="bg-oxblood">
            {MILESTONES.map((m, i) => (
              <Reveal key={m.id} className="relative">
                {i > 0 ? <Bites vertical /> : null}
                <Stop m={m} i={i} variant="v" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyIntro({ id }: { id?: string }) {
  return (
    <div>
      <p className="label flex items-center gap-3 text-muted">
        <span className="text-ember">§ 02</span>
        <span aria-hidden className="h-px w-10 bg-current opacity-40" />
        <span>The journey</span>
      </p>
      <h2 id={id} className="mt-6 font-display text-h2 text-balance">
        Two rounds. <span className="text-ember">One ticket.</span>
      </h2>
      <p className="mt-6 max-w-[34ch] text-muted text-[1.0625rem] leading-relaxed">{EVENT.reach} Fifteen days from first commit to final pitch.</p>
    </div>
  );
}
