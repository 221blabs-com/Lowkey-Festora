import { getRegistration } from '@/lib/server/registrations';
import { fetchPayment, verifyCheckoutSignature } from '@/lib/server/razorpay';
import { fulfil } from '@/lib/server/fulfil';
import { handleError, json } from '@/lib/server/http';

export const runtime = 'nodejs';

/** Step 2: Razorpay Checkout success handler → verify signature + amount → issue tickets. */
export async function POST(req: Request) {
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, string>;
    const { registrationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = b;
    if (!registrationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return json({ error: 'Missing payment details.' }, 400);

    const reg = await getRegistration(registrationId);
    if (!reg || reg.razorpayOrderId !== razorpay_order_id) return json({ error: 'Registration not found.' }, 404);
    if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return json({ error: 'Payment signature mismatch.' }, 400);

    const payment = await fetchPayment(razorpay_payment_id);
    if (payment.order_id !== reg.razorpayOrderId || payment.amount !== reg.amount.total * 100) return json({ error: 'Payment does not match this order.' }, 400);
    if (payment.status !== 'captured' && payment.status !== 'authorized') return json({ error: `Payment is ${payment.status}.` }, 400);

    await fulfil(reg.id, { paymentId: payment.id, method: payment.method ?? null });
    return json({ ok: true, registrationId: reg.id });
  } catch (e) {
    return handleError(e, 'register/verify');
  }
}
