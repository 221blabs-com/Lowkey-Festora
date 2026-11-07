'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { FestoraLockup } from '@/components/ui/FestoraLogo';
import { TicketButton } from '@/components/ui/TicketButton';
import { NAV } from '@/content/nav';
import { REGISTER_URL } from '@/lib/config';
import { EVENT, MILESTONES } from '@/content/event';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock scroll + close on Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const trigger = menuButton.current;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [open, lenis]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? 'bg-ink/85 backdrop-blur-md border-b border-[var(--rule)]' : 'border-b border-transparent'
      }`}
    >
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="relative z-10 shrink-0" aria-label="LOWKEY TECH 2026 on Festora — home">
          <FestoraLockup markHeight={30} />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="label text-muted hover:text-champagne transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <TicketButton href={REGISTER_URL} size="sm" className="hidden sm:inline-flex">
            Register team
          </TicketButton>
          <button
            ref={menuButton}
            type="button"
            className="lg:hidden relative z-10 flex h-10 w-10 items-center justify-center"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-6" aria-hidden>
              <span className={`absolute left-0 h-px w-6 bg-champagne transition-transform duration-500 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-px w-6 bg-champagne transition-transform duration-500 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 top-[var(--header-h)] h-[calc(100dvh-var(--header-h))] bg-ink lg:hidden overflow-y-auto"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <div className="shell flex min-h-full flex-col justify-between py-10">
              <ul className="space-y-1">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-[var(--rule)]"
                  >
                    <Link href={item.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-4">
                      <span className="font-display text-[clamp(2.25rem,10vw,3.5rem)] leading-none">{item.label}</span>
                      <span className="label text-muted">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-12 space-y-6">
                <TicketButton href={REGISTER_URL} className="w-full justify-between">
                  Register your team on Festora
                </TicketButton>
                <p className="label text-muted">
                  {EVENT.fullName} · {MILESTONES[0].date} online · {MILESTONES[2].date} {EVENT.city}
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
