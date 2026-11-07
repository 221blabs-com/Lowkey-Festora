import type { ReactNode } from 'react';
import { MaskedLines, Reveal } from './Reveal';

/** "§ 03 — Tracks" index rail + display headline. Shared by every section. */
export function SectionHead({
  index,
  label,
  title,
  aside,
  tone = 'dark',
  id,
}: {
  index: string;
  label: string;
  title: ReactNode[];
  aside?: ReactNode;
  tone?: 'dark' | 'paper';
  id?: string;
}) {
  const muted = tone === 'paper' ? 'text-paper-muted' : 'text-muted';
  return (
    <div className="grid-12 gap-y-8 items-end">
      <div className="col-span-12 lg:col-span-8">
        <Reveal>
          <p className={`label flex items-center gap-3 ${muted}`}>
            <span className={tone === 'paper' ? 'text-crimson' : 'text-ember'}>§ {index}</span>
            <span aria-hidden className="h-px w-10 bg-current opacity-40" />
            <span>{label}</span>
          </p>
        </Reveal>
        <h2 id={id} className="font-display text-h2 mt-6 text-balance">
          <MaskedLines lines={title} />
        </h2>
      </div>
      {aside ? (
        <Reveal delay={0.15} className={`col-span-12 lg:col-span-4 ${muted} text-[1.0625rem] leading-relaxed max-w-md`}>
          {aside}
        </Reveal>
      ) : null}
    </div>
  );
}
