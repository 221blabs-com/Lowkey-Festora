import { MISSION_FLOW, MISSION_TEST, MISSIONS } from '@/content/event';
import { SectionHead } from '@/components/ui/SectionHead';
import { Reveal } from '@/components/ui/Reveal';
import { TrackGlyph } from '@/components/glyphs/TrackGlyph';

export function Tracks() {
  return (
    <section id="tracks" aria-labelledby="tracks-title" className="section-y relative">
      <div className="shell">
        <SectionHead
          id="tracks-title"
          index="03"
          label="Missions"
          title={['Two missions.', <span key="b" className="text-ember">One goal.</span>]}
          aside={<>Each team selects ONE mission for the online round, and the project must directly address it. Build what matters.</>}
        />

        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-[var(--rule-strong)] pt-10 lg:mt-24 lg:grid-cols-2 lg:gap-10">
          {MISSIONS.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.08} className="group relative border border-[var(--rule-strong)] p-[clamp(1.5rem,3vw,2.5rem)]">
              <div className="flex items-start justify-between gap-4">
                <span className="label text-ember">Mission {m.index}</span>
                <TrackGlyph id={m.id} className="h-10 w-10 text-sand transition-colors duration-500 group-hover:text-ember" />
              </div>
              <h3 className="mt-6 font-display text-[clamp(1.875rem,3.4vw,2.75rem)] leading-[1.02] tracking-[-0.015em]">{m.name}</h3>
              <p className="mt-4 max-w-[48ch] text-muted">{m.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 grid-12 gap-y-6 lg:mt-24 items-end">
          <p className="label col-span-12 text-ember lg:col-span-3">{MISSION_TEST}</p>
          <p className="col-span-12 flex flex-wrap items-center gap-x-3 gap-y-2 label text-muted lg:col-span-6 lg:col-start-7 lg:justify-end">
            {MISSION_FLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                {i > 0 ? <span aria-hidden>→</span> : null}
                {step}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
