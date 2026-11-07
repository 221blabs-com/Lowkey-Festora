import { requireAdmin } from '@/lib/server/admin-guard';
import { listRegistrations } from '@/lib/server/registrations';
import { handleError } from '@/lib/server/http';

export const runtime = 'nodejs';

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** One row per participant — ready for check-in desks and certificates. */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const status = new URL(req.url).searchParams.get('status') || 'paid';
    const regs = (await listRegistrations()).filter((r) => status === 'all' || r.status === status);
    const header = ['Registration ID', 'Status', 'Team', 'College', 'City', 'Track', 'Role', 'Name', 'Email', 'Phone', 'Ticket ID', 'Checked in', 'Team total (INR)', 'Platform fee (INR)', 'Payment ID', 'Paid at', 'Created at'];
    const rows = regs.flatMap((r) =>
      r.members.map((m, i) => [r.id, r.status, r.teamName, r.college, r.city, r.track, i === 0 ? 'Leader' : 'Member', m.name, m.email, m.phone, m.ticketId, m.checkedInAt ?? '', r.amount.total, r.amount.fees, r.razorpayPaymentId ?? '', r.paidAt ?? '', r.createdAt]),
    );
    const csv = [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
    return new Response('﻿' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lowkey-tech-2026-${status}-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return handleError(e, 'admin/export');
  }
}
