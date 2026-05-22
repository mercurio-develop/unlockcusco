# Plan: Freemium Traveler Pass & Multiple Itineraries

> **STATUS: DRAFT FOR FUTURE REFERENCE.**
> *This plan is documented for future implementation. Do not execute these steps at this time.*

## Objective
Implement a "Freemium Traveler Pass" model where users can save 1 itinerary for free. To save multiple itineraries, access offline mode, and get premium AI features, they must purchase a $20 one-time pass.

## 1. Database Schema Updates (Prisma)
- **Update `User` Model**:
  - Add `isPremium Boolean @default(false)`
  - Add `stripeCustomerId String? @unique`
  - Add `premiumUnlockedAt DateTime?`
- *Run `npx prisma db push` and `npx prisma generate`.*

## 2. Stripe Checkout Integration
- **Product Setup**: Create a "Sacred Valley Traveler Pass" ($20 one-time payment) product in Stripe.
- **Checkout Route (`/api/checkout/route.ts`)**:
  - Create a Stripe Checkout Session for the currently authenticated Supabase user.
  - Pass the user's `id` in the `client_reference_id` or `metadata`.
- **Webhook Route (`/api/webhooks/stripe/route.ts`)**:
  - Listen for `checkout.session.completed`.
  - Look up the user by ID and update their `isPremium` flag to `true`.

## 3. Backend Enforcement (Itinerary & AI API)
- **Itinerary Limits (`/api/itineraries/save/route.ts`)**:
  - Authenticate the user via Supabase.
  - Fetch the user's `isPremium` status and their current `SavedItinerary` count.
  - **Logic**: 
    - If `!isPremium` and `count >= 1`, return a `403 Forbidden` with a `{ requiresUpgrade: true }` flag.
    - Otherwise, allow saving/creating the itinerary.
- **AI / Gemini Usage Limits (`/api/chat/route.ts`)**:
  - Implement Rate Limiting using Upstash Redis.
  - **Cost Calculation (Gemini 2.5 Flash)**:
    - Input: ~$0.075 per 1M tokens. Output: ~$0.30 per 1M tokens.
    - Average interaction (3000 input + 500 output tokens) = **~$0.000375 per message**.
    - For $1, we can serve ~2,666 messages. A user sending 1,000 messages during their trip costs us **$0.37**. Thus, the $20 fee provides a >98% gross margin on AI costs.
  - **Free Users**: Limited to **15 AI queries per day** to let them try the concierge, then prompt them to upgrade to the Traveler Pass.
  - **Premium Users**: Unlimited access, governed by a "fair use" safeguard of **200 queries per day** to prevent bot/scraping abuse.

## 4. UI / UX Updates
- **Profile / Header**:
  - Show a "Traveler Pass: Pro" badge for premium users.
  - Show an "Upgrade to Pro" button for free users.
- **Save Itinerary Flow**:
  - When the user clicks "Save" in the Day Builder, attempt to save.
  - If the API returns `requiresUpgrade`, open a beautiful **Upgrade Modal** (using Radix/Shadcn dialog).
  - The modal explains the benefits: Unlimited Itineraries, Offline Maps (PWA support), Priority Concierge.
  - "Pay $20 with Stripe" button redirects to the checkout session.
- **Saved Itineraries Dashboard (`/itineraries`)**:
  - Build a page where users can view all their saved trips.
  - If free, show 1 trip and a locked placeholder for "Create New Trip" that triggers the upgrade modal.

## Verification
- Test saving 1 itinerary as a free user (Success).
- Test saving a 2nd itinerary as a free user (Blocked -> Modal).
- Test completing a test Stripe payment -> Webhook fires -> User becomes Premium.
- Test saving unlimited itineraries as Premium (Success).
