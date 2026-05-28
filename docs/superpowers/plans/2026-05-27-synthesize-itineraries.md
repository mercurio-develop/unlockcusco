# Synthesize Itineraries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and seed four theme-based, prebuilt itineraries for Cusco using ONLY existing businesses in the database.

**Architecture:** We will first extract the current businesses to a JSON file. Then, use that data along with web search to synthesize the new itineraries. Finally, we'll write a seed script that iterates and inserts them into the `SavedItinerary` table.

**Tech Stack:** TypeScript, Prisma Client, Node.js

---

### Task 1: Create Database Export Script

**Files:**
- Create: `scripts/utils/export-businesses.ts`

- [ ] **Step 1: Write the export script**

```typescript
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      locationSlug: true,
    },
    orderBy: {
      reviewsCount: 'desc'
    }
  });

  fs.writeFileSync('businesses-export.json', JSON.stringify(businesses, null, 2));
  console.log(`Exported ${businesses.length} businesses to businesses-export.json`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run the script to verify and export**

Run: `npx tsx scripts/utils/export-businesses.ts`
Expected: "Exported X businesses to businesses-export.json"

- [ ] **Step 3: Commit**

```bash
git add scripts/utils/export-businesses.ts businesses-export.json
git commit -m "chore: add script to export businesses for itinerary synthesis"
```

### Task 2: Create Synthesized Seed Script

**Files:**
- Create: `scripts/seed/seed-synthesized-itineraries.ts`

- [ ] **Step 1: Write the seed script structure**
Using the exported JSON data, the agent should search the web for Cusco itineraries covering: Culinary, History, Adventure, and Wellness. Then, construct the TypeScript arrays mapping the searched concepts strictly to the exported business names.

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Synthesized Itineraries...');

  // Helper to strictly find existing businesses
  const findWpStrict = async (query: string) => {
    const b = await prisma.business.findFirst({
      where: { name: { equals: query, mode: 'insensitive' } },
    });
    
    if (!b) {
      throw new Error(`CRITICAL: Could not find business matching "${query}". Waypoints must strictly match existing DB entries.`);
    }

    return {
      id: b.id,
      title: b.name,
      lat: b.lat,
      lng: b.lng,
      category: b.category,
      rating: b.rating,
      locationStr: b.locationSlug,
      service: b
    };
  };

  // NOTE: The agent executing this task MUST replace the below placeholders 
  // with actual names found in businesses-export.json after researching.
  const culinaryStop1 = await findWpStrict("Limbus Resto Bar"); // Example replacement
  const culinaryStop2 = await findWpStrict("San Pedro Market"); // Example replacement
  const historyStop1 = await findWpStrict("Qorikancha");
  const historyStop2 = await findWpStrict("Sacsayhuaman");
  const adventureStop1 = await findWpStrict("Maras");
  const wellnessStop1 = await findWpStrict("Healing House Cusco"); // Example

  const itineraries = [
    {
      shortId: 'synthesized-culinary-tour',
      state: {
        title: 'Cusco Culinary Journey',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Plaza de Armas", type: "CUSTOM" },
        waypoints: [culinaryStop1, culinaryStop2]
      }
    },
    {
      shortId: 'synthesized-history-walk',
      state: {
        title: 'Historical Inca Walk',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        waypoints: [historyStop1, historyStop2]
      }
    },
    {
      shortId: 'synthesized-adventure',
      state: {
        title: 'Sacred Valley Adventure',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "Cusco", type: "CUSTOM" },
        waypoints: [adventureStop1]
      }
    },
    {
      shortId: 'synthesized-wellness',
      state: {
        title: 'Andean Wellness & Healing',
        startAnchor: { lat: -13.5168, lng: -71.9781, title: "San Blas", type: "CUSTOM" },
        endAnchor: { lat: -13.5168, lng: -71.9781, title: "San Blas", type: "CUSTOM" },
        waypoints: [wellnessStop1]
      }
    }
  ];

  for (const it of itineraries) {
    const existing = await prisma.savedItinerary.findUnique({ where: { shortId: it.shortId } });
    if (!existing) {
      await prisma.savedItinerary.create({
        data: { shortId: it.shortId, state: it.state as any }
      });
      console.log(`+ Added Itinerary: ${it.shortId}`);
    } else {
      await prisma.savedItinerary.update({
        where: { shortId: it.shortId },
        data: { state: it.state as any }
      });
      console.log(`* Updated Itinerary: ${it.shortId}`);
    }
  }

  console.log(`✅ Finished seeding synthesized itineraries.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run test to verify seeding**

Run: `npx tsx scripts/seed/seed-synthesized-itineraries.ts`
Expected: Output showing the successful addition/updating of 4 itineraries.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed/seed-synthesized-itineraries.ts
git commit -m "feat: add synthesized theme itineraries seed script"
```
