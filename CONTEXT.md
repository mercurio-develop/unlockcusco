# Domain context — UnlockCusco

AI-powered local business discovery for the Sacred Valley, Peru. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Glossary

| Term | Meaning |
|------|---------|
| **Business** | A listed local service provider (restaurant, tour, stay, etc.) in Prisma/DB |
| **Discovery** | Feature domain: map, search, business cards, explore flow |
| **Concierge** | AI chat assistant with tool calling (Gemini) |
| **Feature** | Self-contained module under `src/features/{name}/` |
| **Locale** | Route language segment: `en` or `es` — required by `@/paths` helpers |
| **ActionState** | Standard server action return type from `@/lib/action-state` |
| **Ghost Phone** | WhatsApp microservice for programmatic business alerts |
| **SavedItinerary** | Shareable trip plan persisted in Postgres (`?trip=` URL param) |
| **Shadow lead** | Tourist inquiry to an unclaimed business via WhatsApp |
| **Claim** | Business owner validates identity and claims their profile |

## Avoid

- Hardcoded routes — use `src/paths.ts` with a `Locale` argument (`explorePath(lang)`, `businessPath(lang, slug)`, etc.)
- Domain logic in `src/components/ui/` — belongs in `src/features/`
- `new PrismaClient()` — use `@/lib/prisma` singleton
- Deep imports from `@/features/*/components/` in routes — use feature barrels

## Key paths

| Path | Role |
|------|------|
| `src/features/discovery/` | Map, search, business detail, explore flow |
| `src/features/concierge/` | AI chat |
| `src/features/itinerary/` | Trip planning and share links |
| `src/features/guides/` | Travel guides and affiliate cards |
| `src/features/gear/` | Gear hub and stay recommendations |
| `src/features/contact/` | Contact form |
| `src/paths.ts` | Locale-aware route helpers |
| `src/lib/action-state.ts` | Shared `ActionState` type for mutations |
| `src/lib/store/` | Focused Zustand stores (selection, map UI, concierge UI, panel, interaction) |
| `src/lib/supabase/` | Auth SSR clients |
| `src/lib/prisma.ts` | DB client (Supabase Postgres + pgvector) |
