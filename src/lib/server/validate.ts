import { MISSIONS, TEAM } from '@/content/event';
import type { NewRegistration } from './registrations';

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(\+?91)?[6-9]\d{9}$/; // Indian mobile numbers

export function validateRegistration(body: unknown): { ok: true; data: NewRegistration } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  if (clean(b.website, 100)) return { ok: false, error: 'Invalid submission.' }; // honeypot
  const teamName = clean(b.teamName, 60);
  const college = clean(b.college, 120);
  const city = clean(b.city, 60);
  const track = clean(b.track, 60);
  if (teamName.length < 2) return { ok: false, error: 'Enter a team name.' };
  if (college.length < 2) return { ok: false, error: 'Enter your college or organisation.' };
  if (city.length < 2) return { ok: false, error: 'Enter your city.' };
  if (!MISSIONS.some((m) => m.name === track)) return { ok: false, error: 'Choose a mission.' };
  if (b.consent !== true) return { ok: false, error: 'Please accept the event rules and fee policy.' };

  const raw = Array.isArray(b.members) ? b.members : [];
  if (raw.length < TEAM.min || raw.length > TEAM.max) return { ok: false, error: `Teams must have ${TEAM.min}–${TEAM.max} members.` };
  const members = raw.map((m) => {
    const r = (m ?? {}) as Record<string, unknown>;
    return { name: clean(r.name, 80), email: clean(r.email, 120).toLowerCase(), phone: clean(r.phone, 20).replace(/[\s-]/g, '') };
  });
  for (const [i, m] of members.entries()) {
    const who = i === 0 ? 'Team leader' : `Member ${i + 1}`;
    if (m.name.length < 2) return { ok: false, error: `${who}: enter a full name.` };
    if (!EMAIL.test(m.email)) return { ok: false, error: `${who}: enter a valid email.` };
    if (!PHONE.test(m.phone)) return { ok: false, error: `${who}: enter a valid 10-digit Indian mobile number.` };
  }
  if (new Set(members.map((m) => m.email)).size !== members.length) return { ok: false, error: 'Each member needs a different email address.' };
  return { ok: true, data: { teamName, college, city, track, members } };
}
