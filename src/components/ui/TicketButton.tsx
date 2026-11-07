import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from './Icons';

type Props = {
  href: string;
  children: ReactNode;
  size?: 'md' | 'sm';
  className?: string;
  /** External links (Festora) open in the same tab — registration is the next step, not a detour. */
  external?: boolean;
  ariaLabel?: string;
};

export function TicketButton({ href, children, size = 'md', className = '', external, ariaLabel }: Props) {
  const isExternal = external ?? /^https?:/.test(href);
  const cls = `btn-ticket notch-x ${size === 'sm' ? 'btn-ticket--sm' : ''} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      {isExternal ? <ArrowUpRight className="btn-arrow shrink-0" size={size === 'sm' ? 12 : 14} /> : <ArrowRight className="btn-arrow shrink-0" size={size === 'sm' ? 12 : 14} />}
    </>
  );
  return isExternal ? (
    <a href={href} className={cls} aria-label={ariaLabel} rel="noopener">
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {inner}
    </Link>
  );
}
