/**
 * Deployment-level configuration (safe for the browser — no secrets here).
 * Registration, payment (Razorpay), tickets and email all run inside this app.
 */
const trimSlash = (value: string) => value.replace(/\/+$/, '');

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in Vercel; it is used in emails, QR codes and SEO. */
export const SITE_URL = trimSlash(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    'http://localhost:3000',
);

export const REGISTER_URL = '/register';
export const SUPPORT_EMAIL_PUBLIC = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'festora@221blabs.com';
