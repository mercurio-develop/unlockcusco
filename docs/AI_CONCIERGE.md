# AI Concierge — Technical Reference

## Overview

The Vallecito AI Concierge is a chat widget powered by Gemini 2.5 Flash via AI SDK v6. It helps tourists plan their Sacred Valley itinerary through conversational AI, supporting restaurant discovery, taxi booking, full-day itinerary building, and live day view updates.

---

## Key Files

| File | Purpose |
|---|---|
| `src/features/concierge/components/ai-concierge.tsx` | Chat UI, tool result rendering, day view sync |
| `src/app/api/chat/route.ts` | POST handler — streamText, tool registry, system prompt assembly |
| `src/lib/ai/prompts.ts` | All system prompts (exported constants) |
| `src/lib/ai/tools/` | All AI tool implementations |

---

## Conversation Flow Protocol

The AI follows a strict 5-phase protocol (defined in `CONVERSATION_FLOW_PROMPT`):

```
1. LOCATE    → Establish tourist location (GPS or town name) BEFORE anything else
2. CLASSIFY  → QUICK_FIND | FULL_DAY | TRANSIT
3A. QUICK_FIND → searchDatabase → show 3 → user picks → mutateItinerary(SET_END)
3B. FULL_DAY   → buildItinerary(origin, destination, desires)
3C. TRANSIT    → estimateTaxiFare(origin, destination)
4.  CONTINUE?  → "Want to keep planning from here?"
```

**Critical rules:**
- NEVER call `buildItinerary` for a single-stop request
- NEVER ask for origin if already known from GPS or chat history
- NEVER ask for start AND end together if start is known

---

## Tools (active in route.ts)

| Tool | Trigger | What it does |
|---|---|---|
| `askUserLocation` | Missing GPS | Renders a "Share GPS" button in chat |
| `searchDatabase` | QUICK_FIND | RAG search with category filter + stopword normalization |
| `buildItinerary` | FULL_DAY | Spatial corridor algorithm, returns `OptimizedPlan` |
| `mutateItinerary` | SET_START/END/SWAP/TIME | Granular itinerary mutations |
| `estimateTaxiFare` | TRANSIT | Fare + WhatsApp CTA |
| `buildMacroTrip` | Multi-day request | Multi-day trip plan |
| `showBoletoInfo` | Ticket queries | Machu Picchu ticket info |
| `askAvailability` | Booking check | Ghost Phone availability query |
| `queryExpatsGuide` | Info queries | Static Sacred Valley knowledge base |
| `triggerSupportAlert` | Emergency | Notifies human operators |
| `searchDayTours` | Day tour queries | TourPackage DB search |

**Removed:** `findNearby` — caused empty results (case-sensitive category mismatch vs uppercase DB values), triggered misleading "I don't have verified..." messages.

---

## searchDatabase — How it works

```
Input: query (e.g. "Find a Restaurant")
  ↓ normalizeQuery() — strips stopwords: "find a restaurant" → "restaurant"
  ↓ detectCategoryKeywords() — maps to DB category: ["dining","restaurant",...]
  ↓ Redis cache check (key: v5:query:location:catKey, TTL: 24h)
  ↓ universalSearch(query, location, limit=15) — substring match across 6 fields
  ↓ Post-filter: keep only businesses whose category matches intent
  ↓ (fallback: if 0 filtered, use all results)
  ↓ Spatial sort by distance+rating+isAsociado if GPS coords provided
  → Return top 10
```

**Category intent map** (in `src/lib/ai/tools/search-database.ts`):
- dining keywords → `['dining','restaurant','food','cafe','bar']`
- hotel keywords → `['lodging','stay','hotel','hostel']`
- wellness keywords → `['wellness','therapy','spa','healer']`
- taxi keywords → `['transport','taxi','transfer']`
- etc.

---

## Day View Sync

When AI returns a `buildItinerary` result:
1. `ai-concierge.tsx` tool-sync effect detects `toolName === 'buildItinerary'`
2. Calls `setActiveItinerary(output)` + `setPanelMode('itinerary')`
3. `trip-context.tsx` sync effect maps `activeItinerary.waypoints` → `currentTrip.days[n].events`
4. Live Builder Day View tab updates automatically

**Important:** Never call `setState` inside a `setCurrentTrip(prev => ...)` functional updater — it corrupts React 18's fiber state and produces `TypeError: Cannot read properties of undefined (reading 'state')`.

---

## Prompts

All prompts are in `src/lib/ai/prompts.ts`:

| Export | Purpose |
|---|---|
| `SYSTEM_PROMPT_CONCIERGE` | Persona, location context, taxonomy, inventory rules |
| `CONVERSATION_FLOW_PROMPT` | 5-phase orientation protocol (injected FIRST) |
| `PLANNING_PROMPT` | Day planning rhythm, itinerary execution rules |
| `RESEARCH_PROMPT` | Food/restaurant search execution |
| `SUPPORT_PROMPT` | Emergency/support escalation |

Injection order in route.ts:
```
SYSTEM_PROMPT_CONCIERGE + CONVERSATION_FLOW_PROMPT + PLANNING_PROMPT + SUPPORT_PROMPT + RESEARCH_PROMPT
```

---

## Route Config

```typescript
// src/app/api/chat/route.ts
model: google('gemini-2.5-flash')
stopWhen: stepCountIs(8)   // allows multi-phase flows
maxDuration: 60            // seconds
ratelimit: 10 requests/hour per IP (via Upstash)
```

---

## useChat Setup

```typescript
const chat = useChat({
  api: '/api/chat',
  messages: initialMessages,
  body: { userLat, userLng, localTime, targetDate, archetype, intensity }
});

// Sending:
(chat as any).sendMessage({ text }, { body: { ...perMessageContext } });
```

Tool results arrive as `msg.parts[]` with `type: 'tool-{name}'` and `state: 'output-available'` (AI SDK v6 pattern).
