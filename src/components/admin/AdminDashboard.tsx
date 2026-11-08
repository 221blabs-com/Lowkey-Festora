'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FestoraLockup } from '@/components/ui/FestoraLogo';
import { formatINR } from '@/lib/format';

type Member = { name: string; email: string; phone: string; ticketId: string; checkedInAt: string | null };
type Reg = {
  id: string;
  status: 'created' | 'paid' | 'failed';
  teamName: string;
  college: string;
  city: string;
  track: string;
  members: Member[];
  teamSize: number;
  amount: { tickets: number; fees: number; total: number };
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentMethod: string | null;
  failureReason: string | null;
  emailsSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  paidAt: string | null;
};
type Stats = { teams: number; participants: number; checkedIn: number; revenue: number; ticketRevenue: number; platformFees: number; pending: number; failed: number; emailIssues: number };

const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : '—');
const STATUS: Record<Reg['status'], string> = { paid: 'text-champagne bg-[#2f4a2a]', created: 'text-champagne bg-[#4a3d1c]', failed: 'text-champagne bg-crimson' };
const STATUS_LABEL: Record<Reg['status'], string> = { paid: 'Paid', created: 'Pending', failed: 'Failed' };

export function AdminDashboard({ username }: { username: string }) {
  const router = useRouter();
  const [data, setData] = useState<{ stats: Stats; registrations: Reg[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Reg['status']>('paid');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/registrations', { cache: 'no-store' });
    setLoading(false);
    if (res.status === 401) return router.refresh();
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setError(d.error || 'Could not load registrations.');
    setError(null);
    setData(d);
  }, [router]);

  useEffect(() => {
    // Initial fetch + light polling so new payments appear without a reload.
    const first = setTimeout(load, 0);
    const id = setInterval(load, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.registrations ?? []).filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (!q) return true;
      return [r.id, r.teamName, r.college, r.city, r.track, r.razorpayPaymentId ?? '', ...r.members.flatMap((m) => [m.name, m.email, m.phone, m.ticketId])].some((v) => v.toLowerCase().includes(q));
    });
  }, [data, filter, query]);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  }

  async function checkIn(ticket: string, checkedIn = true) {
    const { ok, data: d } = await post('/api/admin/checkin', { code: ticket, checkedIn });
    if (!ok) return flash(d.error || 'Check-in failed');
    flash(d.already ? `${d.member.name} was already checked in` : checkedIn ? `Checked in ${d.member.name} · ${d.team}` : `Undid check-in for ${d.member.name}`);
    load();
  }

  async function resend(id: string) {
    const { ok, data: d } = await post('/api/admin/resend', { id });
    flash(ok ? 'Tickets re-sent' : d.error || 'Resend failed');
    load();
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  const s = data?.stats;
  const tiles: [string, string][] = s
    ? [
        ['Paid teams', String(s.teams)],
        ['Participants', String(s.participants)],
        ['Collected', formatINR(s.revenue)],
        ['Ticket revenue', formatINR(s.ticketRevenue)],
        ['Platform fees', formatINR(s.platformFees)],
        ['Checked in', `${s.checkedIn} / ${s.participants}`],
        ['Pending', String(s.pending)],
        ['Failed', String(s.failed)],
      ]
    : [];

  return (
    <div className="min-h-[100svh] pb-20">
      <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-ink/90 backdrop-blur">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FestoraLockup markHeight={26} />
            <span className="label hidden text-muted sm:inline">Admin · LOWKEY TECH 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="label hidden text-muted md:inline">{username}</span>
            <button onClick={load} className="label text-muted hover:text-champagne">
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button onClick={logout} className="label text-ember">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="shell pt-10">
        {error ? <p className="mb-6 border-l-2 border-ember pl-4 text-ember">{error}</p> : null}
        {s?.emailIssues ? <p className="mb-6 border-l-2 border-ember pl-4 text-ember">{s.emailIssues} paid registration(s) had email problems — open them and use “Resend tickets”.</p> : null}

        <div className="grid grid-cols-2 gap-px bg-[var(--rule)] md:grid-cols-4">
          {(tiles.length ? tiles : Array.from({ length: 8 }, () => ['…', '…'] as [string, string])).map(([k, v], i) => (
            <div key={i} className="bg-ink p-5">
              <p className="label text-muted">{k}</p>
              <p className="mt-2 font-display text-3xl tabular">{v}</p>
            </div>
          ))}
        </div>

        {/* Check-in desk */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) checkIn(code.trim()).then(() => setCode(''));
          }}
          className="mt-10 flex flex-wrap items-end gap-4 bg-oxblood p-5"
        >
          <label className="min-w-[16rem] flex-1">
            <span className="label text-ember">Check-in desk</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ticket ID (LT26-…) or scanned ticket link" className="mt-2 w-full border-b border-[var(--rule-strong)] bg-transparent py-2 font-mono outline-none focus:border-champagne" />
          </label>
          <button className="btn-ticket btn-ticket--sm notch-x">Check in</button>
        </form>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1">
            {(['paid', 'created', 'failed', 'all'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`label px-3 py-2 ${filter === f ? 'bg-champagne text-ink' : 'text-muted hover:text-champagne'}`}>
                {f === 'created' ? 'Pending' : f === 'all' ? 'All' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team, name, email, ticket…" className="w-64 border-b border-[var(--rule-strong)] bg-transparent py-2 text-[0.9375rem] outline-none focus:border-champagne" />
            <a href="/api/admin/export?status=paid" className="label link-line pb-1">
              Export paid CSV
            </a>
            <a href="/api/admin/export?status=all" className="label link-line pb-1 text-muted">
              Export all
            </a>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto border-t border-[var(--rule-strong)]">
          <table className="w-full min-w-[56rem] text-left text-[0.9375rem]">
            <thead>
              <tr className="label text-muted">
                {['Team', 'College · City', 'Mission', 'Size', 'Amount', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="py-3 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <FragmentRow key={r.id} r={r} open={open === r.id} toggle={() => setOpen(open === r.id ? null : r.id)} onCheckIn={checkIn} onResend={resend} />
              ))}
              {data && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    No registrations match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="label mt-4 text-muted">
          Showing {rows.length} of {data?.registrations.length ?? 0} registrations
        </p>
      </div>

      {toast ? (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-champagne px-5 py-3 font-mono text-[0.8125rem] text-ink">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function FragmentRow({ r, open, toggle, onCheckIn, onResend }: { r: Reg; open: boolean; toggle: () => void; onCheckIn: (t: string, v?: boolean) => void; onResend: (id: string) => void }) {
  return (
    <>
      <tr className="cursor-pointer border-b border-[var(--rule)] hover:bg-oxblood/60" onClick={toggle}>
        <td className="py-4 pr-4">
          <span className="font-display text-lg">{r.teamName}</span>
          <span className="block font-mono text-[0.75rem] text-muted">{r.id}</span>
        </td>
        <td className="py-4 pr-4 text-muted">
          {r.college} · {r.city}
        </td>
        <td className="py-4 pr-4 text-muted">{r.track}</td>
        <td className="py-4 pr-4 tabular">{r.teamSize}</td>
        <td className="py-4 pr-4 tabular">{formatINR(r.amount.total)}</td>
        <td className="py-4 pr-4">
          <span className={`label px-2 py-1 ${STATUS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
          {r.emailError ? <span className="label ml-2 text-ember">Email!</span> : null}
        </td>
        <td className="py-4 pr-4 text-muted">{fmtDate(r.createdAt)}</td>
        <td className="py-4 text-right label text-muted">
          <button aria-expanded={open} onClick={(e) => (e.stopPropagation(), toggle())}>
            {open ? 'Close' : 'Open'}
          </button>
        </td>
      </tr>
      {open ? (
        <tr className="border-b border-[var(--rule)] bg-oxblood/40">
          <td colSpan={8} className="p-5">
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <table className="w-full text-[0.875rem]">
                <tbody>
                  {r.members.map((m, i) => (
                    <tr key={m.ticketId} className="border-b border-[var(--rule)]">
                      <td className="py-2 pr-3">
                        {m.name} {i === 0 ? <span className="label text-ember">Leader</span> : null}
                      </td>
                      <td className="py-2 pr-3 text-muted">{m.email}</td>
                      <td className="py-2 pr-3 text-muted">{m.phone}</td>
                      <td className="py-2 pr-3 font-mono">{m.ticketId}</td>
                      <td className="py-2 text-right">
                        {r.status === 'paid' ? (
                          m.checkedInAt ? (
                            <button className="label text-muted hover:text-ember" onClick={() => onCheckIn(m.ticketId, false)} title={fmtDate(m.checkedInAt)}>
                              ✓ In · undo
                            </button>
                          ) : (
                            <button className="label text-champagne hover:text-ember" onClick={() => onCheckIn(m.ticketId)}>
                              Check in
                            </button>
                          )
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="space-y-2 text-[0.8125rem]">
                {[
                  ['Tickets', formatINR(r.amount.tickets)],
                  ['Platform fee', formatINR(r.amount.fees)],
                  ['Total', formatINR(r.amount.total)],
                  ['Order', r.razorpayOrderId ?? '—'],
                  ['Payment', r.razorpayPaymentId ?? '—'],
                  ['Method', r.paymentMethod ?? '—'],
                  ['Paid at', fmtDate(r.paidAt)],
                  ['Emails', r.emailsSentAt ? fmtDate(r.emailsSentAt) : r.emailError ? `Error: ${r.emailError}` : '—'],
                  ...(r.failureReason ? [['Failure', r.failureReason]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted">{k}</dt>
                    <dd className="break-all text-right font-mono">{v}</dd>
                  </div>
                ))}
                {r.status === 'paid' ? (
                  <button onClick={() => onResend(r.id)} className="btn-ticket btn-ticket--sm notch-x mt-4">
                    Resend tickets
                  </button>
                ) : null}
              </dl>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
