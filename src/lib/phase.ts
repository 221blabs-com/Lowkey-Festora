import { MILESTONES } from '@/content/event';

/**
 * Where the event is right now, computed in absolute time (milestone instants
 * are IST). Day counts are whole days to the next milestone — the guides give
 * dates, not start times, so the UI never implies hour-level precision.
 */
export type Phase =
  | { kind: 'before'; target: 'online'; days: number }
  | { kind: 'live'; target: 'online' }
  | { kind: 'before'; target: 'shortlist'; days: number }
  | { kind: 'before'; target: 'finale'; days: number }
  | { kind: 'live'; target: 'finale' }
  | { kind: 'after' };

const DAY = 86_400_000;
const at = (id: (typeof MILESTONES)[number]['id']) => {
  const m = MILESTONES.find((x) => x.id === id)!;
  return { start: Date.parse(m.start), end: Date.parse(m.end) };
};

export function getPhase(now: number): Phase {
  const online = at('online');
  const shortlist = at('shortlist');
  const finale = at('finale');
  const daysTo = (t: number) => Math.max(1, Math.ceil((t - now) / DAY));

  if (now < online.start) return { kind: 'before', target: 'online', days: daysTo(online.start) };
  if (now < online.end) return { kind: 'live', target: 'online' };
  if (now < shortlist.start) return { kind: 'before', target: 'shortlist', days: daysTo(shortlist.start) };
  if (now < finale.start) return { kind: 'before', target: 'finale', days: daysTo(finale.start) };
  if (now < finale.end) return { kind: 'live', target: 'finale' };
  return { kind: 'after' };
}

export function describePhase(phase: Phase): { lead: string; value: string; unit: string } {
  switch (phase.kind) {
    case 'before': {
      const unit = phase.days === 1 ? 'day' : 'days';
      const lead =
        phase.target === 'online'
          ? 'until the online round opens'
          : phase.target === 'shortlist'
            ? 'until the shortlist is announced'
            : 'until the grand finale';
      return { lead, value: String(phase.days).padStart(2, '0'), unit };
    }
    case 'live':
      return phase.target === 'online'
        ? { lead: 'The 48-hour online round is underway', value: 'Live', unit: '' }
        : { lead: 'The grand finale is underway in Hyderabad', value: 'Live', unit: '' };
    case 'after':
      return { lead: 'LOWKEY TECH 2026 has concluded', value: 'Fin', unit: '' };
  }
}
