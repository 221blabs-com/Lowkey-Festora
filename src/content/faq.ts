/**
 * Questions merged from the Event Guide (18 FAQs) and the Online Round Guide,
 * de-duplicated and grouped by what a participant is trying to decide.
 * Answers are the organisers' wording, lightly condensed.
 */
export type FaqGroup = {
  id: string;
  title: string;
  items: ReadonlyArray<{ q: string; a: string }>;
};

export const FAQ: ReadonlyArray<FaqGroup> = [
  {
    id: 'joining',
    title: 'Joining',
    items: [
      {
        q: 'Is LOWKEY TECH open to participants across India?',
        a: 'Yes. Teams from all Indian states and union territories can join the online round. Shortlisted teams must attend the offline finale in Hyderabad.',
      },
      {
        q: 'Who can participate?',
        a: 'Students, aspiring founders and developers from anywhere in India.',
      },
      {
        q: 'Can I register alone?',
        a: 'No. Solo registrations are not allowed — register as a team of 2–5 members. Two-member teams are permitted.',
      },
      {
        q: 'Can team members change after Round 1?',
        a: 'The same team is expected to continue to the finale. Changes need exceptional approval from the organisers.',
      },
    ],
  },
  {
    id: 'building',
    title: 'Building',
    items: [
      {
        q: 'Can we choose any problem?',
        a: 'Yes. Choose one of the listed tracks or use Open Innovation, provided your project addresses a genuine problem.',
      },
      {
        q: 'Is Vibe Coding allowed? Can we use ChatGPT or other AI tools?',
        a: 'Yes. Vibe Coding, AI coding assistants, AI agents and other AI-powered development tools are permitted — declare their use in your AI usage declaration.',
      },
      {
        q: 'Can we use paid AI tools and external APIs?',
        a: 'Yes. Teams may use paid tools, external APIs and third-party platforms. Any related costs are the team’s responsibility.',
      },
      {
        q: 'Are pre-built projects allowed?',
        a: 'Yes, provided substantial new work or meaningful improvements are demonstrated and previously developed components are disclosed.',
      },
      {
        q: 'Who owns our project?',
        a: 'You do. Participants retain ownership of their original ideas, code, designs and intellectual property.',
      },
    ],
  },
  {
    id: 'submitting',
    title: 'Submitting',
    items: [
      {
        q: 'What must the online submission contain?',
        a: 'Team and project details, selected track, problem statement, proposed solution, project document, an English presentation video, available repository/demo links and an AI usage declaration.',
      },
      {
        q: 'How do we submit? Do we need to post on LinkedIn?',
        a: 'Submit through the official LOWKEY TECH Google Form — the organisers will share its link. LinkedIn posting or tagging is not required, and LinkedIn posts are not official submissions.',
      },
      {
        q: 'What language should the video use?',
        a: 'English.',
      },
      {
        q: 'Is GitHub compulsory?',
        a: 'Include a repository link if available. A demo or prototype link is also welcome if available.',
      },
      {
        q: 'When will shortlisted teams be announced?',
        a: 'December 16, 2026.',
      },
      {
        q: 'What if I have a submission issue?',
        a: 'Contact the organisers promptly, preferably before the submission deadline.',
      },
    ],
  },
  {
    id: 'finale',
    title: 'The finale',
    items: [
      {
        q: 'When and where is the finale?',
        a: 'December 19–20, 2026 in Hyderabad, at Sri Sai Luxury Heaven Retreat. The exact address and on-ground reporting instructions are shared with shortlisted teams.',
      },
      {
        q: 'What does the offline fee cover?',
        a: 'The ₹699 per-person fee covers participation, workspace, Wi-Fi, meals, snacks, refreshments, certificate, goodies, mentorship and networking opportunities, subject to the final event arrangements.',
      },
      {
        q: 'Is accommodation included?',
        a: 'No regular student accommodation is provided. Emergency assistance may be arranged subject to availability.',
      },
    ],
  },
  {
    id: 'money',
    title: 'Fees & rewards',
    items: [
      {
        q: 'What is the online fee? Does it include the finale?',
        a: '₹299 per participant for Round 1. It does not include the finale — shortlisted participants attending in person pay an additional ₹699 per person.',
      },
      {
        q: 'Are fees refundable?',
        a: 'No. Registration fees are non-refundable and non-transferable.',
      },
      {
        q: 'What is the prize pool?',
        a: 'Prize Pool: TBA. Prize money of up to ₹1,00,000 is planned; final details follow sponsor finalisation. It is not a confirmed guaranteed award.',
      },
      {
        q: 'Will online participants receive an E-Certificate?',
        a: 'Yes, subject to participation and submission requirements.',
      },
      {
        q: 'Are internships guaranteed?',
        a: 'No. Opportunities may be offered to eligible and outstanding participants based on performance and availability.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    items: [
      {
        q: 'Will our photos or videos be used for promotion?',
        a: 'Not by default. External sharing or promotional use of identifiable participant content requires explicit consent.',
      },
    ],
  },
];
