import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { optionalEnv, env, isConfigured } from './env';
import type { Registration, Member } from './registrations';
import { ticketUrl } from './tickets';
import { SITE_URL } from '@/lib/config';
import { EVENT, MILESTONES } from '@/content/event';
import { PLATFORM_FEE, TICKET_PRICE } from '@/lib/pricing';

/**
 * Transactional mail via Resend's REST API — the provider festora-v1 already
 * uses from the verified festora@221blabs.com domain. If Resend is
 * unreachable or a send fails, we fall back to SMTP (Brevo's relay by
 * default), the same secondary path festora-v1 uses.
 */
type Attachment = { filename: string; content: string; content_id?: string };

const FROM = () => optionalEnv('MAIL_FROM', 'Festora <festora@221blabs.com>');
export const SUPPORT_EMAIL = () => optionalEnv('SUPPORT_EMAIL', 'festora@221blabs.com');

async function sendViaResend(to: string | string[], subject: string, html: string, attachments: Attachment[]) {
  const res = await fetch(`${process.env.RESEND_API_BASE || 'https://api.resend.com'}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM(), to, subject, html, reply_to: SUPPORT_EMAIL(), attachments }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

const hasSmtpConfig = () => isConfigured('SMTP_USER', 'SMTP_PASS');

async function sendViaSMTP(to: string | string[], subject: string, html: string, attachments: Attachment[]) {
  const port = Number(optionalEnv('SMTP_PORT', '587'));
  const transporter = nodemailer.createTransport({
    host: optionalEnv('SMTP_HOST', 'smtp-relay.brevo.com'),
    port,
    secure: port === 465,
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
  });
  await transporter.sendMail({
    from: optionalEnv('SMTP_FROM', FROM()),
    to,
    subject,
    html,
    replyTo: SUPPORT_EMAIL(),
    attachments: attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.content, 'base64'), cid: a.content_id })),
  });
}

async function send(to: string | string[], subject: string, html: string, attachments: Attachment[] = []) {
  try {
    await sendViaResend(to, subject, html, attachments);
    return;
  } catch (resendErr) {
    if (!hasSmtpConfig()) throw resendErr;
    console.error('[mail] Resend failed, falling back to SMTP', resendErr);
  }
  await sendViaSMTP(to, subject, html, attachments);
}

const inr = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const BADGE_TONE = {
  confirmed: { border: '#e8d0a8', color: '#e8d0a8', bg: 'rgba(232,208,168,0.08)' },
  notice: { border: '#e0485a', color: '#e0485a', bg: 'rgba(224,72,90,0.08)' },
  neutral: { border: '#a8907a', color: '#a8907a', bg: 'rgba(168,144,122,0.08)' },
} as const;

function badgeHtml(text: string, tone: keyof typeof BADGE_TONE) {
  const t = BADGE_TONE[tone];
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td align="center" style="background:${t.bg};border:1px solid ${t.border};padding:6px 16px">
  <span style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${t.color}">${text}</span>
</td></tr></table>`;
}

/** Table-based layout, inline styles: renders in Gmail, Outlook and Apple Mail. */
function layout(title: string, body: string, badge?: { text: string; tone: keyof typeof BADGE_TONE }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;background:#110609;font-family:Helvetica,Arial,sans-serif;color:#e8d0a8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#110609;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a0a0e;border:1px solid #3a141b">
<tr><td style="height:3px;line-height:3px;font-size:1px;background:linear-gradient(90deg,#2a0d13 0%,#96182a 30%,#e8d0a8 50%,#96182a 70%,#2a0d13 100%)">&nbsp;</td></tr>
<tr><td align="center" style="padding:30px 32px 22px;border-bottom:1px solid #3a141b">
  <img src="${SITE_URL}/brand/festora-mark-256.png" width="28" height="31" alt="" style="vertical-align:middle;border:0">
  <img src="${SITE_URL}/brand/festora-wordmark.png" width="90" height="16" alt="Festora" style="vertical-align:middle;margin-left:8px;border:0">
  <div style="margin-top:10px;font-family:'Courier New',monospace;font-size:10.5px;letter-spacing:2.5px;text-transform:uppercase;color:#a8907a">${esc(EVENT.fullName)} &middot; ${esc(EVENT.kind)}</div>
  ${badge ? `<div style="margin-top:16px">${badgeHtml(badge.text, badge.tone)}</div>` : ''}
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
const button = (href: string, t: string) =>
  `<a href="${href}" style="display:inline-block;background:#e8d0a8;color:#110609;text-decoration:none;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:14px 22px">${t}</a>`;

/** Bordered section used throughout the body — the email equivalent of this site's card sections. */
function card(titleLabel: string, bodyHtml: string, opts: { accent?: boolean } = {}) {
  const bg = opts.accent ? '#2a0d13' : '#150810';
  const border = opts.accent ? '#96182a' : '#3a141b';
  const rule = opts.accent ? 'rgba(232,208,168,0.25)' : '#241019';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border:1px solid ${border};margin:0 0 20px">
<tr><td style="padding:14px 20px 10px;border-bottom:1px solid ${rule}">${label(titleLabel)}</td></tr>
<tr><td style="padding:18px 20px 20px">${bodyHtml}</td></tr>
</table>`;
}

function keyValueRows(rows: Array<[string, string]>) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${rows.map(([k, v]) => `<tr><td style="padding:5px 0;font-size:12px;color:#a8907a;width:120px;text-transform:uppercase;letter-spacing:0.5px">${k}</td><td style="padding:5px 0;font-size:13.5px;color:#e8d0a8">${v}</td></tr>`).join('')}
</table>`;
}

function noticeBox(title: string, items: string[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 4px"><tr><td style="border-left:3px solid #e0485a;background:#150810;padding:16px 20px">
  ${label(title)}
  <ul style="margin:8px 0 0;padding-left:18px">
    ${items.map((it) => `<li style="margin-bottom:6px;font-size:13px;line-height:1.6;color:#c9b8a8">${it}</li>`).join('')}
  </ul>
</td></tr></table>`;
}

function registrationCard(r: Registration) {
  return card(
    'Registration',
    keyValueRows([
      ['Team', esc(r.teamName)],
      ['Mission', esc(r.track)],
      ['College', esc(r.college)],
      ['City', esc(r.city)],
      ['Registration', r.id],
    ]),
  );
}

function eventBlock() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${MILESTONES.map((m) => `<tr><td style="padding:10px 0;border-bottom:1px solid #241019;font-size:13px;color:#a8907a">${m.label}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #241019;font-size:13px;color:#e8d0a8">${m.date}</td></tr>`).join('')}
</table>`;
}

function ticketCard(m: Member, cid: string) {
  return card(
    `Entry pass · ${esc(EVENT.fullName)}`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td style="padding-right:16px">
    <div style="font-family:Georgia,serif;font-size:22px;color:#e8d0a8;margin:0 0 4px">${esc(m.name)}</div>
    <div style="font-family:'Courier New',monospace;font-size:15px;letter-spacing:2px;color:#e8d0a8">${m.ticketId}</div>
  </td>
  <td width="112" align="right"><img src="cid:${cid}" width="100" height="100" alt="Ticket QR ${m.ticketId}" style="display:block;background:#e8d0a8;border:0"></td>
</tr></table>
<div style="margin-top:18px">${button(ticketUrl(m.ticketId), 'View &amp; download ticket')}</div>`,
    { accent: true },
  );
}

async function qrAttachment(m: Member): Promise<Attachment> {
  const png = await QRCode.toBuffer(ticketUrl(m.ticketId), { errorCorrectionLevel: 'M', margin: 2, width: 480, color: { dark: '#1d070cff', light: '#e8d0a8ff' } });
  return { filename: `${m.ticketId}.png`, content: png.toString('base64'), content_id: `qr-${m.ticketId}` };
}

function receiptRows(r: Registration) {
  const row = (k: string, v: string, strong = false) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid #241019;font-size:14px;color:#a8907a">${k}</td><td align="right" style="padding:9px 0;border-bottom:1px solid #241019;font-size:${strong ? 18 : 14}px;color:#e8d0a8">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row(`Tickets · ${r.teamSize} × ${inr(TICKET_PRICE)}`, inr(r.amount.tickets))}
${row(`Platform fee · ${r.teamSize} × ${inr(PLATFORM_FEE)}`, inr(r.amount.fees))}
${row('Total paid', inr(r.amount.total), true)}
${row('Payment ID', r.razorpayPaymentId ?? '—')}
</table>`;
}

function teamRosterCard(r: Registration) {
  const rows = r.members
    .map(
      (m) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #241019;font-size:14px;color:#e8d0a8">${esc(m.name)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #241019;font-family:'Courier New',monospace;font-size:12.5px;color:#a8907a">${m.ticketId}</td></tr>`,
    )
    .join('');
  return card(`Team · ${esc(r.teamName)} (${r.teamSize})`, `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`);
}

function adminRosterCard(r: Registration) {
  const rows = r.members
    .map(
      (m) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #241019;font-size:13px;color:#e8d0a8">${esc(m.name)}</td><td style="padding:8px 0;border-bottom:1px solid #241019;font-size:12px;color:#a8907a">${esc(m.email)} &middot; ${esc(m.phone)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #241019;font-family:'Courier New',monospace;font-size:12px;color:#a8907a">${m.ticketId}</td></tr>`,
    )
    .join('');
  return card('Team roster', `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`);
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
      `${h1(`${esc(r.teamName)} is registered.`)}
${p(`Thank you, ${esc(leader.name)}. Your team of ${r.teamSize} is confirmed for the ${EVENT.fullName} online round. Every member gets their own ticket by email.`)}
${registrationCard(r)}
${ticketCard(leader, leaderQr.content_id!)}
${card('Receipt', receiptRows(r))}
${teamRosterCard(r)}
${card('Key dates', eventBlock())}
${noticeBox('Before the deadline', [
  'Submissions are made through the official LOWKEY TECH Google Form, which the organisers share with registered teams.',
  'Registration fees are non-refundable and non-transferable.',
  'Each ticket QR code is unique — keep it private and do not share it.',
])}`,
      { text: 'Registration confirmed', tone: 'confirmed' },
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
        `${h1(`You're on ${esc(r.teamName)}.`)}
${p(`Hi ${esc(m.name)}, ${esc(leader.name)} registered you for the ${EVENT.fullName} online round. Here is your personal ticket.`)}
${ticketCard(m, qr.content_id!)}
${card('Key dates', eventBlock())}
${noticeBox('Keep handy', ['Each ticket QR code is unique — keep it private and do not share it.', 'Your team lead received the full receipt and team roster.'])}`,
        { text: 'Ticket issued', tone: 'confirmed' },
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
        `${h1(esc(r.teamName))}
${p(`${esc(r.college)} · ${esc(r.city)} · Mission: ${esc(r.track)}`)}
${card('Receipt', receiptRows(r))}
${adminRosterCard(r)}
<div>${button(`${SITE_URL}/admin.html`, 'Open admin')}</div>`,
        { text: 'New paid registration', tone: 'neutral' },
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
      `${h1('Your registration is not confirmed yet.')}
${p(`Hi ${esc(leader.name)}, the payment for ${esc(r.teamName)} did not go through${r.failureReason ? ` (${esc(r.failureReason)})` : ''}. No tickets were issued.`)}
${noticeBox('What happens next', [
  'If money was debited from your account, it is normally reversed automatically by your bank within 5–7 working days.',
  `Registration ID: ${r.id} — reply to this email with it if your refund is delayed.`,
])}
<div style="margin-top:20px">${button(`${SITE_URL}/register`, 'Try again')}</div>`,
      { text: 'Payment not completed', tone: 'notice' },
    ),
  );
}
