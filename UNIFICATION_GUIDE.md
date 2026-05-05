# Vallecito Unification Guide
*A guide for AI Agents extending the Vallecito Platform*

The codebase has undergone a major unification refactor. Disparate service models, UI components, and state contexts have been bridged to create a polymorphic, extensible architecture. 

If you are building new features (like B2B dashboards, new service verticals, or analytics), **you must adhere to these unified patterns.**

## 1. The Polymorphic Data Layer (`UniversalService`)
We no longer build isolated components for `Business`, `Transport`, `Therapist`, or `TourPackage`. Instead, all services are mapped to `UniversalService` before hitting the UI.

**Location**: `src/lib/types/trip.ts`

```typescript
export interface UniversalService {
  id: string;
  type: 'BUSINESS' | 'TRANSPORT' | 'PACKAGE' | 'THERAPIST' | 'AGENCY';
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  // ... shared fields
  metadata?: {
    // Put domain-specific data here (e.g. capacity, specialties)
  }
}
```

**How to fetch data**:
If you are building a search or AI tool, do not query tables individually. Use `universalSearch` which queries across models and maps them automatically:
**Location**: `src/features/business/queries/universal-search.ts`

## 2. Unified UI Primitives

### `EntityCard`
**Location**: `src/components/cards/entity-card.tsx`
Do not create custom cards. `EntityCard` consumes a `UniversalService` and handles:
- WhatsApp click tracking
- Shadow lead generation
- Adding to the `TripContext` timeline
- It works for any vertical (transport, dining, healers, etc.)

### `ThreePaneLayout`
**Location**: `src/components/layout/three-pane-layout.tsx`
The standard layout for Vallecito (Sidebar, Content, Map).
- `sidebar`: Usually contains headers and `FilterBar`.
- `content`: Usually a grid of `EntityCard`s or the `BuilderWorkspace`.
- `map`: An interactive Mapbox instance.
The layout manages its own resizer logic and mobile toggle state.

### `ServicesView`
**Location**: `src/features/services/components/services-view.tsx`
A pre-composed `ThreePaneLayout` designed specifically for service verticals (like `/services/lodging`). Pass it your filters and `UniversalService` entities, and it handles the rest.

## 3. Unified State (`TripContext`)
**Location**: `src/lib/store/trip-context.tsx`
We merged `ItineraryContext` and `BuilderContext`. The new `TripContext` is the single source of truth.

- **AI Legacy Bridge**: It automatically maps `activeItinerary` (from Vercel AI SDK tools) into the `currentTrip` format.
- **Actions**: Use `addEvent`, `removeEvent`, and `updateEvent` to mutate the timeline.
- **The Bridge Action**: `insertWaypoint(service: UniversalService)` automatically figures out if it should add to the Pro Builder timeline or the AI's legacy itinerary.

*Note: `ItineraryContext` still exists as a legacy shim to prevent crashes in un-migrated components, but new code MUST import from `trip-context.tsx`.*

## 4. Prisma & Missing Columns (e.g. `googleRating`)
If you were working on a branch that added new columns to Prisma (like `googleRating` or `reviewSummary`) before the unification merge, those columns were lost during the hard reset to `feat/unification-merge`.

**To fix this**:
1. Re-add your columns to `prisma/schema.prisma`.
2. Run `npx prisma db push`.
3. Restart the Next.js dev server to clear the `.next` cache and load the new Prisma Client into memory.