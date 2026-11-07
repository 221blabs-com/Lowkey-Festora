'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEAM, TRACKS } from '@/content/event';
import { PLATFORM_FEE, TICKET_PRICE, quote } from '@/lib/pricing';
import { formatINR } from '@/lib/format';
import { ArrowRight, Plus } from '@/components/ui/Icons';

type M = { name: string; email: string; phone: string };
const empty = (): M => ({ name: '', email: '', phone: '' });

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (e: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const input =
  'w-full bg-transparent border-b border-[var(--rule-strong)] py-3 text-[1.0625rem] text-champagne placeholder:text-muted/60 outline-none transition-colors focus:border-champagne';
const fieldLabel = 'label text-muted';

export function RegisterForm() {
  const router = useRouter();
  const [team, setTeam] = useState({ teamName: '', college: '', city: '', track: '' });
  const [members, setMembers] = useState<M[]>([empty(), empty()]);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [busy, setBusy] = useState<null | 'order' | 'pay' | 'verify'>(null);
  const [error, setError] = useState<string | null>(null);
  const q = useMemo(() => quote(members.length), [members.length]);

  const setMember = (i: number, k: keyof M, v: string) => setMembers((ms) => ms.map((m, j) => (j === i ? { ...m, [k]: v } : m)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy('order');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...team, members, consent, website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start registration.');

      if (!(await loadCheckout()) || !window.Razorpay) throw new Error('Could not load the payment window. Check your connection and try again.');

      const regId: string = data.registrationId;
      let lastError = '';
      let settled = false;
      setBusy('pay');

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.order.id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Festora',
        description: data.description,
        image: `${window.location.origin}/brand/festora-mark-256.png`,
        prefill: data.prefill,
        notes: { registrationId: regId },
        theme: { color: '#96182A' },
        handler: async (r: RazorpayResponse) => {
          settled = true;
          setBusy('verify');
          const v = await fetch('/api/register/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId: regId, ...r }),
          });
          // If verification hiccups, the webhook still confirms; the success page waits for it.
          router.push(`/register/success?id=${encodeURIComponent(regId)}${v.ok ? '' : '&pending=1'}`);
        },
        modal: {
          ondismiss: async () => {
            if (settled) return;
            const reason = lastError || 'Checkout was closed before payment';
            await fetch('/api/register/failed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ registrationId: regId, reason }) }).catch(() => {});
            router.push(`/register/failed?id=${encodeURIComponent(regId)}&reason=${encodeURIComponent(reason)}`);
          },
        },
      });
      // Razorpay lets the buyer retry inside the same window; remember why it failed.
      rzp.on('payment.failed', (r) => {
        lastError = r.error?.description || 'Payment failed';
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(null);
    }
  }

  return (
    <form onSubmit={submit} className="grid-12 gap-y-14" noValidate={false}>
      <div className="col-span-12 lg:col-span-7 space-y-14">
        {/* Team */}
        <fieldset className="space-y-8">
          <legend className="label text-ember mb-6">01 · Your team</legend>
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={fieldLabel}>Team name</span>
              <input required minLength={2} maxLength={60} className={input} value={team.teamName} onChange={(e) => setTeam({ ...team, teamName: e.target.value })} autoComplete="off" />
            </label>
            <label className="block">
              <span className={fieldLabel}>College / organisation</span>
              <input required minLength={2} maxLength={120} className={input} value={team.college} onChange={(e) => setTeam({ ...team, college: e.target.value })} autoComplete="organization" />
            </label>
            <label className="block">
              <span className={fieldLabel}>City</span>
              <input required minLength={2} maxLength={60} className={input} value={team.city} onChange={(e) => setTeam({ ...team, city: e.target.value })} autoComplete="address-level2" />
            </label>
            <label className="block sm:col-span-2">
              <span className={fieldLabel}>Track</span>
              <select required className={`${input} appearance-none`} value={team.track} onChange={(e) => setTeam({ ...team, track: e.target.value })}>
                <option value="" disabled className="bg-ink">
                  Choose a track
                </option>
                {TRACKS.map((t) => (
                  <option key={t.id} value={t.name} className="bg-ink">
                    {t.index} · {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        {/* Members */}
        <fieldset>
          <legend className="label text-ember mb-6">
            02 · Members <span className="text-muted">({members.length} of {TEAM.max} · minimum {TEAM.min})</span>
          </legend>
          <ol className="space-y-10">
            {members.map((m, i) => (
              <li key={i} className="border-t border-[var(--rule-strong)] pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-display text-2xl">{i === 0 ? 'Team leader' : `Member ${i + 1}`}</p>
                  {i >= TEAM.min ? (
                    <button type="button" onClick={() => setMembers((ms) => ms.filter((_, j) => j !== i))} className="label text-muted hover:text-ember">
                      Remove
                    </button>
                  ) : null}
                </div>
                {i === 0 ? <p className="mt-1 text-[0.875rem] text-muted">Receives the payment receipt and all team updates.</p> : null}
                <div className="mt-5 grid gap-6 sm:grid-cols-3">
                  <label className="block">
                    <span className={fieldLabel}>Full name</span>
                    <input required minLength={2} maxLength={80} className={input} value={m.name} onChange={(e) => setMember(i, 'name', e.target.value)} autoComplete={i === 0 ? 'name' : 'off'} />
                  </label>
                  <label className="block">
                    <span className={fieldLabel}>Email</span>
                    <input required type="email" maxLength={120} className={input} value={m.email} onChange={(e) => setMember(i, 'email', e.target.value)} autoComplete={i === 0 ? 'email' : 'off'} />
                  </label>
                  <label className="block">
                    <span className={fieldLabel}>Mobile</span>
                    <input required type="tel" inputMode="tel" maxLength={16} className={input} value={m.phone} onChange={(e) => setMember(i, 'phone', e.target.value)} autoComplete={i === 0 ? 'tel' : 'off'} placeholder="98765 43210" />
                  </label>
                </div>
              </li>
            ))}
          </ol>
          {members.length < TEAM.max ? (
            <button type="button" onClick={() => setMembers((ms) => [...ms, empty()])} className="mt-8 inline-flex items-center gap-3 label text-champagne hover:text-ember">
              <Plus size={12} /> Add member
            </button>
          ) : null}
        </fieldset>

        {/* Honeypot */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
        </div>
      </div>

      {/* Summary */}
      <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] bg-oxblood p-7 notch-y [--at:100%]">
          <p className="label text-ember">Order summary</p>
          <dl className="mt-6 space-y-3 text-[0.9875rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                Tickets · {q.teamSize} × {formatINR(TICKET_PRICE)}
              </dt>
              <dd className="tabular">{formatINR(q.tickets)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                Platform fee · {q.teamSize} × {formatINR(PLATFORM_FEE)}
              </dt>
              <dd className="tabular">{formatINR(q.fees)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex items-end justify-between border-t border-[var(--rule-strong)] pt-5">
            <span className="label text-muted">Total</span>
            <span className="font-display text-5xl leading-none tabular">{formatINR(q.total)}</span>
          </div>
          <p className="mt-3 text-[0.8125rem] text-muted">Online round · Dec 5–6, 2026. The ₹699 finale pass is paid later, only by shortlisted participants.</p>

          <label className="mt-7 flex items-start gap-3 text-[0.875rem] leading-relaxed text-champagne/90">
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[#96182A]" />
            <span>
              I agree to the{' '}
              <a href="/guide#rules" target="_blank" className="link-line">
                event rules
              </a>
              , and understand fees are non-refundable and non-transferable.
            </span>
          </label>

          {error ? (
            <p role="alert" className="mt-5 border-l-2 border-ember pl-3 text-[0.9375rem] text-ember">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={!!busy} className="btn-ticket notch-x mt-7 w-full justify-between disabled:cursor-wait disabled:opacity-70">
            <span>{busy === 'order' ? 'Preparing…' : busy === 'pay' ? 'Complete payment…' : busy === 'verify' ? 'Confirming…' : `Pay ${formatINR(q.total)}`}</span>
            <ArrowRight className="btn-arrow" size={14} />
          </button>
          <p className="mt-4 text-center label text-muted">Secured by Razorpay · UPI, cards, netbanking</p>
        </div>
      </aside>
    </form>
  );
}
