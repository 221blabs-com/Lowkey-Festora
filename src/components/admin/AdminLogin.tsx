'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FestoraLockup } from '@/components/ui/FestoraLogo';
import { ArrowRight } from '@/components/ui/Icons';

const input = 'w-full bg-transparent border-b border-[var(--rule-strong)] py-3 text-champagne outline-none focus:border-champagne';

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(configured ? null : 'Admin is not configured: set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || 'Sign-in failed.');
    router.refresh();
  }

  return (
    <section className="flex min-h-[100svh] items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm bg-oxblood p-8 notch-y [--at:100%]">
        <FestoraLockup markHeight={30} />
        <p className="label mt-10 text-ember">Admin · LOWKEY TECH 2026</p>
        <h1 className="mt-3 font-display text-4xl">Sign in</h1>
        <label className="mt-8 block">
          <span className="label text-muted">Username</span>
          <input className={input} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label className="mt-6 block">
          <span className="label text-muted">Password</span>
          <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error ? (
          <p role="alert" className="mt-5 text-[0.875rem] text-ember">
            {error}
          </p>
        ) : null}
        <button disabled={busy} className="btn-ticket notch-x mt-8 w-full justify-between disabled:opacity-60">
          <span>{busy ? 'Signing in…' : 'Sign in'}</span>
          <ArrowRight className="btn-arrow" size={14} />
        </button>
      </form>
    </section>
  );
}
