# LOWKEY TECH 2026 — on Festora

The complete Festora ticketing experience for **LOWKEY TECH 2026** (Startup & AI Hackathon), a 221B Labs product. It covers the event site, team registration, Razorpay payments, QR tickets, email, and an admin console at `/admin.html`.

**Price:** ₹299 per participant + ₹6 Festora platform fee = **₹305 per ticket**. Teams are 2–5 people, so a team of 4 pays ₹1,220. The server always computes the amount itself; the browser never sets it.

## How it works

```
/register ──POST /api/register──▶ validate team → Firestore (status: created) → Razorpay order
    │
    └─ Razorpay Checkout (UPI / cards / netbanking)
         ├─ success ─POST /api/register/verify─▶ verify HMAC signature + amount with Razorpay
         │                                        → status: paid → tickets + receipt + admin email (exactly once)
         │                                        → /register/success
         └─ failed / closed ─POST /api/register/failed─▶ status: failed → "payment not completed" email
                                                        → /register/failed
Razorpay webhook → /api/razorpay/webhook  (payment.captured / payment.failed)
  Safety net: confirms payments even if the buyer closes the tab. Late captures
  upgrade failed → paid. A paid registration is never downgraded.
```

- **Tickets:** each member gets a personal ticket `LT26-XXXXXX` with a QR code linking to `/ticket/[id]?t=<signed token>`.
- **Emails** (Resend, from `festora@221blabs.com`):
  - the leader gets the receipt and their own ticket;
  - every other member gets their own ticket;
  - the admin gets a notification;
  - a failed payment triggers a "payment not completed" email.
- **Admin** (`/admin.html`): sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
  - Live stats: teams, participants, collected, ticket revenue, platform fees, check-ins.
  - Search and filters.
  - Per-team details.
  - Resend tickets.
  - Check-in desk: type a ticket ID or scan its QR link.
  - CSV export: one row per participant.
- **Data:** Firestore collection `lowkey_tech_2026_registrations`, the same Firebase that Festora uses.

## Deploy on Vercel

1. Import the repo in Vercel (framework: Next.js). There are no build settings to change.
2. Add every variable from `.env.example` under **Settings → Environment Variables**.
3. **Razorpay:**
   - Add the API keys.
   - Create a webhook at `https://YOUR-DOMAIN/api/razorpay/webhook` for the `payment.captured` and `payment.failed` events. Use the same secret as `RAZORPAY_WEBHOOK_SECRET`.
4. **Firebase:**
   - Create a Firestore database.
   - Generate a service-account key (Project settings → Service accounts).
   - Copy `project_id`, `client_email` and `private_key` into the variables.
5. **Resend:** verify the `221blabs.com` domain and add the API key.
6. Deploy, then make a test payment with `rzp_test_` keys. Switch to `rzp_live_` keys once Razorpay activates your account.

```bash
npm install
npm run dev        # http://localhost:3000  (needs .env.local)
npm run build && npm start
npm run lint && npm run typecheck
```

## Where things live

| Path | What |
| --- | --- |
| `src/content/event.ts` | **Single source of truth** for every fact, taken from the organisers' guides. Conflicts between documents are resolved there, in favour of the newer guides. |
| `src/content/faq.ts` | FAQs merged from both guides |
| `src/components/ticket/` | 3D ticket: procedural print art (`ticketArt.ts`), the three.js scene, and the poster/fallback stage |
| `src/components/sections/` | Home page sections §01–§09 |
| `src/app/guide/` | Full participant guide (printable) |
| `src/app/register/`, `src/components/register/` | Registration form, Razorpay Checkout, success & failed pages |
| `src/app/api/` | Register / verify / failed, Razorpay webhook, admin APIs |
| `src/lib/server/` | Firestore store, Razorpay REST, Resend mail templates, ticket signing, admin auth |
| `src/app/admin/`, `src/components/admin/` | Admin console (served at `/admin.html`) |
| `src/lib/pricing.ts` | ₹299 ticket + ₹6 platform fee |
| `src/app/globals.css` | Design system: tokens, type roles, notch/perforation shapes |
| `public/brand/` | Festora assets. The mark is festora-v1's `logo.png` (trimmed). The wordmark was keyed out of the supplied lockup; its letterforms are untouched. |

## Design notes

- **Palette** is sampled from the supplied lockup: oxblood `#2A0D13`, crimson `#96182A`, champagne `#E8D0A8`. Text pairs pass WCAG AA. Brand crimson is used only for fills and large type on dark; `#E0485A` carries crimson text.
- **Type:** Marcellus is Festora's display serif. Satoshi is reused from festora-v1. IBM Plex Mono sets ticket data. Tiny single-glyph ₹ subsets supply the rupee sign, which none of those three families contains.
- **Signature shape:** the semicircular notch from the Festora mark. It appears in buttons, pass stubs, the journey perforations and the 3D ticket.
- **3D ticket:** canvas-painted textures with packed roughness/metalness maps, so foil stamping catches light. The stub carries a real QR code to the Festora registration page. The back's barcode is the judging weights. A poster rendered from the scene gives instant LCP and serves as the no-WebGL fallback. Rendering pauses off-screen, and reduced motion is respected throughout.
- The finale dial shows the **planned** run-of-show from the brochure. It is labelled as planned because the Event Guide says the final schedule goes to shortlisted teams.

Fonts: Marcellus, IBM Plex Mono, Noto Serif and Inter are OFL; Satoshi is FFL. Licences are in `src/fonts/`.
