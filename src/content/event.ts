/**
 * LOWKEY TECH 2026 — single source of truth for every fact shown on the site.
 *
 * Sources (supplied by the organisers, newest first; newer documents win):
 *   1. LOWKEY TECH 2026 — Event Information Guide (13 pp.)
 *   2. LOWKEY TECH 2026 — Online Round Participant Guide (6 pp.)
 *   3. Brochure + Hyderabad pitch deck (older drafts; used ONLY for the planned
 *      finale run-of-show, which is labelled as planned wherever it appears).
 *
 * Known conflicts resolved in favour of the newer guides:
 *   - Team size is 2–5 (older drafts said 3–5).
 *   - LinkedIn posting is NOT required; submissions go through the official
 *     Google Form (older drafts asked teams to post on LinkedIn).
 *   - The finale runs December 20–21 (older drafts: "proposed December 19", then "December 19–20").
 *   - The prize pool is TBA, with up to ₹1,00,000 planned subject to sponsorship.
 *   - The finale venue is Vanaam Retreat (older drafts: "Sri Sai Luxury Heaven Retreat").
 *   - The online round narrows to two missions — Small-Business Startup and Better City —
 *     in place of the earlier eight-track structure (older drafts listed eight tracks).
 *
 * Do not add facts here that are not in the organisers' documents.
 */

export const EVENT = {
  name: 'LOWKEY TECH',
  edition: '2026',
  fullName: 'LOWKEY TECH 2026',
  kind: 'Startup & AI Hackathon',
  tagline: ['Think Beyond Code.', 'Build Beyond Ideas.'] as const,
  summary:
    'A pan-India startup and AI hackathon where teams turn real-world problems into working products using AI-powered development, modern tools and creative execution.',
  challenge:
    'Build a useful product, not just a presentation. Identify a genuine problem, create a solution, demonstrate what it does and explain how it could grow into a startup.',
  openChallenge: {
    title: 'Build Your Own AI-Powered Startup.',
    body: 'Choose one of the two missions below and develop an innovative, functional solution. Your project must directly address the mission you select.',
  },
  reach: 'Build from anywhere in India. Shortlisted teams meet in Hyderabad.',
  city: 'Hyderabad',
  state: 'Telangana',
  /** Announced in the Online Round Guide; exact address is shared with shortlisted teams. */
  venue: 'Vanaam Retreat',
  /** Hyderabad city centre — an editorial detail, not the venue location. */
  coordinates: '17.3850° N · 78.4867° E',
} as const;

/** All instants are IST (UTC+05:30). */
export const MILESTONES = [
  {
    id: 'online',
    index: '01',
    label: 'Online Round',
    date: 'December 5–6, 2026',
    dayRange: ['05', '06'] as const,
    month: 'Dec',
    format: '48-hour online challenge',
    where: 'Remote · anywhere in India',
    start: '2026-12-05T00:00:00+05:30',
    end: '2026-12-07T00:00:00+05:30',
    body: 'Teams work remotely through a 48-hour challenge window: pick a mission, identify a problem, build or advance the solution, and submit through the official LOWKEY TECH Google Form.',
  },
  {
    id: 'shortlist',
    index: '02',
    label: 'Shortlist',
    date: 'December 16, 2026',
    dayRange: ['16'] as const,
    month: 'Dec',
    format: 'Qualified teams announced',
    where: 'Announced by the organisers',
    start: '2026-12-16T00:00:00+05:30',
    end: '2026-12-17T00:00:00+05:30',
    body: 'Judges evaluate submissions against the published criteria. Organisers may request clarification or a project demonstration before the shortlist is announced.',
  },
  {
    id: 'finale',
    index: '03',
    label: 'Offline Grand Finale',
    date: 'December 20–21, 2026',
    dayRange: ['20', '21'] as const,
    month: 'Dec',
    format: '24-hour in-person build',
    where: 'Hyderabad, Telangana',
    start: '2026-12-20T00:00:00+05:30',
    end: '2026-12-22T00:00:00+05:30',
    body: 'Shortlisted teams come together for a 24-hour startup-building experience: continue building, receive mentorship, prepare final demonstrations and pitch to the judging panel.',
  },
] as const;

export const FEES = {
  currency: 'INR',
  online: {
    amount: 299,
    platformFee: 6,
    label: 'Online Round',
    note: 'Per participant + ₹6 Festora platform fee · paid at registration',
  },
  finale: {
    amount: 699,
    label: 'Offline Grand Finale',
    note: 'Per participant · additional fee for shortlisted participants attending offline',
  },
  rules: [
    'All fees are per participant.',
    'The offline fee is an additional payment and is not included in the online registration fee.',
    'Registration fees are strictly non-refundable and non-transferable.',
    'Registration is confirmed only after successful payment verification through the official process.',
  ],
  /** From FAQ 10 of the Event Guide. */
  finaleCovers: [
    'Participation',
    'Workspace',
    'Wi-Fi',
    'Meals & snacks',
    'Refreshments',
    'Certificate',
    'Goodies',
    'Mentorship',
    'Networking',
  ],
} as const;

export const TEAM = {
  min: 2,
  max: 5,
  rules: [
    'Teams of 2 to 5 members. Two-member teams are allowed.',
    'Team-only registration — solo entries are not allowed.',
    'Team composition stays the same across the online and offline rounds.',
    'Any exceptional member change needs prior approval from the organising team.',
    'Participants may register from any state or union territory in India.',
  ],
} as const;

export const PRINCIPLES = [
  { title: 'AI-enabled building', body: 'Use AI assistants and modern development tools throughout your workflow.' },
  { title: 'Vibe Coding is allowed', body: 'Teams may use AI-powered coding platforms and workflows.' },
  { title: 'Startup mindset', body: 'Focus on user problems, product value, business potential and scalability.' },
  { title: 'Creative freedom', body: 'Pick the mission closest to your idea, then solve a real problem — not just describe one.' },
  { title: 'Mentorship & exposure', body: 'Learn from mentors and present your product to the judging panel.' },
  { title: 'Pan-India participation', body: 'The online round is open to teams from all Indian states and union territories.' },
] as const;

export const AUDIENCE = [
  'College students & student innovators',
  'Developers, programmers & AI builders',
  'UI/UX designers & product thinkers',
  'Aspiring startup founders & entrepreneurs',
  'AI enthusiasts, creators & problem-solvers',
] as const;

export type MissionId = 'startup' | 'city';

/**
 * Round 1 narrows to exactly two missions — each team selects ONE and its
 * project must directly address it. Replaces the earlier eight-track list.
 */
export const MISSIONS: ReadonlyArray<{ id: MissionId; index: string; name: string; tagline: string; body: string }> = [
  {
    id: 'startup',
    index: '01',
    name: 'Small-Business Startup',
    tagline: 'Help shops, vendors, small businesses, and independent workers operate smarter.',
    body: 'Build a practical digital solution that helps local shops, small businesses and independent vendors operate more efficiently — through inventory, billing, payments, customers and market access.',
  },
  {
    id: 'city',
    index: '02',
    name: 'Better City',
    tagline: 'Improve mobility, waste, water, energy, public services, and everyday urban life.',
    body: `Build a technology-driven solution that improves everyday urban life and addresses real-world challenges in ${EVENT.city}.`,
  },
];

export const MISSION_TEST = 'Core test: solve a real problem — not just describe one.';
export const MISSION_FLOW = ['Problem', 'Idea', 'MVP', 'Pitch'] as const;

/** Weights sum to 100. Order follows the Event Guide. */
export const CRITERIA = [
  { name: 'AI-First Execution', weight: 25, looksFor: 'Meaningful use of AI in ideation, research, design, coding and development.' },
  { name: 'Product Innovation', weight: 20, looksFor: 'Originality, creativity and relevance to a real problem.' },
  { name: 'Functionality & Execution', weight: 20, looksFor: 'Working features, usability, technical implementation and overall execution.' },
  { name: 'Market Potential', weight: 15, looksFor: 'Target users, market need, business model and scalability.' },
  { name: 'AI Usage & Workflow', weight: 10, looksFor: 'Effective use of AI tools, agents, prompts and Vibe Coding workflows.' },
  { name: 'Demo & Pitch', weight: 10, looksFor: 'Demo quality, storytelling, clarity and communication.' },
] as const;

export const SUBMISSION_CHECKLIST = [
  { item: 'Project title & team details', detail: 'Project name and details of every team member.' },
  { item: 'Selected mission', detail: 'Small-Business Startup or Better City — your project must directly address it.' },
  { item: 'Problem statement', detail: 'What issue are you addressing, and who experiences it?' },
  { item: 'Proposed solution', detail: 'Explain how your product solves the problem.' },
  { item: 'Project document', detail: 'Objectives, target users, key features, workflow, technology stack, implementation details, expected impact and business potential.' },
  { item: 'Presentation video', detail: 'A clear video presentation in English, submitted as instructed in the Google Form.' },
  { item: 'AI-generated video', detail: 'A 10-second AI-generated showcase video, with the AI tool used declared.' },
  { item: 'GitHub / repository link', detail: 'If available.' },
  { item: 'Working demo or deployment link', detail: 'Prototype or deployment link, if available.' },
  { item: 'AI usage declaration', detail: 'List the AI tools and platforms used and explain how they contributed.' },
] as const;

/**
 * Round 1 submission deliverables (A, B, C), per the Round 1 submission
 * guidelines. Deliverable C (the AI-generated video) is new to this round.
 */
export const SUBMISSION_DELIVERABLES = [
  {
    id: 'presentation',
    label: 'A',
    title: 'Project Presentation',
    format: 'PPT / PDF',
    spec: '8–12 slides',
    items: [
      'Problem statement',
      'Proposed solution',
      'Target users or audience',
      'Key features',
      'AI integration and its purpose',
      'Technology stack',
      'Business model or potential impact',
      'Prototype screenshots or product workflow',
      'Future scope',
    ],
  },
  {
    id: 'video',
    label: 'B',
    title: 'Video Presentation',
    format: 'Video Pitch & Demo',
    spec: '3–5 minutes',
    items: [
      'Duration: 3–5 minutes.',
      'Language: English.',
      'Must explain the problem, solution, product functionality, AI implementation and expected impact.',
      'Include a prototype or product demonstration wherever possible.',
      'Ensure clear audio and understandable visuals.',
    ],
  },
  {
    id: 'ai-video',
    label: 'C',
    title: 'AI-Generated Video',
    format: 'AI Showcase Video',
    spec: 'Exactly 10 seconds',
    items: [
      'Duration: exactly 10 seconds.',
      'Must be generated using an AI video-generation tool (e.g. Runway, Kling, Luma, Sora, Hailuo, Pika).',
      'Should creatively showcase your startup concept, product vision, problem or expected impact.',
      'Any AI video-generation platform may be used.',
      'Mandatory: mention the AI tool used in your submission.',
    ],
  },
] as const;

export const FINALE_DELIVERABLES = [
  'A working product or functional prototype',
  'Project documentation — problem, solution and implementation',
  'GitHub repository or source code, where applicable',
  'Live deployment or a working demonstration',
  'Pitch deck — problem, solution, users, product, business model and scalability',
  'AI usage declaration — tools, platforms and AI-assisted workflows',
] as const;

export const AI_POLICY = [
  'AI coding assistants, generative AI tools, AI agents and Vibe Coding platforms are allowed.',
  'External APIs, third-party services and paid AI tools are permitted.',
  'Teams are responsible for their own paid subscriptions, API usage and related costs.',
  'Teams should be transparent about AI-generated or AI-assisted components in their AI usage declaration.',
] as const;

export const PREBUILT_POLICY =
  'Pre-built projects and previously developed components are allowed, but teams must demonstrate substantial new work, meaningful improvements or additional features relevant to the challenge. Previously developed components must be clearly disclosed, and teams should be ready to explain what was built or improved during the hackathon.';

export const IP_POLICY =
  'Participants retain ownership of their original ideas, source code, designs and other intellectual property. LOWKEY TECH does not claim ownership of participant projects.';

export const FACILITIES = [
  'Dedicated workspace for participating teams',
  'Wi-Fi / internet access at the venue',
  'Meals, snacks, refreshments & beverages',
  'Mentorship from invited mentors & industry professionals',
  'Pitching & presentation arrangements',
  'Participation certificates & event goodies',
  'Networking with founders, mentors, judges & other teams',
] as const;

export const BRING = [
  'Laptop and charger',
  'Valid college or government-issued ID',
  'Mobile phone and charger',
  'Any adapters, accessories or development equipment you need',
] as const;

export const ACCOMMODATION =
  'Regular student accommodation is not provided. In an emergency, the organising team may try to arrange temporary assistance, subject to availability. Please plan your own travel and stay.';

/**
 * Planned finale arc, condensed from the brochure's draft schedule.
 * The Event Guide states the detailed run-of-show is shared separately with
 * shortlisted teams — this is always labelled "planned" in the UI.
 * Times are 24h clock, finale starts 11:00 on Dec 20 and ends 11:00 on Dec 21.
 */
export const FINALE_ARC = [
  { from: '11:00', to: '13:00', title: 'Arrival & inauguration', detail: 'Registration, ID verification, welcome kits, inauguration and a guest talk on AI, startups and entrepreneurship.' },
  { from: '13:00', to: '15:00', title: 'Briefing & validation', detail: 'Challenge briefing, rules and judging criteria, lunch, then team planning and problem validation.' },
  { from: '15:00', to: '23:00', title: 'Development sprints', detail: 'Build sprints with mentor office hours and technical mentoring, a progress checkpoint and dinner.' },
  { from: '23:00', to: '05:00', title: 'The overnight build', detail: 'Overnight refreshments, AI integration, coding and debugging, a final development sprint.' },
  { from: '05:00', to: '06:30', title: 'Test & submit', detail: 'Testing, pitch deck and demo preparation, and final project submissions.' },
  { from: '06:30', to: '09:30', title: 'Judging & pitches', detail: 'Preliminary judging by parallel panels, finalists announced, finalist pitches and live demos.' },
  { from: '09:30', to: '11:00', title: 'Results & closing', detail: 'Results and announcements, certificates and recognition, closing ceremony.' },
] as const;

export const RECOGNITION = {
  prize: {
    status: 'TBA',
    upTo: 100000,
    note: 'Prize money of up to ₹1,00,000 is planned. The final prize pool, distribution, winner categories and any additional rewards will be announced after sponsorships are finalised.',
  },
  certificates: {
    online: 'Online-round participants are eligible for an official digital participation certificate (E-Certificate), subject to participation and submission requirements.',
    offline: 'Offline participants are eligible for an official event participation certificate, subject to attendance and event requirements.',
  },
  internships:
    'Internship opportunities may be offered to eligible and outstanding participants from both rounds, subject to performance, evaluation, partner availability and selection processes. Internships are not guaranteed.',
  categories: [
    'Best AI Implementation',
    'Best Startup Idea',
    'Most Innovative Solution',
    'Best Business Potential',
    'Best Product Execution',
    'Special Jury Recognition',
  ],
  categoriesNote: 'Possible categories — final categories are subject to organiser and sponsor confirmation.',
} as const;

export const CONDUCT = [
  'Provide accurate registration and submission information.',
  'Submit original work, and disclose pre-built work, third-party resources and AI-assisted components.',
  'Respect intellectual property, privacy, confidentiality and the rights of others.',
  'Do not submit harmful, illegal, deceptive or unsafe applications.',
  'Late, incomplete, misleading or unverifiable submissions may be rejected or disqualified.',
  'Organisers may request additional information or a demonstration to verify project work.',
  'Respect other teams, mentors, judges, venue staff and event rules.',
] as const;

export const PRIVACY_POLICY =
  'Participant photographs, videos, interviews and project demonstrations will not be used for promotional or marketing purposes by default. Any external sharing or promotional use of identifiable participant content requires explicit consent from the relevant participants.';

export const CONTACT = {
  email: 'saivathan02@gmail.com',
  phoneDisplay: '+91 63034 40601',
  phoneE164: '+916303440601',
  note: 'The Google Form link, deadlines, shortlist, venue instructions and updates come through official LOWKEY TECH communications. If information changes, the latest official organiser announcement applies.',
} as const;

export const DOWNLOADS = [
  { label: 'Event Information Guide', href: '/guides/lowkey-tech-2026-event-guide.pdf', size: '53 KB', pages: 13 },
  { label: 'Online Round Participant Guide', href: '/guides/lowkey-tech-2026-online-round-guide.pdf', size: '40 KB', pages: 6 },
] as const;
