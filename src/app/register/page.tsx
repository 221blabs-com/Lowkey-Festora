import type { Metadata } from 'next';
import { RegisterForm } from '@/components/register/RegisterForm';
import { EVENT } from '@/content/event';
import { PER_TICKET_TOTAL, PLATFORM_FEE, TICKET_PRICE } from '@/lib/pricing';
import { formatINR } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Register your team',
  description: `Register your team for ${EVENT.fullName}. ${formatINR(TICKET_PRICE)} per participant + ${formatINR(PLATFORM_FEE)} Festora platform fee.`,
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  return (
    <section className="shell pt-[calc(var(--header-h)+clamp(3rem,7vw,6rem))] pb-[var(--section-y)]">
      <p className="label text-muted">
        <span className="text-ember">{EVENT.fullName}</span> · Registration on Festora
      </p>
      <h1 className="mt-6 max-w-[14ch] font-display text-display">Register your team.</h1>
      <p className="mt-6 max-w-[52ch] text-lede text-champagne/85">
        {formatINR(TICKET_PRICE)} per participant + {formatINR(PLATFORM_FEE)} platform fee — {formatINR(PER_TICKET_TOTAL)} a ticket. Every member gets their own QR ticket by email.
      </p>
      <div className="mt-16 lg:mt-20">
        <RegisterForm />
      </div>
    </section>
  );
}
