'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ACCOMMODATION, BRING, EVENT, FACILITIES, FINALE_ARC, MILESTONES } from '@/content/event';
import { SectionHead } from '@/components/ui/SectionHead';
import { Reveal } from '@/components/ui/Reveal';
import { Charminar } from '@/components/glyphs/Charminar';

const START_H = 11; // finale opens 11:00 on Dec 19 (planned)
const toHours = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h + m / 60 - START_H + 24) % 24;
};
const polar = (r: number, hours: number) => {
  const a = (hours / 24) * Math.PI * 2 - Math.PI / 2;
  // Rounded so server and client serialise identical attribute strings.
  return [Math.round((200 + r * Math.cos(a)) * 100) / 100, Math.round((200 + r * Math.sin(a)) * 100) / 100] as const;
};
function arc(r: number, from: number, to: number) {
  const span = (to - from + 24) % 24 || 24;
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, from + span - 0.06);
  return `M${x1} ${y1}A${r} ${r} 0 ${span > 12 ? 1 : 0} 1 ${x2} ${y2}`;
}

function Dial({ active }: { active: number }) {
  const reduce = useReducedMotion();
  const a = FINALE_ARC[active];
  // The hand is a spring on "hours since 11:00"; its tip is computed with plain trigonometry.
  const hours = useSpring(toHours(a.from), reduce ? { stiffness: 1000, damping: 100 } : { stiffness: 55, damping: 15 });
  useEffect(() => {
    hours.set(toHours(a.from));
  }, [a.from, hours]);
  const x1 = useTransform(hours, (h) => polar(112, h)[0]);
  const y1 = useTransform(hours, (h) => polar(112, h)[1]);
  const x2 = useTransform(hours, (h) => polar(176, h)[0]);
  const y2 = useTransform(hours, (h) => polar(176, h)[1]);

  const nightFrom = toHours('19:00');
  const nightTo = toHours('06:00');
  const [nx, ny] = polar(120, (nightFrom + ((nightTo - nightFrom + 24) % 24) / 2) % 24);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      <svg viewBox="-52 -52 504 504" className="h-full w-full" aria-hidden>
        {/* Night, as a quiet inner band */}
        <path d={arc(132, nightFrom, nightTo)} stroke="var(--color-oxblood-2)" strokeWidth="14" fill="none" />
        <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" className="fill-muted font-mono" style={{ fontSize: 10, letterSpacing: '0.2em' }}>
          NIGHT
        </text>
        {Array.from({ length: 96 }, (_, i) => {
          const h = i / 4;
          const major = i % 4 === 0;
          const [x1, y1] = polar(major ? 156 : 162, h);
          const [x2, y2] = polar(168, h);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-champagne)" strokeOpacity={major ? 0.5 : 0.18} strokeWidth={major ? 1.2 : 1} />;
        })}
        {FINALE_ARC.map((p, i) => (
          <path
            key={p.title}
            d={arc(184, toHours(p.from), toHours(p.to))}
            fill="none"
            strokeWidth={i === active ? 7 : 2.5}
            stroke={i === active ? 'var(--color-ember)' : 'var(--color-champagne)'}
            strokeOpacity={i === active ? 1 : 0.28}
            style={{ transition: 'stroke-width 500ms, stroke-opacity 500ms, stroke 500ms' }}
          />
        ))}
        {[0, 6, 12, 18].map((h) => {
          const [x, y] = polar(212, h);
          const label = `${String((START_H + h) % 24).padStart(2, '0')}:00`;
          return (
            <text key={h} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted font-mono" style={{ fontSize: 11, letterSpacing: '0.12em' }}>
              {label}
            </text>
          );
        })}
        <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-ember)" strokeWidth="2" />
        <motion.circle cx={x1} cy={y1} r="3" fill="var(--color-ember)" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[27%] text-center">
        <p className="label text-ember tabular">
          {a.from} — {a.to}
        </p>
        <p className="mt-3 font-display text-[clamp(1.25rem,2.2vw,1.875rem)] leading-tight">{a.title}</p>
        <p className="label mt-3 text-muted">{toHours(a.from) < 13 ? 'Sat · Dec 19' : 'Sun · Dec 20'}</p>
      </div>
    </div>
  );
}

export function Finale() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const finale = MILESTONES[2];

  return (
    <section id="finale" aria-labelledby="finale-title" className="section-y relative">
      <div className="shell">
        <div className="grid-12 gap-y-12 items-end">
          <div className="col-span-12 lg:col-span-8">
            <SectionHead
              id="finale-title"
              index="05"
              label="The grand finale"
              title={['Twenty-four hours', <span key="b">in <span className="text-ember">{EVENT.city}.</span></span>]}
            />
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-[52ch] text-lede text-champagne/85">{finale.body}</p>
            </Reveal>
          </div>
          <div className="col-span-8 col-start-3 sm:col-span-6 sm:col-start-4 lg:col-span-3 lg:col-start-10 text-sand">
            <Charminar className="w-full" />
            <p className="label mt-4 text-center text-muted tabular">{EVENT.coordinates}</p>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px border-y border-[var(--rule)] bg-[var(--rule)] lg:grid-cols-4">
          {[
            ['Dates', finale.date],
            ['Format', '24 hours, in person'],
            ['Venue', `${EVENT.venue}, ${EVENT.city}`],
            ['Address', 'Shared with shortlisted teams'],
          ].map(([k, v]) => (
            <div key={k} className="bg-ink py-6 pr-4 lg:px-6 lg:first:pl-0">
              <dt className="label text-muted">{k}</dt>
              <dd className="mt-2 text-[1.0625rem] leading-snug">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Dial + arc */}
        <div className="mt-20 grid-12 gap-y-12 lg:mt-28">
          <div className="col-span-12 lg:col-span-6">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+4vh)]">
              <Dial active={active} />
              <p className="label mt-6 text-center text-muted">Planned run-of-show · Dec 19, 11:00 → Dec 20, 11:00</p>
            </div>
          </div>
          <ol className="col-span-12 lg:col-span-5 lg:col-start-8" aria-label="Planned finale schedule">
            {FINALE_ARC.map((p, i) => (
              <li
                key={p.title}
                ref={(el) => {
                  items.current[i] = el;
                }}
                data-index={i}
                className={`border-t border-[var(--rule)] py-8 transition-opacity duration-500 lg:py-14 ${i === active ? 'opacity-100' : 'lg:opacity-40'}`}
              >
                <p className="label text-ember tabular">
                  {p.from} — {p.to}
                </p>
                <h3 className="mt-3 font-display text-h3">{p.title}</h3>
                <p className="mt-3 max-w-[44ch] text-muted">{p.detail}</p>
              </li>
            ))}
            <li className="border-t border-[var(--rule)] pt-6">
              <p className="text-[0.875rem] text-muted">
                This is the organisers’ planned arc and may be refined. The detailed run-of-show is shared separately with shortlisted teams. Mentor hours extend up to 11:00 on the final day.
              </p>
            </li>
          </ol>
        </div>

        {/* Provided / bring / stay */}
        <div className="mt-24 grid-12 gap-y-14 lg:mt-36">
          <Reveal className="col-span-12 lg:col-span-6">
            <p className="label text-muted">On the ground</p>
            <ul className="mt-6">
              {FACILITIES.map((f, i) => (
                <li key={f} className="flex items-baseline gap-5 border-b border-[var(--rule)] py-4 first:border-t">
                  <span className="label text-ember tabular">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[1.0625rem]">{f}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8">
            <p className="label text-muted">Bring with you</p>
            <ul className="mt-6">
              {BRING.map((b) => (
                <li key={b} className="flex items-baseline gap-4 border-b border-[var(--rule)] py-4 first:border-t">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 translate-y-[-0.15em] bg-sand" />
                  <span className="text-[1.0625rem]">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 border-l-2 border-crimson pl-6">
              <p className="label text-ember">Accommodation</p>
              <p className="mt-3 text-muted">{ACCOMMODATION}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
