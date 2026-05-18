import { PrismaClient } from '@prisma/client';
import { generateText, Output } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

const enrichmentSchema = z.object({
  tagline: z.string().describe("A catchy, 1-sentence tagline for the business."),
  description: z.string().describe("A rich, Zagat-style description (3-4 sentences) capturing the vibe, amenities, and unique appeal of the retreat center."),
  reviews: z.array(z.object({
    author: z.string(),
    rating: z.number().min(4).max(5),
    text: z.string().describe("A realistic, 2-3 sentence review from a guest who attended a retreat or stayed here.")
  })).length(3)
});

async function main() {
  console.log('✨ Enriching Retreat Centers with descriptions and reviews...');

  const targetNames = [
    "Willka T'ika",
    "Samadhi Sacred Valley",
    "Pacha Munay Wellness Resort",
    "Nidra Wasi",
    "Sach'a Munay"
  ];

  for (const name of targetNames) {
    const business = await prisma.business.findFirst({
      where: { name: { contains: name } }
    });

    if (!business) {
      console.log(`⚠️  Could not find: ${name}`);
      continue;
    }

    // Only enrich if it doesn't have reviews yet
    const reviewCount = await prisma.review.count({ where: { businessId: business.id } });
    if (reviewCount > 0) {
      console.log(`⏭️  Skipping ${name} (already has reviews)`);
      continue;
    }

    console.log(`Generating content for ${name}...`);

    try {
      const { output } = await generateText({
        model: google('gemini-2.5-pro'),
        output: Output.object({ schema: enrichmentSchema }),
        prompt: `You are an expert travel writer for UnlockCusco, an upscale local business directory in the Sacred Valley of Peru.
Write a compelling, evocative Zagat-style description and 3 realistic guest reviews for the following retreat center.

Business Name: ${business.name}
Location: ${business.locationSlug}
Current basic info: ${business.description}`
      });

      if (output) {
        // Update business
        await prisma.business.update({
          where: { id: business.id },
          data: {
            tagline: output.tagline,
            description: output.description,
            reviewsCount: output.reviews.length,
            rating: output.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / output.reviews.length
          }
        });

        // Create reviews
        for (const review of output.reviews) {
          await prisma.review.create({
            data: {
              businessId: business.id,
              author: review.author,
              rating: review.rating,
              text: review.text
            }
          });
        }
        console.log(`✅ Enriched ${name} with description & ${output.reviews.length} reviews.`);
      }
    } catch (e) {
      console.error(`❌ Failed to enrich ${name}:`, e);
    }
  }

  console.log('\n🎉 Enrichment complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
