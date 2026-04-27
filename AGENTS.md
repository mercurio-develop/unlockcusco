<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# InkaPortal — Agent Handoff Brief

## What this is

**InkaPortal** is an AI-powered local business discovery platform for the Sacred Valley, Peru. Tourists search and book experiences; local businesses claim their profile for direct WhatsApp leads. MVP monetization: S/5 one-time identity validation + S/49/month subscription.

---

## Stack — critical details

| Concern | Library | Notes |
|---|---|---|
| Framework | Next.js 16.2.4, App Router | Server components by default |
| UI primitives | `@base-ui/react` | NOT Radix/shadcn — uses `render` prop on `Trigger`/`Close` |
| AI | `@google/genai` Gemini 2.5 Flash | Key: `GEMINI_API_KEY` |
| Map | `mapbox-gl` + `react-map-gl` v8 | Key: `NEXT_PUBLIC_MAPBOX_TOKEN` |
| DB | Prisma + SQLite (`prisma/dev.db`) | 5 seeded businesses |
| Animations | `framer-motion` |  |
| Styling | Tailwind CSS v4 | Dark theme: `bg-[#09090B]`, gold accent: `#D4AF37` |

**Never do `new PrismaClient()` directly.** Always import `prisma` from `@/lib/prisma` (singleton).

---

## Routes

```
/                          → Landing (cinematic, search → /explore)
/explore?q=...             → Map + card list + AI concierge
/claim/[businessId]        → Business claim CTA page (shadow lead)
/claim/[businessId]/checkout → Payment flow (simulated, S/5)
/dashboard?businessId=...  → Business owner panel
```

---

## What is DONE — do not redo

- [x] Landing page with animated search
- [x] Explore page: full-text + category search via `?q=` param
- [x] **Interactive map**: clicking a card flies the map there; clicking a marker scrolls+highlights the card. Bidirectional state in `ExploreView`.
- [x] **Category markers**: each category has a distinct color + emoji pin (see `CATEGORY_STYLE` in `explore-map.tsx`)
- [x] **BusinessCard**: highlights gold when selected, "Book Now" opens WhatsApp for claimed businesses, "Check Availability" triggers shadow lead flow for unclaimed ones
- [x] Shadow lead flow: generates pre-filled WhatsApp message to business owner
- [x] Claim page with blurred lead teaser
- [x] Checkout / payment flow (simulated — calls `claimBusiness` server action on success)
- [x] `claimBusiness` server action: sets `isClaimed=true` in DB
- [x] Dashboard: reads real business data via `?businessId=` param; "Ver Datos de Contacto" opens `LeadCTA` dialog with WhatsApp + email reply buttons
- [x] AI Concierge: Gemini 2.5 Flash, floating chat UI, graceful fallback if no API key
- [x] Prisma singleton at `src/lib/prisma.ts`
- [x] Shared `Business` type defined once in `src/components/explore/explore-view.tsx` — import from there
- [x] **Agentic Spatial RAG**: Tool calling to query Prisma and calculate Haversine distance, generating multi-stop alternative itineraries.
- [x] **Vercel AI SDK Migration**: Uses `@ai-sdk/google` (Gemini 2.5 Pro) with `streamText`, `useChat`, and strict type-safe tool invocations (`inputSchema`, `parts`).
- [x] **3D Map**: Mapbox satellite-streets with 3D terrain and dynamic glassmorphism pulsing markers.

---

## What is MISSING — tasks for next session

### P0 — Core gaps

1. **Business detail page** (`/business/[id]`)
   - Full page for a single business: photos, reviews, map embed, booking CTA
   - BusinessCard "Book Now" / "Check Availability" should also link here

2. **Real leads tracking**
   - Add `Lead` model to Prisma schema (`id`, `businessId`, `touristName`, `touristEmail`, `date`, `createdAt`)
   - Save a lead row when "Check Availability" form is submitted (currently just opens WhatsApp)
   - Dashboard "Leads y Mensajes" section should list real lead rows

3. **Language toggle in AI Concierge**
   - Backend `askConcierge(message, language)` already supports it
   - Add a 🇺🇸 / 🇪🇸 toggle button in the chat header
   - Pass selected language to `askConcierge`

### P1 — Polish

4. **Mobile map view**
   - Map is `hidden md:block` — mobile users see no map
   - Add a "Map" tab toggle on mobile that swaps between card list and map

5. **SEO meta tags**
   - Add `metadata` export to each page (`/`, `/explore`, `/claim/[id]`)
   - OG image, description, title

6. **Auth (lightweight)**
   - "Sign In" on landing currently just routes to `/dashboard`
   - A simple magic-link or PIN auth for business owners to access their dashboard

7. **Real Stripe payment**
   - Currently `handleSimulatePayment` just waits 1.5s then calls `claimBusiness`
   - Wire up Stripe Checkout or Payment Element

### P2 — Nice to have

8. Show all businesses on map even when list is filtered (dim non-matching, highlight matching)
9. Search on-type with debounce (currently only submits on Enter)
10. Dashboard reviews feed (show recent reviews for the claimed business)

---

## File map

```
src/
  app/
    page.tsx                          Landing page ("use client")
    explore/page.tsx                  Server: DB query → <ExploreView>
    claim/[businessId]/page.tsx       Server: claim CTA
    claim/[businessId]/checkout/page.tsx  Server: checkout page
    dashboard/page.tsx                Server: real business data
    actions/
      chat.ts                         Gemini AI concierge server action
      claim-business.ts               Sets isClaimed=true
      shadow-lead.ts                  Generates WhatsApp URL
  components/
    explore/
      explore-view.tsx                ★ Client: owns selectedId state, map↔card sync
      explore-search.tsx              Client: search input + category badge nav
    map/
      explore-map.tsx                 Client: Mapbox map, markers, popup, flyTo
      explore-map-wrapper.tsx         Client: dynamic() wrapper
    cards/
      business-card.tsx               Client: card with highlight + dialog
    chat/
      ai-concierge.tsx                Client: floating chat UI
    checkout/
      payment-flow.tsx                Client: payment method selection + forms
    dashboard/
      lead-cta.tsx                    Client: "unlock lead" dialog
  lib/
    prisma.ts                         Singleton PrismaClient ← always use this
prisma/
  schema.prisma                       Business + Review models (SQLite)
scripts/
  seed-dummy.ts                       5 dummy businesses (run with: npx tsx scripts/seed-dummy.ts)
```

---

## Patterns to follow

```tsx
// Server action
"use server"
import { prisma } from "@/lib/prisma"
export async function doSomething(id: string) { ... }

// Client component using server action
"use client"
import { doSomething } from "@/app/actions/something"
// call directly: await doSomething(id)

// Dialog (Base UI, NOT Radix)
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger render={<Button />}>Open</DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>

// Shared Business type
import type { Business } from "@/components/explore/explore-view"
```
