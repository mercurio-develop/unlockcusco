# unlockcusco — Agent instructions

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before any task. Read [CONTEXT.md](CONTEXT.md) for domain vocabulary.

**Project handoff:** [agents/AGENTS.md](agents/AGENTS.md) — stack details, routes, done/missing lists, file map.

Optional: [GEMINI.md](GEMINI.md) for mempalace prerequisite and RTK proxy notes.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 App Router, TypeScript strict |
| Styling | Tailwind CSS v4 |
| Auth / DB | Supabase SSR + Prisma (some features) |
| Validation | Zod in server actions |
| URL state | nuqs (`search-params.ts` per feature) |
| Alias | `@/*` → `./src/*` |

## Mandates

1. **Feature-sliced only** — domain logic in `src/features/{name}/`, never in `src/components/ui/`
2. **Thin routes** — `src/app/` pages orchestrate layout + Suspense; business logic lives in features
3. **Barrel imports** — routes import from `@/features/{name}`, not deep paths
4. **Centralized paths** — use [src/paths.ts](src/paths.ts); never hardcode route strings
5. **Script reuse** — consult [docs/SCRIPTS_REFERENCE.md](docs/SCRIPTS_REFERENCE.md) before new scripts
6. **Prisma singleton** — import `prisma` from `@/lib/prisma`, never `new PrismaClient()`

## Scaffolding

```bash
npm run scaffold:feature {kebab-name}
```

Then wire a thin page in `src/app/` and export from the feature barrel.

## Agent skills

### Issue tracker

GitHub Issues via `gh` CLI. See [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

See [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/`. See [docs/agents/domain.md](docs/agents/domain.md).

Recommended: `/grill-with-docs`, `/tdd`, `/to-issues`, `/improve-codebase-architecture`

## Cursor rules

Architecture rules live in [.cursor/rules/](.cursor/rules/). Global skill: `nextjs-feature-sliced` in `~/.agents/skills/`.
