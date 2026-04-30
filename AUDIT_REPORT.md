# Codebase Audit & Refactoring Report

## 1. Hardcoded State Isolation (Completed)
- **Extracted `DEFAULT_COORDS`**: Moved default latitude and longitude (`-13.3047`, `-72.1167`) from `ai-concierge.tsx` to `src/lib/constants.ts`.
- **Extracted `AI_CONCIERGE_INITIAL_MESSAGE`**: Moved the AI Concierge's long welcome and Journey Architect prompt string to constants.
- **Extracted `SACRED_VALLEY_LOCATIONS`**: Moved the autocomplete suggestions array from `hero-section.tsx` to constants.
- **Extracted `COORDS_MAP`**: Moved the hardcoded town coordinates mapping out of `build-itinerary.ts` to `constants.ts`.

## 2. Architectural Debt Identified: Component Location
According to the project's **Feature-Sliced Architecture (Vertical Slicing)** rules:
> "Code is organized by business domain (e.g., business, concierge, leads) rather than technical type... Global components in src/components/ are reserved for UI primitives and generic helpers only."

**Current Violations:**
The `src/components` directory currently houses many domain-specific components that should be relocated to their respective domains in `src/features`:

* **Explore Domain** (Move to `src/features/explore/components/`):
  - `explore-view.tsx`
  - `explore-search.tsx`
  - `service-search.tsx`
  - `itinerary-panel.tsx`
  - `explore-map.tsx`
  - `explore-map-wrapper.tsx`
* **Landing Domain** (Move to `src/features/landing/components/`):
  - `hero-section.tsx`
  - `business-grid.tsx`
  - `features-section.tsx`
  - `architect-cta.tsx`
* **Chat / Concierge Domain** (Move to `src/features/concierge/components/`):
  - `ai-concierge.tsx`
  - `GenerativeUI.tsx`
  - `BoletoInfoCard.tsx`
* **Wizard Domain** (Move to `src/features/wizard/components/`):
  - `JourneyArchitect.tsx`

## 3. Recommended Next Steps
We should incrementally move these components into `src/features/[domain]/components/` and update all their imports across the application. Doing this will fully clean up the component tree and enforce strict architectural isolation.