import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { generateText, Output } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

const tourSchema = z.object({
  tours: z.array(z.object({
    title: z.string().describe("Short, standalone title for this activity (e.g. 'Temple of the Moon Hike')."),
    sector: z.enum(["EAST_VALLEY", "URUBAMBA", "MACHU_PICCHU", "CUSCO_CITY", "LIMA", "OTHER"]),
    pace: z.enum(["FAST", "BALANCED", "SLOW"]),
    basePriceUsd: z.number().describe("Estimated price per person in USD. Use 5-15 for self-guided, 30-80 for guided day tours. Use 0 if completely free."),
    tags: z.string().describe("CSV tags like 'ruins, solo, half-day, off-the-beaten-path, free'"),
    description: z.string().describe("Practical description: how to get there, what to do, entry cost, solo-friendliness level. 2-4 sentences."),
    soloFriendly: z.boolean().describe("True if a tourist alone can do this without a guide or group."),
    transportTip: z.string().describe("How to get there independently: colectivo route, taxi cost, walking distance, etc."),
  }))
});

async function main() {
  console.log('🚀 Extracting Off-The-Beaten-Path Ruins from Sacred Valley Expats...');

  const dataPath = path.join(process.cwd(), 'research', 'sacred-valley-expats.json');
  const fileContent = await fs.readFile(dataPath, 'utf-8');
  const articles = JSON.parse(fileContent);

  const ruinsArticle = articles.find((a: any) => a.title.includes('Ruins Off The Tourist Trail'));
  
  if (!ruinsArticle) {
    console.error('❌ Could not find the ruins article.');
    return;
  }

  console.log(`Analyzing: ${ruinsArticle.title}...`);

  const { output } = await generateText({
    model: google('gemini-2.5-pro'),
    output: Output.object({ schema: tourSchema }),
    prompt: `You are extracting travel experiences from an expat blog article.
Extract all distinct archaeological sites or ruins mentioned in the following text as standalone day-tour or half-day activities. Focus on creating practical, standalone itinerary items.

Article Title: ${ruinsArticle.title}

Text:
${ruinsArticle.content}`
  });

  if (!output || output.tours.length === 0) {
    console.log(`⚠️  No tours found.`);
    return;
  }

  console.log(`✅ Found ${output.tours.length} experiences to seed.`);
  
  for (const tour of output.tours) {
    const existing = await prisma.tourPackage.findFirst({ where: { title: tour.title } });
    if (existing) {
      console.log(`   ↩️  Skipping duplicate: ${tour.title}`);
      continue;
    }
    
    await prisma.tourPackage.create({
      data: {
        title: tour.title,
        tagline: tour.description.substring(0, 100) + '...',
        sector: tour.sector,
        pace: tour.pace,
        basePriceUsd: tour.basePriceUsd,
        tags: `${tour.tags}, solo:${tour.soloFriendly ? 'yes' : 'no'}, off-the-beaten-path`,
        description: `${tour.description}\n\n**Getting there:** ${tour.transportTip}`,
        packageType: 'SINGLE_DAY',
      },
    });
    console.log(`   ✅ Saved: ${tour.title}`);
  }

  console.log('\n🎉 Done seeding experiences!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());