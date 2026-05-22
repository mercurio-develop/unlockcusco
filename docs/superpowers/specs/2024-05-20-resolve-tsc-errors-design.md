# Design Spec: Resolve TypeScript Compilation Errors

This document outlines the strategy for resolving the structural TypeScript errors detected in the UnlockCusco project.

## 1. AI SDK Migration (v6.0.177)
**Issue:** `ai` package no longer exports `Message` (use `UIMessage`), `useChat` options changed (`api` moved/deprecated), and `append` type mismatch.
**Files:**
- `src/features/concierge/hooks/use-concierge-chat.ts`
- `src/features/concierge/components/ai-concierge.tsx`

**Solution:**
- Update imports from `Message` to `UIMessage` (or `Message` from `@ai-sdk/ui-utils` if compatible).
- Verify the new structure of `UseChatOptions`. In newer AI SDK versions, `api` is often replaced by `fetch` or handled differently in `useChat`.
- Check `UseChatHelpers` for `append` availability.

## 2. Prisma Model Renames
**Issue:** `@prisma/client` missing `Ride` and `Message`.
**Files:**
- `src/features/sandbox/components/SandboxDashboard.tsx`

**Solution:**
- Rename `Ride` to `RideBooking`.
- Rename `Message` to `RideMessage`.
- Fix the implicit `any` type for parameter `m`.

## 3. AI Tool 'execute' Return Types
**Issue:** `tool({...})` helper failing because `execute` return types are too complex or incompatible with the expected JSON-serializable output.
**Files:**
- `src/lib/ai/tools/*.ts` (taxi-estimator, search-database, trigger-support, etc.)

**Solution:**
- Explicitly type the return value of `execute` functions.
- Ensure the return values are plain objects (JSON compatible).
- Use `z.infer` for payloads to ensure consistency.

## 4. Component Prop and Type Mismatches
**Issue:** Prop mismatches and `unknown` assignment to `ReactNode`.
**Files:**
- `src/app/[lang]/business/[slug]/page.tsx`: Fix template props (missing properties).
- `src/features/discovery/components/itinerary-panel.tsx`: Cast `unknown` to `ReactNode` or ensure proper type.
- `src/components/layout/navbar.tsx`: Fix user object nullability/undefined check.

## 5. Stripe Version Alignment
**Issue:** `2024-12-18.neon` is not assignable to `2026-04-22.dahlia`.
**Files:**
- `src/lib/config/stripe.ts`

**Solution:**
- Update the API version to match the expected Stripe SDK version types.

## 6. Verification Strategy
- Run `rtk npx tsc --noEmit` after each atomic fix.
- Ensure all structural errors are gone.
- Map errors in `explore-map.tsx` last as they are numerous (15 errors).

## Approval Gate
Please review this design. Once approved, I will move to the implementation plan.
