import type { Metadata } from 'next';
import { TicketButton } from '@/components/ui/TicketButton';
import { EVENT } from '@/content/event';
import { SUPPORT_EMAIL } from '@/lib/server/mail';

export const metadata: Metadata = { title: 'Payment not completed', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function FailedPage({ searchParams }: { searchParams: Promise<{ id?: string; reason?: string }> }) {
  const { id, reason } = await searchParams;
  return (
    <section className="shell min-h-[80svh] pt-[calc(var(--header-h)+clamp(3rem,7vw,6rem))] pb-[var(--section-y)]">
      <p className="label text-ember">Payment not completed · {EVENT.fullName}</p>
      <h1 className="mt-6 max-w-[14ch] font-display text-display">No tickets issued — yet.</h1>
      <div className="mt-8 max-w-[56ch] space-y-5">
        {reason ? <p className="border-l-2 border-ember pl-4 text-lede text-champagne/90">{reason.slice(0, 200)}</p> : null}
        <p className="text-muted">
          Your team is not registered. If money left your account, your bank normally reverses it automatically within 5–7 working days.
        </p>
        {id ? (
          <p className="text-muted">
            Reference: <span className="font-mono text-champagne">{id.slice(0, 40)}</span>
          </p>
        ) : null}
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <TicketButton href="/register">Try again</TicketButton>
        <a href={`mailto:${SUPPORT_EMAIL()}`} className="label link-line pb-1 text-muted">
          Contact Festora support
        </a>
      </div>
    </section>
  );
}
