# The Reframed Valle OS Roadmap (Lean MVP)

## 1. Recent Accomplishments (The Rock-Solid Foundation)

- **Data Hygiene Pipeline:** Created `scripts/clean_db.py` to purge out-of-bounds locations, prune low-review experiences, and strip messy scraping artifacts from Google Maps data.
- **Smart Sorting:** Implemented a weighted algorithm (`rating * log10(reviewsCount + 10)`) to surface high-quality experiences securely.
- **Apple-Level UI/UX:** Built a cinematic, full-width frosted glass header, infinite scroll, and fixed layout overlaps. Achieved 0 Next.js linting errors.
- **Cost Control:** Enforced strict AI token limits (`maxTokens: 300`) to keep the Concierge profitable.

## 2. The Critical Pivots (Fixing Revenue Leaks in your Backlog)

- **The B2B Onboarding Pivot:** Your backlog mentioned "Payments... for local businesses claiming profiles." Delete this. We do NOT charge local businesses to join. B2B acquisition relies 100% on a free flow: they just upload their Yape QR code.
- **The Taxi Dispatch Pivot:** Your accomplishments mentioned "generates a 1-click WhatsApp booking link." Delete this. We must NEVER send tourists directly to WhatsApp to book a taxi. The AI must render a Generative UI card with a "Pay $15 with Apple Pay" button. We collect the USD via Stripe, and our backend triggers the WhatsApp notification to the driver.

## 3. The Immediate Backlog (The Next Sprints)

- **Infrastructure:** Setup Vercel deployment and Husky pre-commit hooks to protect the zero-error codebase.
- **RAG Integration & Generative UI:** Connect the Vercel AI SDK Concierge directly to the live Prisma database (killing dummy context). Refactor the Taxi tool to stream Apple Pay components instead of WhatsApp links.
- **Programmatic SEO (pSEO):** Generate `sitemap.ts` and `app/explore/[location]/[category]/page.tsx` using Prisma combinations to autonomously create 1,000+ Google landing pages.
- **The Deterministic Ghost Phone:** Build a simple, standalone Express/Node.js microservice using `whatsapp-web.js` (No LLMs). It will listen for webhooks from Next.js to send programmatic text alerts to local businesses and admin Yape payout alerts.
