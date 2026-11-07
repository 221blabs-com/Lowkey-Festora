import crypto from 'node:crypto';
import { env } from './env';

/** Razorpay over plain REST — no SDK needed. Docs: razorpay.com/docs/api/orders */
// RAZORPAY_API_BASE exists only for local end-to-end tests; production uses the real API.
const API = process.env.RAZORPAY_API_BASE || 'https://api.razorpay.com/v1';

function auth() {
  return 'Basic ' + Buffer.from(`${env('RAZORPAY_KEY_ID')}:${env('RAZORPAY_KEY_SECRET')}`).toString('base64');
}

export async function createOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }) {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: input.amountPaise, currency: 'INR', receipt: input.receipt, notes: input.notes }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.description || 'Could not create Razorpay order');
  return data as { id: string; amount: number; currency: string; status: string };
}

export async function fetchPayment(paymentId: string) {
  const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: auth() }, cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.description || 'Could not fetch payment');
  return data as { id: string; order_id: string; amount: number; status: string; method?: string; email?: string; contact?: string };
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Checkout handler signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac('sha256', env('RAZORPAY_KEY_SECRET')).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqual(expected, signature);
}

/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto.createHmac('sha256', env('RAZORPAY_WEBHOOK_SECRET')).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}
