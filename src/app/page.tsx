import { Hero } from '@/components/sections/Hero';
import { Brief } from '@/components/sections/Brief';
import { Journey } from '@/components/sections/Journey';
import { Tracks } from '@/components/sections/Tracks';
import { Judging } from '@/components/sections/Judging';
import { Finale } from '@/components/sections/Finale';
import { Recognition } from '@/components/sections/Recognition';
import { Passes } from '@/components/sections/Passes';
import { Faq } from '@/components/sections/Faq';
import { Closing } from '@/components/sections/Closing';
import { EVENT, FEES, MILESTONES } from '@/content/event';
import { REGISTER_URL, SITE_URL } from '@/lib/config';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: EVENT.fullName,
  description: EVENT.summary,
  startDate: MILESTONES[0].start,
  endDate: '2026-12-20T11:00:00+05:30',
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  url: SITE_URL,
  location: [
    { '@type': 'VirtualLocation', url: SITE_URL },
    {
      '@type': 'Place',
      name: `${EVENT.venue}, ${EVENT.city}`,
      address: { '@type': 'PostalAddress', addressLocality: EVENT.city, addressRegion: EVENT.state, addressCountry: 'IN' },
    },
  ],
  offers: [
    { '@type': 'Offer', name: FEES.online.label, price: FEES.online.amount, priceCurrency: 'INR', url: REGISTER_URL },
    { '@type': 'Offer', name: FEES.finale.label, price: FEES.finale.amount, priceCurrency: 'INR', url: REGISTER_URL, eligibleCustomerType: 'Shortlisted participants' },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Brief />
      <Journey />
      <Tracks />
      <Judging />
      <Finale />
      <Recognition />
      <Passes />
      <Faq compact />
      <Closing />
    </>
  );
}
