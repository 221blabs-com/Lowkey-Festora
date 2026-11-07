import type { Metadata } from 'next';
import QRCode from 'qrcode';
import { getByTicketId } from '@/lib/server/registrations';
import { ticketUrl, verifyTicketToken } from '@/lib/server/tickets';
import { EVENT, MILESTONES } from '@/content/event';
import { FestoraLockup } from '@/components/ui/FestoraLogo';

export const metadata: Metadata = { title: 'Your ticket', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function TicketPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params;
  const { t } = await searchParams;
  const ticketId = id.toUpperCase();

  let valid = false;
  try {
    valid = /^LT26-[A-Z0-9]{6}$/.test(ticketId) && verifyTicketToken(ticketId, t ?? '');
  } catch {
    valid = false;
  }
  const reg = valid ? await getByTicketId(ticketId).catch(() => null) : null;
  const member = reg?.members.find((m) => m.ticketId === ticketId);

  if (!reg || !member) {
    return (
      <section className="shell min-h-[80svh] pt-[calc(var(--header-h)+6rem)]">
        <p className="label text-ember">Ticket</p>
        <h1 className="mt-6 font-display text-display max-w-[14ch]">This ticket link isn’t valid.</h1>
        <p className="mt-6 text-muted max-w-[48ch]">Open the link from your Festora ticket email, or contact support.</p>
      </section>
    );
  }

  const svg = await QRCode.toString(ticketUrl(ticketId), { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1d070c', light: '#e8d0a8' } });
  const status = reg.status !== 'paid' ? 'Not valid' : member.checkedInAt ? 'Checked in' : 'Valid';

  return (
    <section className="shell min-h-[90svh] pt-[calc(var(--header-h)+clamp(2rem,6vw,5rem))] pb-24">
      <article className="mx-auto max-w-3xl bg-oxblood notch-y [--at:100%] md:[--at:68%] grid md:grid-cols-[1fr_15rem]">
        <div className="p-8 md:p-10">
          <FestoraLockup markHeight={26} />
          <p className="label mt-10 text-ember">Admit one · {EVENT.kind}</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4rem)] leading-none">{EVENT.fullName}</h1>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[var(--rule-strong)] pt-6">
            <div>
              <dt className="label text-muted">Name</dt>
              <dd className="mt-1.5 text-lg">{member.name}</dd>
            </div>
            <div>
              <dt className="label text-muted">Team</dt>
              <dd className="mt-1.5 text-lg">{reg.teamName}</dd>
            </div>
            <div>
              <dt className="label text-muted">Ticket</dt>
              <dd className="mt-1.5 whitespace-nowrap font-mono tracking-[0.08em]">{member.ticketId}</dd>
            </div>
            <div>
              <dt className="label text-muted">Online round</dt>
              <dd className="mt-1.5">{MILESTONES[0].date}</dd>
            </div>
          </dl>
        </div>
        <div className="relative flex flex-col items-center justify-center gap-4 p-8">
          <span aria-hidden className="perf-y absolute inset-y-6 left-0 hidden md:block text-sand/60" />
          <span aria-hidden className="perf-x absolute inset-x-6 top-0 md:hidden text-sand/60" />
          <div className="w-full max-w-[12rem] [&_svg]:h-auto [&_svg]:w-full" role="img" aria-label={`QR code for ticket ${member.ticketId}`} dangerouslySetInnerHTML={{ __html: svg }} />
          <p className={`label ${status === 'Valid' ? 'text-champagne' : 'text-ember'}`}>{status}</p>
        </div>
      </article>
      <p className="label mt-8 text-center text-muted">Show this QR at the venue · Keep it private</p>
    </section>
  );
}
