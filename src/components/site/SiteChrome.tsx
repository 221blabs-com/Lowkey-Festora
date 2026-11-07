'use client';

import { usePathname } from 'next/navigation';

/** Hides the marketing header/footer on the admin console. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith('/admin')) return null;
  return <>{children}</>;
}
