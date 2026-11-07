import { FAQ } from '@/content/faq';
import { SectionHead } from '@/components/ui/SectionHead';
import { Reveal } from '@/components/ui/Reveal';
import { Plus } from '@/components/ui/Icons';
import Link from 'next/link';

export function Faq({ compact = false }: { compact?: boolean }) {
  const groups = compact ? FAQ.map((g) => ({ ...g, items: g.items.slice(0, 3) })) : FAQ;
  return (
    <section id="faq" aria-labelledby="faq-title" className="section-y relative">
      <div className="shell">
        <SectionHead
          id="faq-title"
          index="08"
          label="Questions"
          title={['Asked,', <span key="b" className="text-ember">answered.</span>]}
          aside={
            compact ? (
              <>
                The essentials, straight from the official guides. Every rule and policy lives in the{' '}
                <Link href="/guide" className="link-line text-champagne">
                  participant guide
                </Link>
                .
              </>
            ) : undefined
          }
        />
        <div className="mt-16 space-y-16 lg:mt-24">
          {groups.map((g) => (
            <div key={g.id} className="grid-12 gap-y-6">
              <Reveal className="col-span-12 lg:col-span-3">
                <h3 className="label text-ember lg:sticky lg:top-[calc(var(--header-h)+2rem)]">{g.title}</h3>
              </Reveal>
              <div className="col-span-12 border-t border-[var(--rule-strong)] lg:col-span-9">
                {g.items.map((item) => (
                  <details key={item.q} className="group border-b border-[var(--rule)]">
                    <summary className="flex items-start justify-between gap-6 py-6 transition-colors hover:text-ember">
                      <span className="font-display text-[clamp(1.25rem,2vw,1.625rem)] leading-snug">{item.q}</span>
                      <Plus className="faq-icon mt-2 shrink-0" size={14} />
                    </summary>
                    <p className="max-w-[62ch] pb-7 pr-10 text-[1.0625rem] leading-relaxed text-muted">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
