import QRCode from 'qrcode';
import { optionalEnv, env } from './env';
import type { Registration, Member } from './registrations';
import { ticketUrl } from './tickets';
import { SITE_URL } from '@/lib/config';
import { EVENT, MILESTONES } from '@/content/event';
import { PLATFORM_FEE, TICKET_PRICE } from '@/lib/pricing';

/**
 * Transactional mail via Resend's REST API — the provider festora-v1 already
 * uses from the verified festora@221blabs.com domain.
 */
type Attachment = { filename: string; content: string; content_id?: string };

const FROM = () => optionalEnv('MAIL_FROM', 'Festora <festora@221blabs.com>');
export const SUPPORT_EMAIL = () => optionalEnv('SUPPORT_EMAIL', 'festora@221blabs.com');

async function send(to: string | string[], subject: string, html: string, attachments: Attachment[] = []) {
  const res = await fetch(`${process.env.RESEND_API_BASE || 'https://api.resend.com'}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM(), to, subject, html, reply_to: SUPPORT_EMAIL(), attachments }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

const inr = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Table-based layout, inline styles: renders in Gmail, Outlook and Apple Mail. */
function layout(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;background:#110609;font-family:Helvetica,Arial,sans-serif;color:#e8d0a8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#110609;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a0a0e;border:1px solid #3a141b">
<tr><td style="padding:28px 32px;border-bottom:1px solid #3a141b">
  <img src="${SITE_URL}/brand/festora-mark-256.png" width="32" height="35" alt="" style="vertical-align:middle;border:0">
  <img src="${SITE_URL}/brand/festora-wordmark.png" width="102" height="18" alt="Festora" style="vertical-align:middle;margin-left:10px;border:0">
</td></tr>
<tr><td style="padding:32px">${body}</td></tr>
<tr><td style="padding:22px 32px;border-top:1px solid #3a141b;font-size:12px;line-height:1.6;color:#a8907a">
  Festora · campus event ticketing by 221B Labs<br>
  Questions? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL()}" style="color:#e8d0a8">${SUPPORT_EMAIL()}</a>
</td></tr></table></td></tr></table></body></html>`;
}

const h1 = (t: string) => `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:400;font-size:30px;line-height:1.15;color:#e8d0a8">${t}</h1>`;
const label = (t: string) => `<div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#e0485a;margin:0 0 6px">${t}</div>`;
const p = (t: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#e8d0a8">${t}</p>`;
const muted = (t: string) => `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#a8907a">${t}</p>`;
const button = (href: string, t: string) =>
  `<a href="${href}" style="display:inline-block;background:#e8d0a8;color:#110609;text-decoration:none;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:14px 22px">${t}</a>`;

function eventBlock() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border-top:1px solid #3a141b">
${MILESTONES.map((m) => `<tr><td style="padding:10px 0;border-bottom:1px solid #3a141b;font-size:13px;color:#a8907a">${m.label}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #3a141b;font-size:13px;color:#e8d0a8">${m.date}</td></tr>`).join('')}
</table>`;
}

function ticketCard(m: Member, cid: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#2a0d13;border:1px solid #96182a;margin:0 0 20px">
<tr><td style="padding:22px">
  ${label('Admit one · ' + EVENT.fullName)}
  <div style="font-family:Georgia,serif;font-size:24px;color:#e8d0a8;margin:4px 0 2px">${esc(m.name)}</div>
  <div style="font-family:'Courier New',monospace;font-size:16px;letter-spacing:2px;color:#e8d0a8">${m.ticketId}</div>
</td><td width="132" style="padding:16px" align="right"><img src="cid:${cid}" width="120" height="120" alt="Ticket QR ${m.ticketId}" style="display:block;background:#e8d0a8;border:0"></td></tr></table>`;
}

async function qrAttachment(m: Member): Promise<Attachment> {
  const png = await QRCode.toBuffer(ticketUrl(m.ticketId), { errorCorrectionLevel: 'M', margin: 2, width: 480, color: { dark: '#1d070cff', light: '#e8d0a8ff' } });
  return { filename: `${m.ticketId}.png`, content: png.toString('base64'), content_id: `qr-${m.ticketId}` };
}

function receiptTable(r: Registration) {
  const row = (k: string, v: string, strong = false) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid #3a141b;font-size:14px;color:#a8907a">${k}</td><td align="right" style="padding:9px 0;border-bottom:1px solid #3a141b;font-size:${strong ? 18 : 14}px;color:#e8d0a8">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-top:1px solid #3a141b">
${row(`Tickets · ${r.teamSize} × ${inr(TICKET_PRICE)}`, inr(r.amount.tickets))}
${row(`Platform fee · ${r.teamSize} × ${inr(PLATFORM_FEE)}`, inr(r.amount.fees))}
${row('Total paid', inr(r.amount.total), true)}
${row('Payment ID', r.razorpayPaymentId ?? '—')}
${row('Registration', r.id)}
</table>`;
}

/** Leader: receipt + their ticket. Other members: their own ticket. Admin: notification. */
export async function sendPaidEmails(r: Registration) {
  const [leader, ...rest] = r.members;
  const leaderQr = await qrAttachment(leader);
  await send(
    leader.email,
    `You're in — ${EVENT.fullName} · ${r.teamName}`,
    layout(
      'Registration confirmed',
      `${label('Payment successful')}${h1(`${esc(r.teamName)} is registered.`)}
${p(`Thank you, ${esc(leader.name)}. Your team of ${r.teamSize} is confirmed for the ${EVENT.fullName} online round. Every member gets their own ticket by email.`)}
${ticketCard(leader, leaderQr.content_id!)}
<div style="margin:0 0 24px">${button(ticketUrl(leader.ticketId), 'View my ticket')}</div>
${label('Receipt')}${receiptTable(r)}
${label('Your team')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-top:1px solid #3a141b">
${r.members.map((m) => `<tr><td style="padding:9px 0;border-bottom:1px solid #3a141b;font-size:14px;color:#e8d0a8">${esc(m.name)}</td><td align="right" style="padding:9px 0;border-bottom:1px solid #3a141b;font-family:'Courier New',monospace;font-size:13px;color:#a8907a">${m.ticketId}</td></tr>`).join('')}
</table>
${label('Key dates')}${eventBlock()}
${muted('Submissions are made through the official LOWKEY TECH Google Form, which the organisers share with registered teams. Fees are non-refundable and non-transferable.')}`,
    ),
    [leaderQr],
  );

  for (const m of rest) {
    const qr = await qrAttachment(m);
    await send(
      m.email,
      `Your ticket — ${EVENT.fullName}`,
      layout(
        'Your ticket',
        `${label('Ticket issued')}${h1(`You're on ${esc(r.teamName)}.`)}
${p(`Hi ${esc(m.name)}, ${esc(leader.name)} registered you for the ${EVENT.fullName} online round. Here is your personal ticket.`)}
${ticketCard(m, qr.content_id!)}
<div style="margin:0 0 24px">${button(ticketUrl(m.ticketId), 'View my ticket')}</div>
${label('Key dates')}${eventBlock()}`,
      ),
      [qr],
    );
  }

  const admin = optionalEnv('ADMIN_NOTIFY_EMAIL');
  if (admin) {
    await send(
      admin.split(',').map((s) => s.trim()),
      `New paid registration · ${r.teamName} · ${inr(r.amount.total)}`,
      layout(
        'New registration',
        `${label('New paid registration')}${h1(esc(r.teamName))}
${p(`${esc(r.college)} · ${esc(r.city)} · Track: ${esc(r.track)}`)}
${receiptTable(r)}
${r.members.map((m) => muted(`${esc(m.name)} · ${esc(m.email)} · ${esc(m.phone)} · ${m.ticketId}`)).join('')}
<div>${button(`${SITE_URL}/admin.html`, 'Open admin')}</div>`,
      ),
    );
  }
}

export async function sendFailedEmail(r: Registration) {
  const leader = r.members[0];
  await send(
    leader.email,
    `Payment not completed — ${EVENT.fullName}`,
    layout(
      'Payment not completed',
      `${label('Payment not completed')}${h1('Your registration is not confirmed yet.')}
${p(`Hi ${esc(leader.name)}, the payment for ${esc(r.teamName)} did not go through${r.failureReason ? ` (${esc(r.failureReason)})` : ''}. No tickets were issued.`)}
${muted('If money was debited from your account, it is normally reversed automatically by your bank within 5–7 working days. Reply to this email with your registration ID if it is not.')}
${muted(`Registration ID: ${r.id}`)}
<div>${button(`${SITE_URL}/register`, 'Try again')}</div>`,
    ),
  );
}
