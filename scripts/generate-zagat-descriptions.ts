import { PrismaClient } from '@prisma/client';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const prisma = new PrismaClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const MIN_REVIEWS = 1;

async function main() {
  const force = process.argv.includes('--force');
  console.log(`Fetching businesses with ${MIN_REVIEWS}+ reviews... ${force ? '(FORCE MODE: Overwriting existing descriptions)' : ''}`);

  const whereClause: any = {
    reviews: {
      some: {
        rating: { gte: 4 }
      }
    }
  };

  if (!force) {
    whereClause.description = "";
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
  console.log(`Found ${businesses.length} with any positive reviews. Processing ${filtered.length} with ${MIN_REVIEWS}+ positive reviews.`);
  let updatedCount = 0;

  for (const b of filtered) {
    if (!b.positiveReviews || b.positiveReviews.length === 0) continue;

    console.log(`\nProcessing: ${b.name} (${b.positiveReviews.length} positive reviews)`);
    const reviewsText = b.positiveReviews.map(r => `- ${r.text}`).join('\n');

    const prompt = `
You are a concise, expert travel and food critic writing in the classic Zagat style.
Based ONLY on the following POSITIVE customer reviews, write a 1 or 2 sentence punchy description for this business. 
Focus exclusively on the positive sentiments and ignore any complaints or negative points.
In true Zagat style, weave short direct quotes (1-3 words) from the reviews into the sentence, enclosing the quoted words in single or double quotes.
Do not add information that is not in the reviews. Keep it extremely brief (max 20-25 words).

Additionally, infer the price tier for this business based on the reviews, similar to Google Maps:
- '$': Cheap / budget-friendly / great value
- '$$': Moderate / standard / expected price
- '$$$': Expensive / high-end / pricey
- '$$$$': Very Expensive / luxury / exclusive

If the reviews do not mention price, affordability, luxury, or value, default to '$$'.

Business Name: ${b.name}
Category: ${b.category}

Positive Reviews:
${reviewsText}
    `;

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'), // Fast and efficient for this task
        schema: z.object({
          description: z.string().describe('The Zagat-style description of the business'),
          priceTier: z.enum(['$', '$$', '$$$', '$$$$']).describe('The inferred price tier')
        }),
        prompt: prompt,
      });

      // Clean up the text just in case it added surrounding quotes
      let cleanText = object.description.trim();
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
          cleanText = cleanText.substring(1, cleanText.length - 1);
      }

      console.log(`Zagat Description: ${cleanText}`);
      console.log(`Price Tier: ${object.priceTier}`);

      await prisma.business.update({
        where: { id: b.id },
        data: { 
          description: cleanText,
          priceTier: object.priceTier
        }
      });
      updatedCount++;
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`Error generating for ${b.name}:`, err);
    }
  }

  console.log(`\nComplete! Updated ${updatedCount} business descriptions.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
