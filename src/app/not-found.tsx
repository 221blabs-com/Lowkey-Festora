import Link from 'next/link';
import { TicketButton } from '@/components/ui/TicketButton';

export default function NotFound() {
  return (
    <section className="shell flex min-h-[90svh] flex-col justify-center pt-[var(--header-h)]">
      <p className="label text-ember">Error 404 · Ticket not recognised</p>
      <h1 className="mt-6 font-display text-display max-w-[12ch]">This seat doesn’t exist.</h1>
      <p className="mt-6 max-w-[44ch] text-muted text-lede">The page may have moved. Everything about LOWKEY TECH 2026 starts from the main hall.</p>
      <div className="mt-10 flex flex-wrap gap-6 items-center">
        <TicketButton href="/">Back to LOWKEY TECH 2026</TicketButton>
        <Link href="/guide" className="label link-line text-muted pb-1">Participant guide</Link>
      </div>
    </section>
  );
}
