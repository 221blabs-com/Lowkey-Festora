import { getRegistration } from '@/lib/server/registrations';
import { fail } from '@/lib/server/fulfil';
import { handleError, json } from '@/lib/server/http';

export const runtime = 'nodejs';

/** Browser reports a failed or abandoned checkout. Paid registrations are never downgraded. */
export async function POST(req: Request) {
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, string>;
    if (!b.registrationId) return json({ error: 'Missing registration.' }, 400);
    const reg = await getRegistration(b.registrationId);
    if (!reg) return json({ error: 'Registration not found.' }, 404);
    await fail(reg.id, (b.reason || 'Payment was not completed').slice(0, 300));
    return json({ ok: true });
  } catch (e) {
    return handleError(e, 'register/failed');
  }
}
