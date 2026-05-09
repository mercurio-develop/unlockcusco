import { PrismaClient } from '@prisma/client';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

async function main() {
  // Find all dining businesses with their reviews
  const businesses = await prisma.business.findMany({
    where: {
      category: { in: ['DINING', 'Dining', 'dining'] },
      reviews: { some: {} } // Only get those with at least one review
    },
    include: {
      reviews: true
    }
  });

  console.log(`Found ${businesses.length} dining businesses with reviews to analyze.`);

  let updatedCount = 0;

  for (const biz of businesses) {
    console.log(`\nAnalyzing: ${biz.name}`);
    
    // Combine reviews text
    const reviewTexts = biz.reviews.map(r => r.text).join('\n---\n');
    
    // Combine context
    const contextInfo = `
    Business Name: ${biz.name}
    Description: ${biz.description || biz.tagline || "N/A"}
    Reviews:
    ${reviewTexts}
    `;

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({
          specialties: z.array(z.string()).describe("A list of 3 to 8 specific signature dishes, popular menu items, or primary food offerings mentioned in the reviews. Keep them short, like 'Lomo Saltado', 'Alpaca Steak', 'Vegan Burgers', 'Sourdough Pizza'."),
          cuisineTags: z.array(z.string()).describe("1 to 3 tags describing the cuisine style, e.g., 'Peruvian', 'Fusion', 'Vegan', 'Cafe'.")
        }),
        prompt: `Extract the most popular dishes and cuisine styles for this restaurant based on the following reviews and business info. Focus only on the food and drinks mentioned.\n\n${contextInfo}`
      });

      console.log(`   -> Specialties: ${object.specialties.join(', ')}`);
      console.log(`   -> Cuisine: ${object.cuisineTags.join(', ')}`);

      // We will save specialties directly to the specialties field
      // And we can embed cuisineTags into the featuresJson or just keep specialties
      
      const existingFeatures = JSON.parse(biz.featuresJson || '[]');
      // Add cuisine tags to features if not already there
      const updatedFeatures = Array.from(new Set([...existingFeatures, ...object.cuisineTags]));

      await prisma.business.update({
        where: { id: biz.id },
        data: {
          specialties: JSON.stringify(object.specialties),
          featuresJson: JSON.stringify(updatedFeatures)
        }
      });
      
      updatedCount++;
    } catch (err: any) {
      console.error(`   ❌ Failed to process ${biz.name}: ${err.message}`);
    }
  }

  console.log(`\n✨ Successfully updated ${updatedCount} businesses with menu/specialty data from reviews.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
