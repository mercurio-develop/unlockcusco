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

async function main() {
  const missing = await prisma.business.findMany({
    where: { description: "" }
  });

  console.log(`Processing ${missing.length} missing businesses without positive reviews...`);

  for (const b of missing) {
    console.log(`Generating for ${b.name}...`);
    const prompt = `
You are a concise, expert travel and food critic.
Write a 1 or 2 sentence punchy description for this business based on its name and category.
Keep it extremely brief (max 20-25 words).
Do NOT mention that you don't have enough reviews. Just make a reasonable, flattering assumption about a place of this name and category in the Sacred Valley, Peru.

Additionally, infer the price tier ('$', '$$', '$$$', '$$$$'). Default to '$$' if unsure.

Business Name: ${b.name}
Category: ${b.category}
Location: ${b.locationSlug}
    `;

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({
          description: z.string(),
          priceTier: z.enum(['$', '$$', '$$$', '$$$$'])
        }),
        prompt: prompt,
      });

      let cleanText = object.description.trim();
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
          cleanText = cleanText.substring(1, cleanText.length - 1);
      }

      console.log(`Desc: ${cleanText}`);
      console.log(`Price: ${object.priceTier}`);

      await prisma.business.update({
        where: { id: b.id },
        data: { 
          description: cleanText,
          priceTier: object.priceTier
        }
      });
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(err);
    }
  }
}
main().finally(() => prisma.$disconnect());
