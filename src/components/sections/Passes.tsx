'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EVENT, FEES, MILESTONES, TEAM } from '@/content/event';
import { formatINR } from '@/lib/format';
import { REGISTER_URL } from '@/lib/config';
import { TicketButton } from '@/components/ui/TicketButton';
import { SectionHead } from '@/components/ui/SectionHead';
import { Reveal } from '@/components/ui/Reveal';

function Amount({ value }: { value: number }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-flex overflow-hidden tabular">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { y: '100%' }}
          animate={{ y: '0%', opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="block"
        >
          {formatINR(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

type PassProps = {
  no: string;
  round: string;
  title: string;
  when: string;
  where: string;
  price: number;
  team: number;
  fee?: number;
  note: string;
  includes: readonly string[];
  stub: string;
  dark?: boolean;
};

/** A printed pass: main body + stub, notched at the perforation like the Festora mark. */
function Pass({ no, round, title, when, where, price, fee = 0, team, note, includes, stub, dark }: PassProps) {
  return (
    <article
      aria-label={`${title} pass`}
      className={`notch-y relative grid grid-cols-1 sm:grid-cols-[1fr_9.5rem] [--at:100%] sm:[--at:calc(100%-9.5rem)] ${dark ? 'bg-oxblood text-champagne' : 'bg-paper-2 text-paper-ink'}`}
    >
      <div className="relative p-[clamp(1.5rem,3vw,2.5rem)]">
        <div className="flex items-start justify-between gap-4">
          <p className={`label ${dark ? 'text-ember' : 'text-crimson'}`}>{round}</p>
          <p className={`label ${dark ? 'text-muted' : 'text-paper-muted'}`}>Nº {no}</p>
        </div>
        <h3 className="mt-6 font-display text-[clamp(2rem,3.4vw,3rem)] leading-none">{title}</h3>
        <dl className={`mt-6 grid grid-cols-2 gap-4 border-t pt-5 ${dark ? 'border-[var(--rule-strong)]' : 'border-[var(--rule-paper)]'}`}>
          <div>
            <dt className={`label ${dark ? 'text-muted' : 'text-paper-muted'}`}>When</dt>
            <dd className="mt-1.5">{when}</dd>
          </div>
          <div>
            <dt className={`label ${dark ? 'text-muted' : 'text-paper-muted'}`}>Where</dt>
            <dd className="mt-1.5">{where}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={`label ${dark ? 'text-muted' : 'text-paper-muted'}`}>Per participant</p>
            <p className="mt-1 font-display text-[clamp(3rem,5vw,4.5rem)] leading-[0.9] tabular">{formatINR(price)}</p>
            {fee ? <p className={`label mt-2 ${dark ? 'text-muted' : 'text-paper-muted'}`}>+ {formatINR(fee)} platform fee</p> : null}
          </div>
          <div className="text-right">
            <p className={`label ${dark ? 'text-muted' : 'text-paper-muted'}`}>Team of {team}</p>
            <p className="mt-1 font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-none">
              <Amount value={(price + fee) * team} />
            </p>
          </div>
        </div>
        <p className={`mt-6 text-[0.9375rem] ${dark ? 'text-muted' : 'text-paper-muted'}`}>{note}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {includes.map((x) => (
            <li key={x} className={`label border px-2.5 py-1.5 normal-case tracking-[0.06em] ${dark ? 'border-[var(--rule-strong)] text-champagne/90' : 'border-[var(--rule-paper)]'}`}>
              {x}
            </li>
          ))}
        </ul>
      </div>
      {/* Stub */}
      <div className="relative flex items-center justify-between gap-4 px-6 py-5 sm:flex-col sm:items-start sm:justify-between sm:py-8">
        <span aria-hidden className={`perf-x absolute inset-x-5 top-0 sm:hidden ${dark ? 'text-sand/60' : 'text-paper-muted/60'}`} />
        <span aria-hidden className={`perf-y absolute inset-y-5 left-0 hidden sm:block ${dark ? 'text-sand/60' : 'text-paper-muted/60'}`} />
        <p className={`label ${dark ? 'text-muted' : 'text-paper-muted'}`}>Admit</p>
        <p className="font-display text-[2.75rem] leading-none sm:text-[3.5rem]">{team}</p>
        <p className={`label sm:[writing-mode:vertical-rl] sm:rotate-180 ${dark ? 'text-muted' : 'text-paper-muted'}`}>{stub}</p>
      </div>
    </article>
  );
}

export function Passes() {
  const [team, setTeam] = useState(4);
  const sizes = Array.from({ length: TEAM.max - TEAM.min + 1 }, (_, i) => TEAM.min + i);

  return (
    <section id="passes" aria-labelledby="passes-title" className="on-paper section-y relative">
      <div className="shell">
        <SectionHead
          id="passes-title"
          tone="paper"
          index="07"
          label="Passes"
          title={['Your team’s', <span key="b" className="text-crimson">two tickets.</span>]}
          aside={<>Fees are per participant. Every team member registers and pays — the finale pass is an additional fee, only for shortlisted participants.</>}
        />

        {/* Team size control */}
        <Reveal className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-[var(--rule-paper)] py-5 lg:mt-20">
          <p id="team-size-label" className="label text-paper-muted">Team size</p>
          <div role="radiogroup" aria-labelledby="team-size-label" className="flex gap-1">
            {sizes.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={team === n}
                tabIndex={team === n ? 0 : -1}
                onClick={() => setTeam(n)}
                onKeyDown={(e) => {
                  const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                  if (!step) return;
                  e.preventDefault();
                  const next = Math.min(TEAM.max, Math.max(TEAM.min, n + step));
                  setTeam(next);
                  (e.currentTarget.parentElement?.children[next - TEAM.min] as HTMLElement | undefined)?.focus();
                }}
                aria-label={`${n} members`}
                className={`h-11 w-11 font-display text-xl transition-colors duration-300 ${team === n ? 'bg-paper-ink text-paper' : 'text-paper-ink hover:bg-paper-2'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-[0.9375rem] text-paper-muted">Teams of 2–5 · solo entries are not allowed.</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-2">
          <Reveal>
            <Pass
              no="01"
              round={`Round 01 · ${MILESTONES[0].format}`}
              title={FEES.online.label}
              when={MILESTONES[0].date}
              where="Remote · anywhere in India"
              price={FEES.online.amount}
              fee={FEES.online.platformFee}
              team={team}
              note={FEES.online.note + '.'}
              includes={['48-hour challenge', 'Two missions', 'E-Certificate eligibility']}
              stub="Dec 05–06 · Online"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Pass
              dark
              no="02"
              round="Round 02 · Shortlisted teams"
              title="Grand Finale"
              when={MILESTONES[2].date}
              where={`${EVENT.city}, ${EVENT.state}`}
              price={FEES.finale.amount}
              team={team}
              note={FEES.finale.note + '.'}
              includes={FEES.finaleCovers}
              stub="Dec 20–21 · Hyderabad"
            />
          </Reveal>
        </div>

        <div className="mt-14 grid-12 gap-y-10 items-start lg:mt-20">
          <Reveal className="col-span-12 lg:col-span-5">
            <p className="font-display text-h3">Register on Festora.</p>
            <p className="mt-4 max-w-[46ch] text-paper-muted">
              Pay securely with UPI, cards or netbanking via Razorpay. Each member receives a personal QR ticket by email the moment payment is verified.
            </p>
            <div className="mt-8">
              <TicketButton href={REGISTER_URL}>Register &amp; pay</TicketButton>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="col-span-12 lg:col-span-6 lg:col-start-7">
            <p className="label text-paper-muted">Before you pay</p>
            <ul className="mt-4">
              {FEES.rules.map((r) => (
                <li key={r} className="border-b border-[var(--rule-paper)] py-3.5 first:border-t text-[0.9875rem]">
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
