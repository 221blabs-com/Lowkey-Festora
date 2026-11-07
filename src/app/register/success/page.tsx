import type { Metadata } from 'next';
import Link from 'next/link';
import { getRegistration } from '@/lib/server/registrations';
import { ticketUrl } from '@/lib/server/tickets';
import { formatINR } from '@/lib/format';
import { EVENT, MILESTONES } from '@/content/event';
import { TicketButton } from '@/components/ui/TicketButton';

export const metadata: Metadata = { title: 'Registration confirmed', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const reg = id ? await getRegistration(id).catch(() => null) : null;

  if (!reg) {
    return (
      <Shell eyebrow="Registration" title="We couldn’t find that registration.">
        <p className="text-muted">If you paid, your tickets are on their way by email. Otherwise, start again.</p>
        <div className="mt-8">
          <TicketButton href="/register">Register your team</TicketButton>
        </div>
      </Shell>
    );
  }

  if (reg.status !== 'paid') {
    return (
      <Shell eyebrow="Confirming payment" title="Hang tight — confirming with the bank.">
        <meta httpEquiv="refresh" content="5" />
        <p className="text-muted max-w-[52ch]">
          This usually takes a few seconds. This page refreshes automatically. Your registration ID is <span className="font-mono text-champagne">{reg.id}</span>.
        </p>
      </Shell>
    );
  }

  return (
    <Shell eyebrow="Payment successful" title={`${reg.teamName} is in.`}>
      <p className="text-lede text-champagne/85 max-w-[54ch]">
        Tickets for all {reg.teamSize} members have been emailed. The receipt went to {reg.leaderEmail}.
      </p>

      <div className="mt-14 grid-12 gap-y-12">
        <div className="col-span-12 lg:col-span-7">
          <p className="label text-muted">Tickets</p>
          <ul className="mt-5 border-t border-[var(--rule-strong)]">
            {reg.members.map((m, i) => (
              <li key={m.ticketId} className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--rule)] py-5">
                <div>
                  <p className="font-display text-2xl">{m.name}</p>
                  <p className="label mt-1 text-muted">
                    {i === 0 ? 'Leader' : 'Member'} · {m.ticketId}
                  </p>
                </div>
                <a href={ticketUrl(m.ticketId)} className="label link-line pb-1">
                  View ticket
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:col-start-9">
          <div className="bg-oxblood p-7">
            <p className="label text-ember">Receipt</p>
            <dl className="mt-5 space-y-3 text-[0.9375rem]">
              <Row k={`Tickets · ${reg.teamSize}`} v={formatINR(reg.amount.tickets)} />
              <Row k="Platform fee" v={formatINR(reg.amount.fees)} />
              <Row k="Total paid" v={formatINR(reg.amount.total)} strong />
              <Row k="Payment ID" v={reg.razorpayPaymentId ?? '—'} mono />
              <Row k="Registration" v={reg.id} mono />
            </dl>
          </div>
          <p className="label mt-8 text-muted">Next</p>
          <p className="mt-3 text-muted">
            The online round runs {MILESTONES[0].date}. The organisers share the official Google Form with registered teams. Read the{' '}
            <Link href="/guide#submission" className="link-line text-champagne">
              submission checklist
            </Link>
            .
          </p>
        </div>
      </div>
    </Shell>
  );
}

function Row({ k, v, strong, mono }: { k: string; v: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? 'border-t border-[var(--rule-strong)] pt-3' : ''}`}>
      <dt className="text-muted">{k}</dt>
      <dd className={`${strong ? 'font-display text-2xl' : ''} ${mono ? 'font-mono text-[0.8125rem]' : ''} text-right break-all`}>{v}</dd>
    </div>
  );
}

function Shell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="shell min-h-[80svh] pt-[calc(var(--header-h)+clamp(3rem,7vw,6rem))] pb-[var(--section-y)]">
      <p className="label text-ember">
        {eyebrow} · {EVENT.fullName}
      </p>
      <h1 className="mt-6 max-w-[16ch] font-display text-display">{title}</h1>
      <div className="mt-8">{children}</div>
    </section>
  );
}
