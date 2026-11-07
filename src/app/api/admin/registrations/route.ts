import { requireAdmin } from '@/lib/server/admin-guard';
import { listRegistrations } from '@/lib/server/registrations';
import { handleError, json } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const regs = await listRegistrations();
    const paid = regs.filter((r) => r.status === 'paid');
    const participants = paid.reduce((n, r) => n + r.teamSize, 0);
    const checkedIn = paid.reduce((n, r) => n + r.members.filter((m) => m.checkedInAt).length, 0);
    return json({
      stats: {
        teams: paid.length,
        participants,
        checkedIn,
        revenue: paid.reduce((n, r) => n + r.amount.total, 0),
        ticketRevenue: paid.reduce((n, r) => n + r.amount.tickets, 0),
        platformFees: paid.reduce((n, r) => n + r.amount.fees, 0),
        pending: regs.filter((r) => r.status === 'created').length,
        failed: regs.filter((r) => r.status === 'failed').length,
        emailIssues: paid.filter((r) => r.emailError).length,
      },
      registrations: regs,
    });
  } catch (e) {
    return handleError(e, 'admin/registrations');
  }
}
