import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  ACCOMMODATION, AI_POLICY, AUDIENCE, BRING, CONDUCT, CONTACT, CRITERIA, DOWNLOADS, EVENT, FACILITIES, FEES,
  FINALE_DELIVERABLES, IP_POLICY, MILESTONES, MISSION_TEST, MISSIONS, PREBUILT_POLICY, PRINCIPLES, PRIVACY_POLICY, RECOGNITION,
  SUBMISSION_CHECKLIST, SUBMISSION_DELIVERABLES, TEAM,
} from '@/content/event';
import { FAQ } from '@/content/faq';
import { formatINR } from '@/lib/format';
import { REGISTER_URL } from '@/lib/config';
import { GuideToc } from '@/components/guide/GuideToc';
import { TicketButton } from '@/components/ui/TicketButton';

export const metadata: Metadata = {
  title: 'Participant guide',
  description: `Everything about ${EVENT.fullName}: dates, fees, teams, missions, submission checklist, AI policy, finale logistics, judging, rules and FAQs.`,
  alternates: { canonical: '/guide' },
};

const SECTIONS = [
  { id: 'overview', title: 'Overview' },
  { id: 'dates', title: 'Dates & fees' },
  { id: 'teams', title: 'Teams & eligibility' },
  { id: 'tracks', title: 'Missions' },
  { id: 'submission', title: 'Online submission' },
  { id: 'ai', title: 'AI tools & pre-built work' },
  { id: 'finale', title: 'The finale' },
  { id: 'judging', title: 'Judging' },
  { id: 'recognition', title: 'Recognition' },
  { id: 'rules', title: 'Rules & policies' },
  { id: 'faq', title: 'All questions' },
  { id: 'contact', title: 'Contact' },
] as const;

function Part({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28 border-t border-[var(--rule-strong)] pt-10 pb-20 print:break-inside-avoid-page">
      <p className="label text-ember tabular">{String(n).padStart(2, '0')}</p>
      <h2 id={`${id}-h`} className="mt-3 font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-none">
        {title}
      </h2>
      <div className="mt-8 space-y-6 text-[1.0625rem] leading-relaxed">{children}</div>
    </section>
  );
}

function List({ items, ordered }: { items: readonly ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className="border-t border-[var(--rule)]">
      {items.map((it, i) => (
        <li key={i} className="flex gap-4 border-b border-[var(--rule)] py-3.5">
          <span className="label mt-1 w-6 shrink-0 text-muted tabular">{ordered ? String(i + 1).padStart(2, '0') : '—'}</span>
          <span>{it}</span>
        </li>
      ))}
    </Tag>
  );
}

const Note = ({ children }: { children: ReactNode }) => <div className="border-l-2 border-crimson pl-5 text-muted">{children}</div>;

export default function GuidePage() {
  return (
    <div className="print-ink">
      <header className="shell pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-16">
        <p className="label text-muted">
          <span className="text-ember">{EVENT.fullName}</span> · Participant guide
        </p>
        <h1 className="mt-6 max-w-[14ch] font-display text-display">Everything, in one place.</h1>
        <div className="mt-10 grid-12 gap-y-8 items-end">
          <p className="col-span-12 text-lede text-champagne/85 lg:col-span-7">{EVENT.summary}</p>
          <div className="col-span-12 flex flex-wrap gap-x-6 gap-y-3 lg:col-span-4 lg:col-start-9 lg:justify-end no-print">
            {DOWNLOADS.map((d) => (
              <a key={d.href} href={d.href} download className="label link-line pb-1">
                {d.label} · PDF
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="shell grid-12 gap-y-10 pb-[var(--section-y)]">
        <aside className="col-span-12 lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <GuideToc items={SECTIONS} />
            <div className="mt-10 hidden lg:block no-print">
              <TicketButton href={REGISTER_URL} size="sm">
                Register on Festora
              </TicketButton>
            </div>
          </div>
        </aside>

        <article className="col-span-12 lg:col-span-8 lg:col-start-5">
          <Part id="overview" n={1} title="Overview">
            <p>
              <strong className="font-medium text-champagne">{EVENT.fullName}</strong> is a {EVENT.kind} for students, developers, designers, founders and innovators across India. It
              combines a 48-hour online selection challenge with a 24-hour offline grand finale in {EVENT.city}. Teams can use AI tools, external APIs, paid platforms and Vibe Coding
              workflows; the emphasis is on useful products, thoughtful execution and a clear product vision.
            </p>
            <Note>{EVENT.challenge}</Note>
            <h3 className="label pt-4 text-muted">What makes it different</h3>
            <List items={PRINCIPLES.map((p) => (<><strong className="font-medium text-champagne">{p.title}.</strong> <span className="text-muted">{p.body}</span></>))} />
            <h3 className="label pt-4 text-muted">Who should join</h3>
            <List items={AUDIENCE} />
          </Part>

          <Part id="dates" n={2} title="Dates & fees">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left">
                <thead>
                  <tr className="label text-muted">
                    <th scope="col" className="py-3 pr-4 font-medium">Milestone</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Date</th>
                    <th scope="col" className="py-3 font-medium">Format</th>
                  </tr>
                </thead>
                <tbody>
                  {MILESTONES.map((m) => (
                    <tr key={m.id} className="border-t border-[var(--rule)]">
                      <th scope="row" className="py-4 pr-4 font-display text-xl font-normal">{m.label}</th>
                      <td className="py-4 pr-4 tabular">{m.date}</td>
                      <td className="py-4 text-muted">{m.id === 'finale' ? `24-hour event in ${EVENT.city}` : m.format}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-px bg-[var(--rule)] sm:grid-cols-2">
              {[FEES.online, FEES.finale].map((f) => (
                <div key={f.label} className="bg-ink py-6 sm:px-6 sm:first:pl-0">
                  <p className="label text-muted">{f.label}</p>
                  <p className="mt-2 font-display text-5xl tabular">{formatINR(f.amount)}</p>
                  <p className="mt-2 text-[0.9375rem] text-muted">{f.note}</p>
                </div>
              ))}
            </div>
            <List items={FEES.rules} />
            <p className="text-muted">
              Online participation is open across India. Shortlisted teams are expected to attend the finale in person. The announced venue is {EVENT.venue}, {EVENT.city}; the exact
              address and on-ground reporting instructions are shared with shortlisted teams.
            </p>
          </Part>

          <Part id="teams" n={3} title="Teams & eligibility">
            <p>
              Students, aspiring founders and developers from anywhere in India. Teams of <strong className="font-medium text-champagne">{TEAM.min}–{TEAM.max}</strong> members.
            </p>
            <List items={TEAM.rules} />
          </Part>

          <Part id="tracks" n={4} title="Missions">
            <p>
              Each team selects <strong className="font-medium text-champagne">ONE</strong> mission, and the project must directly address it. {MISSION_TEST}
            </p>
            <List ordered items={MISSIONS.map((m) => (<><strong className="font-medium text-champagne">{m.name}.</strong> <span className="text-muted">{m.body}</span></>))} />
          </Part>

          <Part id="submission" n={5} title="Online submission">
            <p>
              During the 48-hour window ({MILESTONES[0].date}) each team selects a mission, identifies a problem, builds or advances its solution, and submits the required materials through
              the <strong className="font-medium text-champagne">official LOWKEY TECH Google Form</strong>. The organisers share the form link and deadline with registered teams.
            </p>
            <h3 className="label pt-2 text-muted">Submission checklist</h3>
            <List ordered items={SUBMISSION_CHECKLIST.map((s) => (<><strong className="font-medium text-champagne">{s.item}.</strong> <span className="text-muted">{s.detail}</span></>))} />
            <h3 className="label pt-2 text-muted">Submission deliverables (A, B, C)</h3>
            <div className="grid gap-px bg-[var(--rule)] sm:grid-cols-3">
              {SUBMISSION_DELIVERABLES.map((d) => (
                <div key={d.id} className="bg-ink py-6 sm:px-6 sm:first:pl-0">
                  <p className="label text-ember">{d.label} · {d.title}</p>
                  <p className="mt-2 text-[0.9375rem] text-muted">{d.format} · {d.spec}</p>
                  <ul className="mt-4 space-y-2 text-[0.9375rem] text-muted">
                    {d.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Note>
              The presentation video, AI-generated video and project document must be submitted through the Google Form. LinkedIn posting or tagging is not required, and LinkedIn posts are
              not official submissions. Before submitting, verify team details, document and video links, video permissions and the AI declaration, and keep your submission confirmation.
            </Note>
            <p className="text-muted">Late or incomplete submissions may be disqualified.</p>
          </Part>

          <Part id="ai" n={6} title="AI tools & pre-built work">
            <List items={AI_POLICY} />
            <h3 className="label pt-2 text-muted">Pre-built projects</h3>
            <p>{PREBUILT_POLICY}</p>
            <h3 className="label pt-2 text-muted">Intellectual property</h3>
            <p>{IP_POLICY}</p>
          </Part>

          <Part id="finale" n={7} title="The finale">
            <p>{MILESTONES[2].body}</p>
            <h3 className="label pt-2 text-muted">Facilities & support</h3>
            <List items={FACILITIES} />
            <h3 className="label pt-2 text-muted">What every team should be ready to present</h3>
            <List ordered items={FINALE_DELIVERABLES} />
            <h3 className="label pt-2 text-muted">What to bring</h3>
            <List items={BRING} />
            <Note>
              <strong className="font-medium text-champagne">Accommodation.</strong> {ACCOMMODATION}
            </Note>
            <p className="text-muted">
              Mentor interactions run through the event, with mentor hours extending up to 11:00 on the final day. The organisers coordinate overnight operations; the detailed run-of-show
              is shared separately.
            </p>
          </Part>

          <Part id="judging" n={8} title="Judging">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left">
                <thead>
                  <tr className="label text-muted">
                    <th scope="col" className="py-3 pr-4 font-medium">Criterion</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Weight</th>
                    <th scope="col" className="py-3 font-medium">What judges look for</th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map((c) => (
                    <tr key={c.name} className="border-t border-[var(--rule)] align-top">
                      <th scope="row" className="py-4 pr-4 font-normal">{c.name}</th>
                      <td className="py-4 pr-4 font-display text-2xl tabular">{c.weight}%</td>
                      <td className="py-4 text-muted">{c.looksFor}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-[var(--rule-strong)]">
                    <th scope="row" className="py-4 pr-4 font-normal">Total</th>
                    <td className="py-4 pr-4 font-display text-2xl tabular">100%</td>
                    <td className="py-4 text-muted">Overall product and startup potential.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted">
              Shortlisting follows the organisers’ evaluation process; the shortlist is scheduled for {MILESTONES[1].date}. Organisers may request clarification or a project demonstration.
              Evaluation and selection decisions are final.
            </p>
          </Part>

          <Part id="recognition" n={9} title="Recognition">
            <Note>
              <strong className="font-medium text-champagne">Prize pool: {RECOGNITION.prize.status}.</strong> {RECOGNITION.prize.note}
            </Note>
            <p>{RECOGNITION.certificates.online}</p>
            <p>{RECOGNITION.certificates.offline}</p>
            <p>{RECOGNITION.internships}</p>
            <p className="text-muted">
              {RECOGNITION.categoriesNote.replace('Possible categories — f', 'F')} Possible categories: {RECOGNITION.categories.join(', ')}.
            </p>
          </Part>

          <Part id="rules" n={10} title="Rules & policies">
            <h3 className="label text-muted">Conduct</h3>
            <List items={CONDUCT} />
            <h3 className="label pt-2 text-muted">Photos, videos and participant privacy</h3>
            <p>{PRIVACY_POLICY}</p>
            <h3 className="label pt-2 text-muted">Safety</h3>
            <p>Participants are responsible for their travel and personal belongings.</p>
          </Part>

          <Part id="faq" n={11} title="All questions">
            {FAQ.map((g) => (
              <div key={g.id} className="pt-2">
                <h3 className="label text-ember">{g.title}</h3>
                <dl className="mt-4 border-t border-[var(--rule)]">
                  {g.items.map((i) => (
                    <div key={i.q} className="border-b border-[var(--rule)] py-5">
                      <dt className="font-display text-xl leading-snug">{i.q}</dt>
                      <dd className="mt-2 text-muted">{i.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </Part>

          <Part id="contact" n={12} title="Contact">
            <dl className="grid gap-px bg-[var(--rule)] sm:grid-cols-2">
              <div className="bg-ink py-5 sm:pr-6">
                <dt className="label text-muted">Email</dt>
                <dd className="mt-2"><a href={`mailto:${CONTACT.email}`} className="link-line break-all">{CONTACT.email}</a></dd>
              </div>
              <div className="bg-ink py-5 sm:pl-6">
                <dt className="label text-muted">Phone / WhatsApp</dt>
                <dd className="mt-2"><a href={`tel:${CONTACT.phoneE164}`} className="link-line tabular">{CONTACT.phoneDisplay}</a></dd>
              </div>
            </dl>
            <p className="text-muted">{CONTACT.note}</p>
            <div className="pt-4 no-print">
              <TicketButton href={REGISTER_URL}>Register your team on Festora</TicketButton>
            </div>
          </Part>
        </article>
      </div>
    </div>
  );
}
