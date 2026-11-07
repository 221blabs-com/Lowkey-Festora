import { getByOrderId } from '@/lib/server/registrations';
import { verifyWebhookSignature } from '@/lib/server/razorpay';
import { fail, fulfil } from '@/lib/server/fulfil';
import { json } from '@/lib/server/http';

export const runtime = 'nodejs';

/**
 * Server-to-server safety net: confirms payments even if the buyer closes the
 * tab before the browser callback runs. Configure in Razorpay Dashboard →
 * Webhooks with events payment.captured and payment.failed.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get('x-razorpay-signature') || '';
  try {
    if (!verifyWebhookSignature(raw, sig)) return json({ error: 'Bad signature' }, 400);
  } catch (e) {
    console.error('[webhook] not configured', e);
    return json({ error: 'Not configured' }, 503);
  }

  const evt = JSON.parse(raw) as { event: string; payload?: { payment?: { entity?: { id: string; order_id: string; amount: number; method?: string; error_description?: string } } } };
  const p = evt.payload?.payment?.entity;
  if (!p?.order_id) return json({ ok: true, ignored: true });

  const reg = await getByOrderId(p.order_id);
  if (!reg) return json({ ok: true, ignored: 'unknown order' });

  if (evt.event === 'payment.captured' && p.amount === reg.amount.total * 100) {
    await fulfil(reg.id, { paymentId: p.id, method: p.method ?? null });
  } else if (evt.event === 'payment.failed') {
    await fail(reg.id, p.error_description || 'Payment failed');
  }
  return json({ ok: true });
}
