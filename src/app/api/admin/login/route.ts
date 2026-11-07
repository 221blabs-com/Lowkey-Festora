import { ADMIN_COOKIE, checkCredentials, createSessionValue, sessionCookieOptions } from '@/lib/server/admin-auth';
import { handleError, json } from '@/lib/server/http';

export const runtime = 'nodejs';

// Best-effort throttle per warm instance; slows brute force without extra infra.
const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) return json({ error: 'Too many attempts. Try again in a few minutes.' }, 429);
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, string>;
    if (!checkCredentials(String(b.username || ''), String(b.password || ''))) {
      const n = (a?.n ?? 0) + 1;
      attempts.set(ip, { n, until: n >= 5 ? Date.now() + 10 * 60_000 : 0 });
      await new Promise((r) => setTimeout(r, 400));
      return json({ error: 'Invalid username or password.' }, 401);
    }
    attempts.delete(ip);
    const res = json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, createSessionValue(String(b.username)), sessionCookieOptions);
    return res;
  } catch (e) {
    return handleError(e, 'admin/login');
  }
}
