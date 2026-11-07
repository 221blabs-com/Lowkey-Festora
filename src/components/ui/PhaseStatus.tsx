'use client';

import { useSyncExternalStore } from 'react';
import { describePhase, getPhase } from '@/lib/phase';

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
};
// Snap to the minute so the snapshot is stable between renders.
const getSnapshot = () => Math.floor(Date.now() / 60_000) * 60_000;
const getServerSnapshot = () => null;

/** Live status of the event (days to the next milestone, or live / concluded). */
export function PhaseStatus({ className = '', tone = 'dark', align = 'start' }: { className?: string; tone?: 'dark' | 'paper'; align?: 'start' | 'end' }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const d = now === null ? null : describePhase(getPhase(now));
  return (
    <div className={className} aria-live="polite">
      <div className={`flex items-baseline gap-2 ${align === 'end' ? 'lg:justify-end' : ''}`}>
        <span className="font-display text-[clamp(2.75rem,4.6vw,4.5rem)] leading-[0.8] tabular">{d ? d.value : '––'}</span>
        {d?.unit ? <span className="label">{d.unit}</span> : null}
      </div>
      <p className={`label mt-3 ${tone === 'paper' ? 'text-paper-muted' : 'text-muted'}`}>{d ? d.lead : 'Online round · December 5, 2026'}</p>
    </div>
  );
}
