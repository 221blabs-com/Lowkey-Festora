import { RECOGNITION } from '@/content/event';
import { formatINR } from '@/lib/format';
import { SectionHead } from '@/components/ui/SectionHead';
import { Reveal } from '@/components/ui/Reveal';

export function Recognition() {
  const loop = [...RECOGNITION.categories, ...RECOGNITION.categories];
  return (
    <section id="recognition" aria-labelledby="recognition-title" className="section-y relative overflow-hidden bg-oxblood">
      <div aria-hidden className="pointer-events-none absolute inset-0 guilloche opacity-50" />
      <div className="shell relative">
        <SectionHead id="recognition-title" index="06" label="Recognition" title={['What you can', <span key="b" className="text-ember">walk away with.</span>]} />

        <div className="mt-16 grid-12 gap-y-14 lg:mt-24">
          {/* Prize — stated exactly as the organisers state it */}
          <Reveal className="col-span-12 lg:col-span-7">
            <div className="@container relative border border-[var(--rule-strong)] p-[clamp(1.5rem,4vw,3.5rem)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="label bg-champagne px-2.5 py-1 text-ink">Prize pool · {RECOGNITION.prize.status}</span>
                <span className="label text-muted">Planned · subject to sponsorship</span>
              </div>
              <p className="mt-8 label text-muted">Up to</p>
              {/* Sized in container-width units (not viewport vw) so the amount always fits this box, however narrow its column gets. */}
              <p className="font-display text-[clamp(2.5rem,15cqw,8rem)] leading-[0.85] tracking-[-0.035em] tabular">{formatINR(RECOGNITION.prize.upTo)}</p>
              <p className="mt-8 max-w-[54ch] text-muted">{RECOGNITION.prize.note}</p>
            </div>
          </Reveal>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9 space-y-10">
            <Reveal>
              <p className="label text-ember">Certificates</p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed">{RECOGNITION.certificates.online}</p>
              <p className="mt-3 text-muted">{RECOGNITION.certificates.offline}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="label text-ember">Internships</p>
              <p className="mt-3 text-muted">{RECOGNITION.internships}</p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Possible categories */}
      <div className="relative mt-20 border-y border-[var(--rule)] py-6 lg:mt-28" aria-label="Possible recognition categories">
        <ul className="sr-only">
          {RECOGNITION.categories.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div aria-hidden className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="marquee-track flex shrink-0 items-center gap-10 pr-10 whitespace-nowrap">
            {loop.map((c, i) => (
              <span key={i} className="flex items-center gap-10 font-display text-[clamp(1.75rem,3.6vw,3.25rem)]">
                {c}
                <span className="inline-block h-2 w-2 rotate-45 bg-ember" />
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="shell label relative mt-6 text-muted">{RECOGNITION.categoriesNote}</p>
    </section>
  );
}
