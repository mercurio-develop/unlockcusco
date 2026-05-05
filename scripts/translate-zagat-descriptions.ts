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

async function main() {
  console.log('Fetching businesses to translate descriptions...');
  
  // We want to translate all businesses that have a description set.
  // To avoid hitting the DB unnecessarily, we can fetch all and check if they have description.
  const businesses = await prisma.business.findMany({
    where: {
      description: {
        not: ""
      }
    }
  });

  console.log(`Found ${businesses.length} businesses with descriptions.`);
  let updatedCount = 0;

  for (const b of businesses) {
    if (!b.description || b.description.length < 5) continue;

    const originalDescription = b.description;
    
    // Quick check if it looks like it might contain Spanish or just to be safe, pass them all
    console.log(`\nTranslating: ${b.name}`);

    const prompt = `
You are an expert translator and travel writer.
The following is a Zagat-style description of a business. It may contain Spanish words, phrases, or quotes.
Translate the ENTIRE description into natural, idiomatic English. 
Maintain the Zagat style: short, punchy, 1-2 sentences, and keep the quoted phrases (translate the quotes to English as well, keeping the quote marks).
If the description is already 100% English, just output it exactly as is.

Original Description:
${originalDescription}
    `;

    try {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'), 
        prompt: prompt,
      });

      // Clean up the text just in case it added surrounding quotes
      let cleanText = text.trim();
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
          cleanText = cleanText.substring(1, cleanText.length - 1);
      }

      console.log(`Original : ${originalDescription}`);
      console.log(`Translated: ${cleanText}`);

      await prisma.business.update({
        where: { id: b.id },
        data: { description: cleanText }
      });
      updatedCount++;
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.error(`Error translating for ${b.name}:`, err);
    }
  }

  console.log(`\nComplete! Translated ${updatedCount} business descriptions.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
