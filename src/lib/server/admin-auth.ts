import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { env } from './env';

/**
 * Admin auth: credentials live ONLY in server env vars (never NEXT_PUBLIC_*).
 * Session = HMAC-signed, HTTP-only, SameSite=strict cookie with an expiry.
 */
export const ADMIN_COOKIE = 'festora_admin';
const TTL_SECONDS = 60 * 60 * 12;

const sign = (payload: string) => crypto.createHmac('sha256', env('ADMIN_SESSION_SECRET')).update(payload).digest('base64url');

function safeEqual(a: string, b: string) {
  const x = crypto.createHash('sha256').update(a).digest();
  const y = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x, y);
}

export function checkCredentials(username: string, password: string) {
  const okUser = safeEqual(username, env('ADMIN_USERNAME'));
  const okPass = safeEqual(password, env('ADMIN_PASSWORD'));
  return okUser && okPass;
}

export function createSessionValue(username: string) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSession(value: string | undefined): { u: string } | null {
  if (!value) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return null;
  try {
    if (!safeEqual(sig, sign(payload))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    return { u: String(data.u) };
  } catch {
    return null;
  }
}

export async function getAdmin() {
  const store = await cookies();
  return readSession(store.get(ADMIN_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: TTL_SECONDS,
};
