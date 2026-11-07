import { AUDIENCE, EVENT, PRINCIPLES } from '@/content/event';
import { Reveal } from '@/components/ui/Reveal';
import { ScrollLitText } from '@/components/ui/ScrollLitText';

export function Brief() {
  return (
    <section id="brief" aria-labelledby="brief-title" className="section-y relative">
      <div className="shell">
        <Reveal>
          <p className="label flex items-center gap-3 text-muted">
            <span className="text-ember">§ 01</span>
            <span aria-hidden className="h-px w-10 bg-current opacity-40" />
            <span id="brief-title">The brief</span>
          </p>
        </Reveal>

        <ScrollLitText
          className="mt-10 max-w-[22ch] font-display text-[clamp(2.125rem,5.4vw,5.5rem)] leading-[1.02] tracking-[-0.02em]"
          text="A pan-India hackathon for people who would rather ship a product than describe one."
          highlight={['ship', 'product']}
        />

        <div className="mt-20 grid-12 gap-y-12 lg:mt-28">
          <Reveal className="col-span-12 md:col-span-6 lg:col-span-5">
            <p className="text-lede text-champagne/90 max-w-[34ch]">{EVENT.summary}</p>
          </Reveal>
          <Reveal delay={0.1} className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8">
            <div className="border-l-2 border-crimson pl-6">
              <p className="label text-ember">The challenge</p>
              <p className="mt-4 text-[1.125rem] leading-relaxed text-champagne/90">{EVENT.challenge}</p>
            </div>
          </Reveal>
        </div>

        {/* Principles — an index, not a card grid */}
        <div className="mt-24 lg:mt-32">
          <Reveal>
            <p className="label text-muted">What makes it different</p>
          </Reveal>
          <ol className="mt-8 grid grid-cols-1 gap-px border-y border-[var(--rule)] bg-[var(--rule)] md:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="group relative bg-ink">
              <Reveal delay={(i % 3) * 0.08} className="py-9 md:p-9 lg:p-10">
                <span className="label text-muted tabular">0{i + 1}</span>
                <h3 className="mt-5 font-display text-[1.75rem] leading-tight transition-colors duration-500 group-hover:text-ember">{p.title}</h3>
                <p className="mt-3 max-w-[36ch] text-muted">{p.body}</p>
              </Reveal>
              </li>
            ))}
          </ol>
        </div>

        {/* Audience */}
        <div className="mt-24 grid-12 gap-y-8 lg:mt-32 items-start">
          <Reveal className="col-span-12 lg:col-span-4">
            <p className="label text-muted">Who should join</p>
            <p className="mt-5 font-display text-h3 max-w-[16ch]">Builders, designers & founders-in-waiting.</p>
          </Reveal>
          <ul className="col-span-12 lg:col-span-7 lg:col-start-6">
            {AUDIENCE.map((a, i) => (
              <Reveal as="li" key={a} delay={i * 0.05} className="flex items-baseline gap-6 border-b border-[var(--rule)] py-5 first:border-t">
                <span className="label text-ember tabular">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[clamp(1.125rem,1.8vw,1.5rem)] leading-snug">{a}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
