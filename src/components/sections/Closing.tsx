import { CONTACT, DOWNLOADS, EVENT, FEES } from '@/content/event';
import { REGISTER_URL } from '@/lib/config';
import { formatINR } from '@/lib/format';
import { TicketButton } from '@/components/ui/TicketButton';
import { MaskedLines, Reveal } from '@/components/ui/Reveal';
import { ArrowUpRight } from '@/components/ui/Icons';
import { FestoraMark } from '@/components/ui/FestoraLogo';

export function Closing() {
  return (
    <section id="contact" aria-labelledby="closing-title" className="relative overflow-hidden border-t border-[var(--rule)]">
      <div className="shell grid-12 gap-y-16 py-[var(--section-y)]">
        <div className="col-span-12 lg:col-span-8">
          <Reveal>
            <p className="label text-muted">
              <span className="text-ember">§ 09</span> — See you at the start line
            </p>
          </Reveal>
          <h2 id="closing-title" className="mt-8 font-display text-display">
            <MaskedLines lines={['Build', <span key="w" className="text-ember">what’s next.</span>]} />
          </h2>
          <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <TicketButton href={REGISTER_URL}>Register your team on Festora</TicketButton>
            <p className="label text-muted">
              {formatINR(FEES.online.amount)} + {formatINR(FEES.online.platformFee)} fee / participant · Online round Dec 5–6
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="col-span-12 lg:col-span-4 lg:self-end">
          <p className="label text-muted">Talk to the organisers</p>
          <ul className="mt-5 border-t border-[var(--rule-strong)]">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center justify-between gap-4 border-b border-[var(--rule)] py-4 hover:text-ember transition-colors">
                <span className="min-w-0">
                  <span className="label block text-muted">Email</span>
                  <span className="mt-1 block break-all">{CONTACT.email}</span>
                </span>
                <ArrowUpRight className="shrink-0" />
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${CONTACT.phoneE164.replace('+', '')}`} className="flex items-center justify-between gap-4 border-b border-[var(--rule)] py-4 hover:text-ember transition-colors" rel="noopener">
                <span>
                  <span className="label block text-muted">WhatsApp</span>
                  <span className="mt-1 block tabular">{CONTACT.phoneDisplay}</span>
                </span>
                <ArrowUpRight className="shrink-0" />
              </a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phoneE164}`} className="flex items-center justify-between gap-4 border-b border-[var(--rule)] py-4 hover:text-ember transition-colors">
                <span>
                  <span className="label block text-muted">Phone</span>
                  <span className="mt-1 block tabular">{CONTACT.phoneDisplay}</span>
                </span>
                <ArrowUpRight className="shrink-0" />
              </a>
            </li>
          </ul>
          <p className="label mt-8 text-muted">Official guides</p>
          <ul className="mt-3 space-y-2">
            {DOWNLOADS.map((d) => (
              <li key={d.href}>
                <a href={d.href} download className="link-line">
                  {d.label}
                </a>{' '}
                <span className="label text-muted">PDF · {d.pages} pp</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.875rem] text-muted">{CONTACT.note}</p>
        </Reveal>
      </div>

      {/* Sign-off: the Festora mark, very large and quiet */}
      <div aria-hidden className="pointer-events-none absolute -bottom-[18%] -right-[6%] opacity-[0.07] hidden lg:block">
        <FestoraMark height={640} />
      </div>
      <span className="sr-only">{EVENT.fullName}</span>
    </section>
  );
}
