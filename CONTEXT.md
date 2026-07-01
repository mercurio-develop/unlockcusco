# Domain context — UnlockCusco

AI-powered local business discovery for the Sacred Valley, Peru. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Glossary

| Term | Meaning |
|------|---------|
| **Business** | A listed local service provider (restaurant, tour, stay, etc.) in Prisma/DB |
| **Discovery** | Feature domain: map, search, business cards, explore flow |
| **Concierge** | AI chat assistant with tool calling (Gemini) |
| **Feature** | Self-contained module under `src/features/{name}/` |
| **Shadow lead** | Tourist inquiry to an unclaimed business via WhatsApp |
| **Claim** | Business owner validates identity and claims their profile |

## Avoid

- Hardcoded routes — use `src/paths.ts` (`explorePath`, `businessPath`, etc.)
- Domain logic in `src/components/ui/` — belongs in `src/features/`
- `new PrismaClient()` — use `@/lib/prisma` singleton

## Key paths

| Path | Role |
|------|------|
| `src/features/discovery/` | Map, search, business cards |
| `src/features/concierge/` | AI chat |
| `src/features/itinerary/` | Trip planning |
| `src/paths.ts` | Route helpers |
| `src/lib/supabase/` | Auth SSR clients |
| `src/lib/prisma.ts` | DB client |
