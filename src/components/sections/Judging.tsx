'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CRITERIA } from '@/content/event';
import { SectionHead } from '@/components/ui/SectionHead';
import { Reveal } from '@/components/ui/Reveal';

/** Deterministic pseudo-barcode: bar widths vary, but each band's total width is exactly its weight. */
function bars(seed: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const v = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    const r = v - Math.floor(v);
    return Math.round((0.18 + r * 0.55) * 1000) / 1000; // fraction of the slot the bar fills (rounded: SSR == client)
  });
}

export function Judging() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const uid = useId();
  const c = CRITERIA[active];

  return (
    <section id="judging" aria-labelledby="judging-title" className="section-y relative bg-night">
      <div className="shell">
        <SectionHead
          id="judging-title"
          index="04"
          label="Judging"
          title={['Scored like', <span key="b">a <span className="text-ember">startup</span>, not a demo.</span>]}
          aside={<>Six weighted criteria — one quarter of the score rewards AI-first execution. Read the barcode: every band is as wide as its weight.</>}
        />

        <div className="mt-16 lg:mt-24">
          {/* The barcode */}
          <div role="tablist" aria-label="Scoring criteria" className="flex h-[clamp(9rem,22vw,15rem)] w-full items-stretch gap-[clamp(4px,0.6vw,10px)]">
            {CRITERIA.map((cr, i) => {
              const selected = i === active;
              const pattern = bars(i + 1, Math.max(5, Math.round(cr.weight * 1.15)));
              return (
                <button
                  key={cr.name}
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + CRITERIA.length) % CRITERIA.length;
                      setActive(next);
                      document.getElementById(`${uid}-tab-${next}`)?.focus();
                    }
                  }}
                  style={{ flexGrow: cr.weight, flexBasis: 0 }}
                  className="group relative flex min-w-0 cursor-pointer items-stretch outline-offset-4"
                >
                  <span className="sr-only">
                    {cr.name}, {cr.weight} percent
                  </span>
                  <span aria-hidden className="flex w-full items-stretch">
                    {pattern.map((w, b) => (
                      <span key={b} className="flex flex-1 justify-center">
                        <motion.span
                          initial={reduce ? false : { scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 + b * 0.012 }}
                          style={{ width: `${(w * 100).toFixed(1)}%` }}
                          className={`block origin-bottom transition-colors duration-500 ${selected ? 'bg-ember' : 'bg-champagne/30 group-hover:bg-champagne/60'}`}
                        />
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Weights under the bands (desktop) */}
          <div aria-hidden className="mt-4 hidden w-full gap-[clamp(4px,0.6vw,10px)] md:flex">
            {CRITERIA.map((cr, i) => (
              <div key={cr.name} style={{ flexGrow: cr.weight, flexBasis: 0 }} className={`min-w-0 border-t pt-3 transition-colors duration-500 ${i === active ? 'border-ember text-champagne' : 'border-[var(--rule-strong)] text-muted'}`}>
                <p className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-none tabular">{cr.weight}%</p>
                <p className="label mt-2 hidden lg:block normal-case tracking-[0.04em] text-[0.75rem] leading-snug">{cr.name}</p>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="mt-12 grid-12 gap-y-6 border-t border-[var(--rule-strong)] pt-10 lg:mt-16 min-h-[12rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-12 grid-12 gap-y-6"
              >
                <p className="col-span-4 font-display text-[clamp(4rem,10vw,9rem)] leading-[0.8] text-ember tabular lg:col-span-3">
                  {c.weight}
                  <span className="text-[0.35em] align-top text-muted">%</span>
                </p>
                <div className="col-span-8 lg:col-span-5">
                  <p className="label text-muted">
                    Criterion {String(active + 1).padStart(2, '0')} / {String(CRITERIA.length).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 font-display text-h3">{c.name}</h3>
                </div>
                <div className="col-span-12 lg:col-span-4">
                  <p className="label text-muted">What judges look for</p>
                  <p className="mt-3 text-[1.125rem] leading-relaxed">{c.looksFor}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <Reveal>
            <p className="label mt-12 max-w-3xl text-muted normal-case tracking-[0.04em] text-[0.8125rem] leading-relaxed">
              The same criteria apply to the online round and the finale. Shortlisting follows the organisers’ evaluation process; organisers may request clarification or a demonstration, and selection decisions are final.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
