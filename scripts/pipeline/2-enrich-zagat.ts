import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

async function main() {
  console.log("🚀 Starting Zagat Enrichment Process...");

  const targets = await prisma.business.findMany({
    where: {
      OR: [
        { description: "" },
        { descriptionEs: null }
      ]
    },
    include: { reviews: true }
  });

  console.log(`📊 Found ${targets.length} businesses requiring Zagat descriptions.`);

  let updateCount = 0;

  for (const b of targets) {
    console.log(`\n📝 Processing "${b.name}"`);
    
    let description = b.description;
    let descriptionEs = b.descriptionEs;
    
    const hasReviews = b.reviews.length > 0;
    const reviewsText = b.reviews.slice(0, 5).map(r => `- ${r.text}`).join('\n');

    try {
      if (description === "") {
        const promptEn = hasReviews 
          ? `You are an expert travel critic writing in the classic Zagat style. 
             Based ONLY on these reviews, write a 1 or 2 sentence punchy description for "${b.name}".
             Weave short direct quotes from the reviews enclosing the quoted words in single quotes.
             Keep it under 25 words. Reviews: \n${reviewsText}`
          : `You are an expert travel critic writing in the classic Zagat style.
             Write a 1-sentence punchy description for "${b.name}" (${b.category}). Keep it under 25 words.`;

        const { text } = await generateText({
          model: google('gemini-2.5-flash'),
          prompt: promptEn,
        });
        description = text.trim().replace(/^"|"$/g, '');
        console.log(`   💬 EN: ${description}`);
      }

      if (!descriptionEs) {
        const promptEs = `Translate the following Zagat-style review to Spanish, keeping it punchy and under 25 words: "${description}"`;
        const { text } = await generateText({
          model: google('gemini-2.5-flash'),
          prompt: promptEs,
        });
        descriptionEs = text.trim().replace(/^"|"$/g, '');
        console.log(`   💬 ES: ${descriptionEs}`);
      }

      await prisma.business.update({
        where: { id: b.id },
        data: { description, descriptionEs }
      });
      updateCount++;

      await new Promise(r => setTimeout(r, 200));
    } catch (err: any) {
      console.error(`   ❌ Gemini error: ${err.message}`);
    }
  }

  console.log(`\n✅ Zagat Enrichment complete! Updated ${updateCount} businesses.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
