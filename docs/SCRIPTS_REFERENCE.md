# Scripts Reference

All scripts live in the project root or `scripts/` directory. Run with:
```bash
node_modules/.bin/tsx <script-path>
```

---

## Data Analytics

| Script | Purpose |
|---|---|
| `scripts/analytics-whatsapp.ts` | WhatsApp coverage, campaign scope, number format check |
| `check-categories.ts` | Category distribution in DB |
| `check-geo-anomalies.ts` | Businesses with wrong coordinates |
| `find-fuzzy-duplicates.ts` | Detect near-duplicate business names |
| `find-foreign-businesses.ts` | Businesses outside Sacred Valley area |
| `audit-urubamba-calca.ts` | Urubamba/Calca business quality audit |

---

## Data Cleaning

| Script | Purpose |
|---|---|
| `clean-duplicate-businesses.ts` | Remove exact duplicates |
| `clean-business-names.ts` | Normalize business name casing |
| `clean-category-casing.ts` | Normalize category values to consistent case |
| `fix-geo-anomalies.ts` | Fix businesses placed on wrong coordinates |
| `fix-location-mismatches.ts` | Fix businesses assigned to wrong town |
| `delete-out-of-area.ts` | Remove businesses outside Sacred Valley |

---

## AI Generation

### Zagat Descriptions
```bash
# Generate Zagat-style descriptions for businesses with 5+ reviews
node_modules/.bin/tsx scripts/generate-zagat-descriptions.ts
```
- Updates `Business.description` field
- Skips businesses with <5 reviews (`MIN_REVIEWS = 5`)
- ~341 businesses, ~12 minutes at 500ms/request
- Uses Gemini 2.5 Flash

```bash
# Translate descriptions to Spanish
node_modules/.bin/tsx scripts/translate-zagat-descriptions.ts
```

---

## Business Data Import

| Script | Purpose |
|---|---|
| `seed-agencies.ts` | Import agency businesses |
| `seed-therapists.ts` | Import wellness/therapist businesses |
| `seed-missing-gems.ts` | Import curated "hidden gem" businesses |
| `import-agency.ts` | Single agency import with full profile |
| `mine-dining-specialties.ts` | Extract specialties from restaurant reviews |

---

## WhatsApp Campaigns

```bash
# Analytics — see campaign scope
node_modules/.bin/tsx scripts/analytics-whatsapp.ts

# Verification campaign — dry run first!
node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts --dry-run
node_modules/.bin/tsx scripts/verify-whatsapp-campaign.ts

# B2B invitation campaign (join UnlockCusco)
node_modules/.bin/tsx scripts/campaign-invite.ts
```

---

## Cache Management

```typescript
// Bust the businesses cache immediately (e.g. after bulk import)
import { revalidateBusinesses } from '@/features/business/actions/fetch-businesses';
await revalidateBusinesses();
```

Or trigger via curl:
```bash
curl -X POST http://localhost:3000/api/revalidate?tag=businesses
```

---

## Diagnostic / Test Scripts (root level)

| Script | Purpose |
|---|---|
| `test-search-filter.ts` | Verify searchDatabase category filtering |
| `test-db-check.ts` | Quick DB state check (totals, location dist.) |
| `test-ai6.ts` | AI SDK v6 streaming test |

---

## Prisma Commands

```bash
# Apply migrations
npx prisma migrate dev

# Reset DB (destructive!)
npx prisma migrate reset

# Open DB browser
npx prisma studio

# Regenerate client after schema change
npx prisma generate
```
