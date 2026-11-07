import type { Metadata, Viewport } from 'next';
import './globals.css';
import { fontVariables } from './fonts';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { SmoothScroll } from '@/components/site/SmoothScroll';
import { SiteChrome } from '@/components/site/SiteChrome';
import { EVENT } from '@/content/event';
import { SITE_URL } from '@/lib/config';

const description = `${EVENT.summary} Online round December 5–6, 2026 · Grand finale December 19–20 in Hyderabad. Register your team on Festora.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${EVENT.fullName} — ${EVENT.kind} · Tickets on Festora`,
    template: `%s · ${EVENT.fullName} · Festora`,
  },
  description,
  applicationName: 'Festora',
  keywords: ['LOWKEY TECH 2026', 'hackathon', 'AI hackathon', 'startup hackathon', 'Hyderabad hackathon', 'pan-India hackathon', 'Festora', 'student hackathon India'],
  authors: [{ name: 'Festora · 221B Labs' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Festora',
    title: `${EVENT.fullName} — ${EVENT.tagline.join(' ')}`,
    description,
  },
  twitter: { card: 'summary_large_image', title: EVENT.fullName, description },
};

export const viewport: Viewport = {
  themeColor: '#110609',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={fontVariables}>
      <body>
        <a href="#main" className="skip-link btn-ticket btn-ticket--sm notch-x">
          Skip to content
        </a>
        <SmoothScroll>
          <SiteChrome>
            <Header />
          </SiteChrome>
          <main id="main">{children}</main>
          <SiteChrome>
            <Footer />
          </SiteChrome>
        </SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
