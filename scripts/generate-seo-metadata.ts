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

async function main() {
  const isTestMode = process.argv.includes('--limit');
  const limitIndex = process.argv.indexOf('--limit');
  const limit = isTestMode && limitIndex > -1 ? parseInt(process.argv[limitIndex + 1], 10) : undefined;

  console.log(`Fetching businesses missing SEO metadata...`);

  // Find businesses missing either English or Spanish SEO titles
  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { seoMetaTitle: null },
        { seoMetaTitle: "" },
        { seoMetaTitleEs: null },
        { seoMetaTitleEs: "" }
      ]
    },
    take: limit,
  });

  console.log(`Found ${businesses.length} businesses needing SEO metadata generation.`);

  let updatedCount = 0;

  for (const b of businesses) {
    console.log(`\nGenerating SEO for: ${b.name} (${b.category} in ${b.locationSlug})`);

    const prompt = `
You are an expert SEO copywriter specializing in the travel and hospitality industry for Cusco, the Sacred Valley, and Machu Picchu.
Your task is to write highly optimized SEO Title Tags and Meta Descriptions for the following business.
The content must be written in both English and Spanish.

Target Guidelines:
- English Title (seoMetaTitle): Max 60 characters. Must be catchy, include the business name, and primary keywords (e.g., location, category).
- English Description (seoMetaDesc): Max 160 characters. Action-oriented, highlighting the unique value proposition to increase Click-Through Rate (CTR).
- Spanish Title (seoMetaTitleEs): Max 60 characters. Accurate Spanish translation optimized for search.
- Spanish Description (seoMetaDescEs): Max 160 characters. Compelling Spanish translation targeting local and LATAM tourists.

Business Data:
Name: ${b.name}
Category: ${b.category}
Location: ${b.locationSlug.split('-').join(' ')}
Description / Context: ${b.description || b.tagline || 'A local business in the Sacred Valley region.'}

Return the optimized strings. Do NOT include quotation marks around the strings in your response unless they are part of the text itself.
`;

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'), // Fast and efficient for this task
        schema: z.object({
          seoMetaTitle: z.string().max(65).describe('English SEO Title Tag'),
          seoMetaDesc: z.string().max(165).describe('English SEO Meta Description'),
          seoMetaTitleEs: z.string().max(65).describe('Spanish SEO Title Tag'),
          seoMetaDescEs: z.string().max(165).describe('Spanish SEO Meta Description')
        }),
        prompt: prompt,
      });

      console.log(`[EN] Title: ${object.seoMetaTitle}`);
      console.log(`[EN] Desc:  ${object.seoMetaDesc}`);
      console.log(`[ES] Title: ${object.seoMetaTitleEs}`);
      console.log(`[ES] Desc:  ${object.seoMetaDescEs}`);

      await prisma.business.update({
        where: { id: b.id },
        data: { 
          seoMetaTitle: object.seoMetaTitle,
          seoMetaDesc: object.seoMetaDesc,
          seoMetaTitleEs: object.seoMetaTitleEs,
          seoMetaDescEs: object.seoMetaDescEs
        }
      });
      
      updatedCount++;
      // Sleep slightly to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));

    } catch (error) {
      console.error(`Failed to generate SEO metadata for ${b.name}:`, error);
    }
  }

  console.log(`\nSuccessfully updated SEO metadata for ${updatedCount} businesses.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });