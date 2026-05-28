# AI Long Descriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `longDescription` fields to the database and build a pipeline script to generate rich, bilingual descriptions using up to 15 existing reviews per business.

**Architecture:** We will first update the Prisma schema and push the changes. Then, we will create `scripts/pipeline/4-generate-long-descriptions.ts` which uses `@ai-sdk/google` (Gemini 2.5 Flash) with structured JSON output to simultaneously generate English and Spanish editorial descriptions based on the business's best reviews.

**Tech Stack:** Prisma, TypeScript, `@ai-sdk/google`, Zod

---

### Task 1: Update Database Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new fields to the Business model**

```prisma
// In prisma/schema.prisma, under the Business model, add these fields:
// (You can add them right under description String @default(""))

  longDescription        String?
  longDescriptionEs      String?
```

- [ ] **Step 2: Push the schema to the database**

Run: `npx prisma db push`
Expected: "Your database is now in sync with your schema."

- [ ] **Step 3: Generate the Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add longDescription and longDescriptionEs to Business model"
```


### Task 2: Create the AI Generation Pipeline Script

**Files:**
- Create: `scripts/pipeline/4-generate-long-descriptions.ts`

- [ ] **Step 1: Write the pipeline script**

```typescript
import { PrismaClient } from '@prisma/client';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const MIN_REVIEWS = 3; // We need at least a few reviews to write a good paragraph
const MAX_REVIEWS_FOR_CONTEXT = 15;

async function main() {
  const force = process.argv.includes('--force');
  console.log(`Fetching businesses with ${MIN_REVIEWS}+ reviews... ${force ? '(FORCE MODE: Overwriting existing long descriptions)' : ''}`);

  const whereClause: any = {
    reviews: {
      some: {
        rating: { gte: 4 }
      }
    }
  };

  if (!force) {
    // Only process businesses that don't have a long description yet
    whereClause.longDescription = null;
  }

  const businesses = await prisma.business.findMany({
    where: whereClause,
    include: {
      reviews: true
    }
  });

  const businessesWithPositiveReviews = businesses.map(b => ({
    ...b,
    positiveReviews: b.reviews.filter(r => r.rating >= 4)
  }));

  const filtered = businessesWithPositiveReviews.filter(b => b.positiveReviews.length >= MIN_REVIEWS);
  console.log(`Found ${businesses.length} with any positive reviews. Processing ${filtered.length} missing long descriptions.`);

  for (const b of filtered) {
    if (!b.positiveReviews || b.positiveReviews.length === 0) continue;

    console.log(`\nProcessing: ${b.name} (${b.positiveReviews.length} positive reviews)`);
    
    // Sort reviews by length (descending) to get the most detailed ones, and take top 15
    const topReviews = b.positiveReviews
      .sort((a, b) => b.text.length - a.text.length)
      .slice(0, MAX_REVIEWS_FOR_CONTEXT);

    const reviewsText = topReviews.map(r => `- ${r.text}`).join('\n');

    const prompt = `
You are an expert travel and food editorial writer for a high-end magazine.
Based ONLY on the following customer reviews, write a rich, compelling 1-to-2 paragraph description (about 60-90 words) for this business.
Capture the atmosphere, the standout highlights, and the overall experience.
Do NOT invent amenities or facts that are not explicitly mentioned or strongly implied by the reviews.
Do NOT use direct quotes like "One reviewer said...". Weave the sentiment into a professional editorial voice.

Business Name: ${b.name}
Category: ${b.category}

Customer Reviews:
${reviewsText}
    `;

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'), // Fast and efficient for this task
        schema: z.object({
          longDescription: z.string().describe('The English editorial description (1-2 paragraphs).'),
          longDescriptionEs: z.string().describe('A high-quality Spanish translation of the editorial description.')
        }),
        prompt: prompt,
      });

      console.log(`\nEN: ${object.longDescription.substring(0, 100)}...`);
      console.log(`ES: ${object.longDescriptionEs.substring(0, 100)}...`);

      await prisma.business.update({
        where: { id: b.id },
        data: { 
          longDescription: object.longDescription,
          longDescriptionEs: object.longDescriptionEs
        }
      });
      console.log(`✅ Saved long descriptions for ${b.name}`);

    } catch (error) {
      console.error(`❌ Failed to generate description for ${b.name}:`, error);
    }
  }

  console.log(`\nPipeline complete.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run a test compile**

Run: `npx tsc scripts/pipeline/4-generate-long-descriptions.ts --noEmit --esModuleInterop --skipLibCheck`
Expected: Clean compilation

- [ ] **Step 3: Commit**

```bash
git add scripts/pipeline/4-generate-long-descriptions.ts
git commit -m "feat(ai): add pipeline to generate bilingual long descriptions"
```