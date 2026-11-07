import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTION, firestore } from './firebase';
import { newRegistrationId, newTicketId } from './tickets';
import { quote } from '@/lib/pricing';

export type Member = {
  name: string;
  email: string;
  phone: string;
  ticketId: string;
  checkedInAt: string | null;
};

export type RegStatus = 'created' | 'paid' | 'failed';

export type Registration = {
  id: string;
  status: RegStatus;
  teamName: string;
  college: string;
  city: string;
  track: string;
  members: Member[];
  memberEmails: string[];
  ticketIds: string[];
  leaderEmail: string;
  teamSize: number;
  amount: { tickets: number; fees: number; total: number; currency: 'INR' };
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paymentMethod: string | null;
  failureReason: string | null;
  emailsSentAt: string | null;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
};

export type NewRegistration = {
  teamName: string;
  college: string;
  city: string;
  track: string;
  members: { name: string; email: string; phone: string }[];
};

const col = () => firestore().collection(COLLECTION());
const now = () => new Date().toISOString();

/** Emails that already hold a PAID ticket — prevents double registration. */
export async function findPaidDuplicates(emails: string[]) {
  const snap = await col().where('memberEmails', 'array-contains-any', emails.slice(0, 10)).get();
  const taken = new Set<string>();
  snap.docs.forEach((d) => {
    const r = d.data() as Registration;
    if (r.status === 'paid') r.memberEmails.forEach((e) => emails.includes(e) && taken.add(e));
  });
  return [...taken];
}

export async function createPending(input: NewRegistration): Promise<Registration> {
  const id = newRegistrationId();
  const q = quote(input.members.length);
  const members: Member[] = input.members.map((m) => ({ ...m, ticketId: newTicketId(), checkedInAt: null }));
  const reg: Registration = {
    id,
    status: 'created',
    teamName: input.teamName,
    college: input.college,
    city: input.city,
    track: input.track,
    members,
    memberEmails: members.map((m) => m.email),
    ticketIds: members.map((m) => m.ticketId),
    leaderEmail: members[0].email,
    teamSize: members.length,
    amount: { tickets: q.tickets, fees: q.fees, total: q.total, currency: 'INR' },
    razorpayOrderId: null,
    razorpayPaymentId: null,
    paymentMethod: null,
    failureReason: null,
    emailsSentAt: null,
    emailError: null,
    createdAt: now(),
    updatedAt: now(),
    paidAt: null,
  };
  await col().doc(id).set(reg);
  return reg;
}

export async function attachOrder(id: string, orderId: string) {
  await col().doc(id).update({ razorpayOrderId: orderId, updatedAt: now() });
}

export async function getRegistration(id: string) {
  const doc = await col().doc(id).get();
  return doc.exists ? (doc.data() as Registration) : null;
}

export async function getByOrderId(orderId: string) {
  const snap = await col().where('razorpayOrderId', '==', orderId).limit(1).get();
  return snap.empty ? null : (snap.docs[0].data() as Registration);
}

export async function getByTicketId(ticketId: string) {
  const snap = await col().where('ticketIds', 'array-contains', ticketId).limit(1).get();
  return snap.empty ? null : (snap.docs[0].data() as Registration);
}

/**
 * created|failed → paid, atomically. Returns `transitioned: true` only for the
 * single caller that flipped it, so emails are sent exactly once even when the
 * browser callback and the Razorpay webhook race each other.
 */
export async function markPaid(id: string, payment: { paymentId: string; method?: string | null }) {
  return firestore().runTransaction(async (tx) => {
    const ref = col().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error('Registration not found');
    const reg = snap.data() as Registration;
    if (reg.status === 'paid') return { reg, transitioned: false };
    const update = {
      status: 'paid' as const,
      razorpayPaymentId: payment.paymentId,
      paymentMethod: payment.method ?? null,
      failureReason: null,
      paidAt: now(),
      updatedAt: now(),
    };
    tx.update(ref, update);
    return { reg: { ...reg, ...update }, transitioned: true };
  });
}

/** Never downgrades a paid registration. */
export async function markFailed(id: string, reason: string) {
  return firestore().runTransaction(async (tx) => {
    const ref = col().doc(id);
    const snap = await tx.get(ref);
    if (!snap.exists) return { reg: null, transitioned: false };
    const reg = snap.data() as Registration;
    if (reg.status !== 'created') return { reg, transitioned: false };
    const update = { status: 'failed' as const, failureReason: reason.slice(0, 300), updatedAt: now() };
    tx.update(ref, update);
    return { reg: { ...reg, ...update }, transitioned: true };
  });
}

export async function recordEmails(id: string, error: string | null) {
  await col().doc(id).update({ emailsSentAt: error ? null : now(), emailError: error, updatedAt: now() });
}

export async function listRegistrations(limit = 2000) {
  const snap = await col().orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map((d) => d.data() as Registration);
}

export async function setCheckIn(ticketId: string, checkedIn: boolean) {
  return firestore().runTransaction(async (tx) => {
    const snap = await tx.get(col().where('ticketIds', 'array-contains', ticketId).limit(1));
    if (snap.empty) return null;
    const ref = snap.docs[0].ref;
    const reg = snap.docs[0].data() as Registration;
    const members = reg.members.map((m) => (m.ticketId === ticketId ? { ...m, checkedInAt: checkedIn ? now() : null } : m));
    tx.update(ref, { members, updatedAt: now() });
    return { ...reg, members };
  });
}

export const serverTimestamp = FieldValue.serverTimestamp;
