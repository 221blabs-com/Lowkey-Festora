'use client';

import { useEffect, useState } from 'react';

export function GuideToc({ items }: { items: ReadonlyArray<{ id: string; title: string }> }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Guide contents" className="no-print">
      <p className="label text-muted">Contents</p>
      <ol className="mt-5 space-y-0.5">
        {items.map((i, n) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? 'location' : undefined}
              className={`flex items-baseline gap-3 py-1.5 transition-colors ${active === i.id ? 'text-champagne' : 'text-muted hover:text-champagne'}`}
            >
              <span className={`label tabular ${active === i.id ? 'text-ember' : ''}`}>{String(n + 1).padStart(2, '0')}</span>
              <span className="text-[0.9375rem]">{i.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
