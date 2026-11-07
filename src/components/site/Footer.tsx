import Image from 'next/image';
import Link from 'next/link';
import { CONTACT, DOWNLOADS, EVENT } from '@/content/event';
import { REGISTER_URL, SUPPORT_EMAIL_PUBLIC } from '@/lib/config';
import { NAV } from '@/content/nav';
import { ArrowUpRight } from '@/components/ui/Icons';

export function Footer() {
  return (
    <footer className="relative bg-oxblood border-t border-[var(--rule)]" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="shell grid-12 gap-y-14 py-[clamp(4rem,8vw,7rem)]">
        {/* The supplied lockup, shown exactly as delivered — its own oxblood plate sits on ours. */}
        <div className="col-span-12 md:col-span-5 lg:col-span-3">
          <Link href="/" className="block w-[min(100%,17rem)] group" aria-label="Festora — home">
            <Image
              src="/brand/festora-lockup.webp"
              alt="Festora"
              width={1337}
              height={1337}
              className="h-auto w-full border border-[var(--rule)]"
              sizes="(min-width: 768px) 20rem, 80vw"
            />
          </Link>
          <p className="mt-6 max-w-xs text-muted text-[0.9375rem] leading-relaxed">
            Registration, payments and QR tickets for {EVENT.fullName} run on Festora — campus event ticketing by 221B Labs Private Limited.
          </p>
        </div>

        <nav aria-label="Footer" className="col-span-6 md:col-span-3 lg:col-span-2 lg:col-start-5">
          <p className="label text-muted">Explore</p>
          <ul className="mt-5 space-y-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ember transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-6 md:col-span-4 lg:col-span-3">
          <p className="label text-muted">Downloads</p>
          <ul className="mt-5 space-y-3">
            {DOWNLOADS.map((d) => (
              <li key={d.href}>
                <a href={d.href} className="group inline-flex items-start gap-2 hover:text-ember transition-colors" download>
                  <span>{d.label}</span>
                  <span className="label text-muted mt-1">PDF</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="label text-muted mt-10">Organisers</p>
          <ul className="mt-5 space-y-3">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="link-line [overflow-wrap:anywhere]">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phoneE164}`} className="link-line tabular">
                {CONTACT.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-12 lg:col-span-3 lg:col-start-10">
          <p className="label text-muted">Tickets</p>
          <a href={REGISTER_URL} className="mt-5 flex items-center justify-between gap-4 border-y border-[var(--rule-strong)] py-4 hover:text-ember transition-colors">
            <span className="font-display text-2xl">Register on Festora</span>
            <ArrowUpRight size={18} />
          </a>
          <a href={`mailto:${SUPPORT_EMAIL_PUBLIC}`} className="flex items-center justify-between gap-4 border-b border-[var(--rule-strong)] py-4 hover:text-ember transition-colors">
            <span>
              <span className="label block text-muted">Payments & tickets support</span>
              <span className="mt-1 block [overflow-wrap:anywhere]">{SUPPORT_EMAIL_PUBLIC}</span>
            </span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      <div className="border-t border-[var(--rule)]">
        <div className="shell flex flex-col gap-3 py-6 md:flex-row md:items-center md:justify-between">
          <p className="label text-muted">
            © 2026 Festora · 221B Labs Private Limited
          </p>
          <p className="label text-muted max-w-2xl md:text-right">
            Event details follow the official {EVENT.fullName} guides. The latest organiser announcement applies.
          </p>
        </div>
      </div>
    </footer>
  );
}
