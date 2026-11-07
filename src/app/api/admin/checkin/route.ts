import { requireAdmin } from '@/lib/server/admin-guard';
import { getByTicketId, setCheckIn } from '@/lib/server/registrations';
import { handleError, json } from '@/lib/server/http';

export const runtime = 'nodejs';

/** Accepts a ticket ID ("LT26-XXXXXX") or a full ticket URL scanned from the QR. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const b = (await req.json().catch(() => ({}))) as { code?: string; checkedIn?: boolean };
    const match = String(b.code || '').toUpperCase().match(/LT26-[A-Z0-9]{6}/);
    if (!match) return json({ error: 'Enter a ticket ID like LT26-ABC234 or scan its QR link.' }, 400);
    const reg = await getByTicketId(match[0]);
    if (!reg) return json({ error: 'Ticket not found.' }, 404);
    if (reg.status !== 'paid') return json({ error: `Registration is ${reg.status} — ticket not valid.` }, 409);
    const member = reg.members.find((m) => m.ticketId === match[0])!;
    if (b.checkedIn !== false && member.checkedInAt) return json({ ok: true, already: true, member, team: reg.teamName });
    const updated = await setCheckIn(match[0], b.checkedIn !== false);
    return json({ ok: true, member: updated?.members.find((m) => m.ticketId === match[0]), team: reg.teamName });
  } catch (e) {
    return handleError(e, 'admin/checkin');
  }
}
