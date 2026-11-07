import { requireAdmin } from '@/lib/server/admin-guard';
import { getRegistration, recordEmails } from '@/lib/server/registrations';
import { sendPaidEmails } from '@/lib/server/mail';
import { handleError, json } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = (await req.json().catch(() => ({}))) as { id?: string };
    const reg = id ? await getRegistration(id) : null;
    if (!reg) return json({ error: 'Registration not found.' }, 404);
    if (reg.status !== 'paid') return json({ error: 'Only paid registrations have tickets.' }, 400);
    try {
      await sendPaidEmails(reg);
      await recordEmails(reg.id, null);
      return json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Email failed';
      await recordEmails(reg.id, msg);
      return json({ error: msg }, 502);
    }
  } catch (e) {
    return handleError(e, 'admin/resend');
  }
}
