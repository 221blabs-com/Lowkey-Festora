import crypto from 'node:crypto';
import { env } from './env';
import { SITE_URL } from '@/lib/config';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

export function newId(len: number) {
  const bytes = crypto.randomBytes(len);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export const newTicketId = () => `LT26-${newId(6)}`;
export const newRegistrationId = () => `REG-${newId(10)}`;

/** Tamper-proof token embedded in each ticket QR. */
export function ticketToken(ticketId: string) {
  return crypto.createHmac('sha256', env('TICKET_SIGNING_SECRET')).update(ticketId).digest('hex').slice(0, 20);
}

export function verifyTicketToken(ticketId: string, token: string) {
  const a = Buffer.from(ticketToken(ticketId));
  const b = Buffer.from(token || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const ticketUrl = (ticketId: string) => `${SITE_URL}/ticket/${ticketId}?t=${ticketToken(ticketId)}`;
