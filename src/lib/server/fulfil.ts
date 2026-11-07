import { markFailed, markPaid, recordEmails, type Registration } from './registrations';
import { sendFailedEmail, sendPaidEmails } from './mail';

/** Mark paid and, only on the first transition, send tickets + receipt. */
export async function fulfil(id: string, payment: { paymentId: string; method?: string | null }): Promise<Registration> {
  const { reg, transitioned } = await markPaid(id, payment);
  if (transitioned) {
    try {
      await sendPaidEmails(reg);
      await recordEmails(id, null);
    } catch (e) {
      // Payment stays valid; admin can resend from the dashboard.
      await recordEmails(id, e instanceof Error ? e.message : 'Email failed');
      console.error('[fulfil] email failed', e);
    }
  }
  return reg;
}

export async function fail(id: string, reason: string) {
  const { reg, transitioned } = await markFailed(id, reason);
  if (transitioned && reg) {
    await sendFailedEmail(reg).catch((e) => console.error('[fail] email failed', e));
  }
  return reg;
}
