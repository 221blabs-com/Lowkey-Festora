import { validateRegistration } from '@/lib/server/validate';
import { attachOrder, createPending, findPaidDuplicates } from '@/lib/server/registrations';
import { createOrder } from '@/lib/server/razorpay';
import { env } from '@/lib/server/env';
import { handleError, json } from '@/lib/server/http';
import { quote } from '@/lib/pricing';
import { EVENT } from '@/content/event';

export const runtime = 'nodejs';

/** Step 1: validate team, price it server-side, open a Razorpay order. */
export async function POST(req: Request) {
  try {
    const v = validateRegistration(await req.json().catch(() => null));
    if (!v.ok) return json({ error: v.error }, 400);

    const keyId = env('RAZORPAY_KEY_ID');
    const dupes = await findPaidDuplicates(v.data.members.map((m) => m.email));
    if (dupes.length) return json({ error: `Already registered with a paid ticket: ${dupes.join(', ')}` }, 409);

    const reg = await createPending(v.data);
    const q = quote(reg.teamSize);
    const order = await createOrder({
      amountPaise: q.totalPaise,
      receipt: reg.id,
      notes: { registrationId: reg.id, team: reg.teamName.slice(0, 200), size: String(reg.teamSize) },
    });
    await attachOrder(reg.id, order.id);

    return json({
      registrationId: reg.id,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      keyId,
      prefill: { name: reg.members[0].name, email: reg.members[0].email, contact: reg.members[0].phone },
      description: `${EVENT.fullName} · ${reg.teamSize} ticket${reg.teamSize > 1 ? 's' : ''}`,
    });
  } catch (e) {
    return handleError(e, 'register');
  }
}
