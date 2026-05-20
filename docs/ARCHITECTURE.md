# UnlockCusco Architecture Guidelines

This project strictly adheres to a **Feature-Sliced Architecture** designed for the Next.js App Router. All future development, refactoring, and AI-assisted code generation MUST strictly follow these principles.

## 1. Directory Structure (The Blueprint)

- **`src/app/`**: Exclusively handles routing. Pages must be incredibly thin, acting only as layout orchestrators and Suspense boundaries. Use route groups like `(authenticated)` to organize middleware logic seamlessly.
- **`src/components/`**: Contains purely generic, highly reusable UI components (e.g., `form/`, `pagination/`, `ui/`, `theme/`). These components MUST NOT contain any domain-specific business logic.
- **`src/features/`**: The heart of the application. Contains discrete, self-contained business domains (e.g., `discovery`, `concierge`, `auth`, `itinerary`).

## 2. Feature Handling (Inside `src/features/[name]`)

Each domain folder is entirely self-contained and heavily abstracted into distinct layers. Code must not "leak" across these layers.

- **`actions/`**: Contains Next.js Server Actions (e.g., `upsert-ticket.ts`, `delete-ticket.ts`). These functions:
  - Use Zod for input validation.
  - Execute database mutations (Prisma).
  - Handle authorization checks.
  - Return a standardized `ActionState` format for the UI.
- **`queries/`**: Contains purely server-side data fetching logic (e.g., `get-tickets.ts`). They handle database reads, pagination logic, and role-based access WITHOUT mixing in UI or mutation logic.
- **`components/`**: Feature-specific UI. 
  - **Server Components** (e.g., `ticket-list.tsx`) directly call functions from `queries/`.
  - **Client Components** (e.g., `ticket-upsert-form.tsx`) handle interactivity and submit data to `actions/`.
- **`search-params.ts`**: Uses libraries (like `nuqs`) to validate, parse, and cache URL state (like filters and pagination) completely outside of the components.
- **`permissions/`**: Extracts authorization and access rules into isolated, testable utilities.

## 3. Naming Conventions

Strictly adhere to the following naming rules across the entire codebase:

- **Files:** `kebab-case.ts` (or `.tsx`) strictly applied everywhere. The filename must directly describe the primary export (e.g., `ticket-list.tsx`, `upsert-ticket.ts`).
- **Functions:** `camelCase` for queries, actions, and utilities (e.g., `getTickets`, `upsertTicket`, `calculateDistance`).
- **Components:** `PascalCase`. Components must be exported as **named exports**, matching the file name without the dashes (e.g., `export const TicketList = ...` inside `ticket-list.tsx`). Default exports are reserved solely for `page.tsx` and `layout.tsx` in the App Router.

## 4. Refactoring Strategy for Legacy Code
When touching older parts of the `unlockcusco` codebase:
1. Migrate data fetching out of `app/api/` routes and into structured `src/features/[name]/queries/` and `src/features/[name]/actions/`.
2. Break apart massive global contexts into feature-specific hooks or rely on URL Search Params for state management.