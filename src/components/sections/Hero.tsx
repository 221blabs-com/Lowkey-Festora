'use client';

import { useRef } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { TicketStage } from '@/components/ticket/TicketStage';
import { TicketButton } from '@/components/ui/TicketButton';
import { PhaseStatus } from '@/components/ui/PhaseStatus';
import { ArrowDown } from '@/components/ui/Icons';
import { EVENT, FEES, MILESTONES } from '@/content/event';
import { REGISTER_URL, SITE_URL } from '@/lib/config';
import { formatINR } from '@/lib/format';

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progress.current = v;
  });
  const yTop = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-28%']);
  const yBottom = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.2, ease, delay },
  });

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-[var(--header-h)]">
      {/* Atmosphere: an oxblood pool of light under the ticket */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_55%_52%,#3a121b_0%,#1a0a0e_55%,#110609_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 guilloche opacity-60 [mask-image:linear-gradient(to_top,#000,transparent)]" />

      <div className="shell relative flex min-h-[calc(100svh-var(--header-h))] flex-col pb-8 lg:pb-10">
        {/* Top rail */}
        <motion.div {...rise(0.1)} className="flex items-start justify-between gap-6 pt-6 lg:pt-8">
          <p className="label text-muted">
            <span className="text-ember">{EVENT.kind}</span>
            <span className="hidden sm:inline"> · Pan-India · Hyderabad finale</span>
          </p>
          <p className="label text-muted text-right">
            Edition <span className="text-champagne">2026</span>
          </p>
        </motion.div>

        {/* Display type — the ticket floats between the two lines */}
        <h1 id="hero-title" className="relative mt-6 font-display text-mega text-champagne lg:mt-4">
          <span className="sr-only">{`${EVENT.fullName} — ${EVENT.kind}. ${EVENT.tagline.join(' ')}`}</span>
          <motion.span aria-hidden style={{ y: yTop }} className="block">
            <span className="block overflow-hidden">
              <motion.span className="block" initial={reduce ? { opacity: 0 } : { y: '100%' }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: 1.4, ease, delay: 0.15 }}>
                Lowkey
              </motion.span>
            </span>
          </motion.span>
          <motion.span aria-hidden style={{ y: yBottom }} className="block text-right">
            <span className="block overflow-hidden">
              <motion.span className="block" initial={reduce ? { opacity: 0 } : { y: '100%' }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: 1.4, ease, delay: 0.27 }}>
                Tech
              </motion.span>
            </span>
          </motion.span>
        </h1>

        {/* The ticket: inline on small screens, full-bleed behind/over the type on large */}
        <motion.div
          style={{ opacity: fade }}
          className="relative -mx-[var(--gutter)] my-2 aspect-[5/3] lg:pointer-events-none lg:absolute lg:inset-0 lg:m-0 lg:aspect-auto"
        >
          <TicketStage registerUrl={`${SITE_URL}${REGISTER_URL}`} progressRef={progress} className="h-full w-full lg:translate-y-[2%]" />
        </motion.div>

        {/* Bottom strip */}
        <div className="relative mt-auto grid-12 gap-y-8 pt-6 lg:pt-0 items-end">
          <motion.div {...rise(0.55)} className="col-span-12 md:col-span-6 lg:col-span-4">
            <p className="font-display text-h3 text-balance">
              {EVENT.tagline[0]}
              <br />
              <span className="text-ember">{EVENT.tagline[1]}</span>
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <TicketButton href={REGISTER_URL}>Register your team</TicketButton>
              <a href="#brief" className="label link-line text-muted hover:text-champagne pb-1 inline-flex items-center gap-2">
                Explore <ArrowDown size={12} />
              </a>
            </div>
            <p className="label mt-5 text-muted">
              {formatINR(FEES.online.amount)} + {formatINR(FEES.online.platformFee)} fee per participant · teams of 2–5
            </p>
          </motion.div>

          <motion.dl {...rise(0.7)} className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-6 grid grid-cols-3 border-t border-[var(--rule-strong)]">
            {MILESTONES.map((m) => (
              <div key={m.id} className="pt-4 pr-3">
                <dt className="label text-muted">{m.label.replace('Offline ', '')}</dt>
                <dd className="mt-2 font-display text-[clamp(1.375rem,2vw,1.875rem)] leading-none tabular">
                  {m.dayRange.join('–')} <span className="text-[0.6em] text-muted">Dec</span>
                </dd>
                <dd className="label mt-2 text-muted normal-case tracking-[0.06em]">{m.id === 'finale' ? `${EVENT.city} · 24h` : m.id === 'online' ? 'Remote · 48h' : 'Announced'}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div {...rise(0.85)} className="col-span-12 lg:col-span-2 lg:col-start-11 lg:text-right">
            <PhaseStatus align="end" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
