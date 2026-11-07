import { ADMIN_COOKIE, sessionCookieOptions } from '@/lib/server/admin-auth';
import { json } from '@/lib/server/http';

export async function POST() {
  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
