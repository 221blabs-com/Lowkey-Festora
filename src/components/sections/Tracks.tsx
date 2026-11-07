import { EVENT, TRACKS } from '@/content/event';
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
          label="Tracks"
          title={['Eight tracks.', <span key="b" className="text-ember">One open door.</span>]}
          aside={<>Pick the track closest to your problem — or bring an idea from any other domain through Open Innovation. You are not restricted to a single prescribed problem statement.</>}
        />

        <ol className="mt-16 border-t border-[var(--rule-strong)] lg:mt-24">
          {TRACKS.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 4) * 0.04} className="group relative border-b border-[var(--rule)]">
              <div aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-oxblood transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-y-100" />
              <div className="relative grid grid-cols-[2.5rem_1fr_3rem] items-center gap-x-4 gap-y-2 py-6 sm:grid-cols-[3.5rem_1fr_3.5rem] lg:grid-cols-12 lg:gap-x-8 lg:py-8">
                <span className="label text-muted tabular lg:col-span-1">{t.index}</span>
                <h3 className="font-display text-[clamp(1.625rem,3.4vw,3.25rem)] leading-[1.02] tracking-[-0.015em] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 lg:col-span-6">
                  {t.name}
                </h3>
                <TrackGlyph id={t.id} className="col-start-3 row-start-1 h-10 w-10 justify-self-end text-sand transition-colors duration-500 group-hover:text-ember lg:col-span-1 lg:col-start-12 lg:h-12 lg:w-12" />
                <p className="col-span-2 col-start-2 max-w-[44ch] text-muted lg:col-span-4 lg:col-start-8 lg:row-start-1">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-16 grid-12 gap-y-6 lg:mt-24 items-end">
          <p className="label col-span-12 text-ember lg:col-span-3">The open challenge</p>
          <p className="col-span-12 font-display text-h3 lg:col-span-5">{EVENT.openChallenge.title}</p>
          <p className="col-span-12 text-muted lg:col-span-4">{EVENT.openChallenge.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
