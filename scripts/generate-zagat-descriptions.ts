import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import * as dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const prisma = new PrismaClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const MIN_REVIEWS = 5;

async function main() {
  console.log(`Fetching businesses with ${MIN_REVIEWS}+ reviews...`);
  const businesses = await prisma.business.findMany({
    where: {
      description: "",
      reviews: {
        some: {}
      }
    },
    include: {
      reviews: true
    }
  });

  const filtered = businesses.filter(b => b.reviews.length >= MIN_REVIEWS);
  console.log(`Found ${businesses.length} with any reviews. Processing ${filtered.length} with ${MIN_REVIEWS}+.`);
  let updatedCount = 0;

  for (const b of filtered) {
    if (!b.reviews || b.reviews.length === 0) continue;

    console.log(`\nProcessing: ${b.name} (${b.reviews.length} reviews)`);
    const reviewsText = b.reviews.map(r => `- ${r.text}`).join('\n');

    const prompt = `
You are a concise, expert travel and food critic writing in the classic Zagat style.
Based ONLY on the following customer reviews, write a 1 or 2 sentence punchy description for this business. 
In true Zagat style, weave short direct quotes (1-3 words) from the reviews into the sentence, enclosing the quoted words in single or double quotes.
Do not add information that is not in the reviews. Keep it extremely brief (max 20-25 words).

Business Name: ${b.name}
Category: ${b.category}

Reviews:
${reviewsText}
    `;

    try {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'), // Fast and efficient for this task
        prompt: prompt,
      });

      // Clean up the text just in case it added surrounding quotes
      let cleanText = text.trim();
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
          cleanText = cleanText.substring(1, cleanText.length - 1);
      }

      console.log(`Zagat Description: ${cleanText}`);

      await prisma.business.update({
        where: { id: b.id },
        data: { description: cleanText }
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
