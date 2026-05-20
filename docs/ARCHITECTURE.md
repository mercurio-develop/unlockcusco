# UnlockCusco — System Architecture

## What is UnlockCusco?

UnlockCusco is a travel platform for the Sacred Valley of the Incas (Cusco region, Peru). It connects tourists with verified local businesses — restaurants, hotels, spas, adventure tours, taxi drivers — via AI-assisted trip planning and direct WhatsApp contact.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| AI | Gemini 2.5 Flash via AI SDK v6 (`@ai-sdk/google`) |
| Caching | Upstash Redis (KV) |
| Payments | Stripe |
| Messaging | Ghost Phone microservice (WhatsApp Web) + Twilio (production) |
| Analytics | PostHog |
| Rate limiting | Upstash Ratelimit |

---

## Key Routes

```
/                        Landing page
/explore                 Business discovery + AI Concierge
/explore/[loc]/[cat]     Filtered by location + category
/explore/machu-picchu    Machu Picchu hub page
/business/[slug]         Individual business profile
/pro                     Pro Builder workspace (agency/guide tool)
/agencies                Agency directory
/agencies/[slug]         Agency mini-site
/services/restaurants    Restaurant listing
/services/lodging        Lodging listing
/claim/[id]              Business claim flow
/dashboard               Business owner dashboard
```

## Key API Routes

```
POST /api/chat              AI Concierge (streamText with Gemini)
GET  /api/businesses        Business search (delegates to fetchBusinesses)
POST /api/whatsapp          Incoming WA verification webhook
POST /api/experiences/[id]  Experience booking
GET  /api/machu-picchu/scrape  Machu Picchu data scraper
GET  /api/cron/*            Automated background tasks (see docs/CRON_JOBS.md)
```

---

## Core Data Model

```
Business
├── id, slug, name, category
├── locationSlug           ("urubamba", "pisac", "machu-picchu", ...)
├── lat, lng               (GPS coordinates)
├── whatsapp               (9-digit number, no country code)
├── isClaimed              (owner verified via WA reply or claim flow)
├── isAsociado             (paid partner — unlocks "Book" button)
├── isFeatured
├── rating, reviewsCount, instagramFollowers
├── description            (Zagat-style AI-generated from reviews)
├── tagline, specialties
├── priceTier              ("$" | "$$" | "$$$")
├── serviceZones           (JSON array — for TRANSPORT/GUIDE businesses)
└── whatsappClicksCount

TourPackage (multi-day trips, day tours)
├── title, description, heroImage
├── basePriceUsd, sector, tags
└── business (relation → Business)

Trip (builder workspaces)
├── isVerifiedTemplate
└── days → TripDay → TimelineEvent

Review
└── business (relation), text, rating
```

### Location slugs in DB
`cusco`, `urubamba`, `pisac`, `machu-picchu`, `ollantaytambo`, `calca`, `chinchero`, `maras`, `yucay`

### Category values in DB (mixed case — always query case-insensitively)
`DINING`, `Dining` | `STAYS`, `Stays` | `WELLNESS` | `CULTURE`, `Culture` | `ADVENTURE` | `TRANSPORT` | `AGENCY` | `TEXTILES` | `BOLETO` | `Tourist Ticket`

---

## Global State

Two React contexts wrap the app:

**`PreferencesContext`** (`src/lib/store/preferences-context.tsx`)
- `isChatOpen` — concierge panel visibility
- `targetDate` — planning date (set by PlanningDatePicker)
- `travelVibe`, `travelIntensity` — psychographic profile
- `isMapPicking` — map click mode for anchor selection

**`TripContext`** (`src/lib/store/trip-context.tsx`)
- `activeItinerary` — current `OptimizedPlan` (day plan from AI)
- `currentTrip` — `UniversalTrip` (builder workspace data)
- `panelMode` — `"categories" | "itinerary" | "macro" | "builder"`
- `activeDayNumber` — which day is shown in the day view
- Sync: `activeItinerary.waypoints` → `currentTrip.days[n].events` on every change

---

## Data Flow: Tourist Experience

```
Tourist opens /explore
  → ExploreMap renders business pins from fetchBusinesses()
  → AI Concierge opens (chat panel)
  → Tourist types "find a restaurant"
  → Route: POST /api/chat
  → Gemini calls searchDatabase tool
  → Results shown in SearchResultsCard
  → Tourist picks one → mutateItinerary(SET_END)
  → Day View tab auto-activates with endpoint set
  → Tourist contacts business via WhatsApp button (if isClaimed)
```

---

## Coordinate Reference

```typescript
// src/lib/constants.ts — COORDS_MAP
urubamba:       { lat: -13.3047, lng: -72.1167 }
cusco:          { lat: -13.5226, lng: -71.9673 }
pisac:          { lat: -13.4225, lng: -71.8488 }
ollantaytambo:  { lat: -13.2588, lng: -72.2633 }
calca:          { lat: -13.3333, lng: -71.9667 }
chinchero:      { lat: -13.3833, lng: -72.0500 }
maras:          { lat: -13.3400, lng: -72.1500 }
yucay:          { lat: -13.3183, lng: -72.0833 }
machu-picchu:   { lat: -13.1547, lng: -72.5252 }  // Aguas Calientes town
```

---

## Environment Variables

```bash
# AI
GEMINI_API_KEY=

# Database
DATABASE_URL=

# Redis / Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Payments
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Messaging
GHOST_PHONE_URL=http://localhost:4000
GHOST_PHONE_SECRET=dev-secret
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## Feature-Sliced Architecture Standards

UnlockCusco organizes the codebase into feature slices (`src/features/`). To maintain clean architecture, all code within features must adhere to the following standards:

1. **Component Naming:** React components must use `kebab-case.tsx` (e.g., `ticket-item.tsx`). Do not use `PascalCase.tsx` for filenames.
2. **Logic Extraction:** Complex state management, context consumption, and side-effects must be extracted out of UI components and into custom hooks located in the `hooks/` directory (e.g., `hooks/use-concierge-chat.ts`). The `.tsx` files should serve primarily as presentation layers.
3. **Data Transformations:** Functions that format data or build payloads should live in `utils/` (e.g., `utils/chat-payload.ts`), not in `actions/`.
4. **Server Actions:** The `actions/` directory is strictly reserved for Next.js Server Actions (files containing `"use server"`).
