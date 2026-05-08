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

// The user's explicit local half-day recommendations
const userHardcodedTours = [
  {
    title: "Urquillos to Chinchero Hike",
    tagline: "Hike the ancient path up to Chinchero.",
    sector: "URUBAMBA",
    pace: "FAST",
    basePriceUsd: 0,
    tags: "hike, ruins, off-the-beaten-path, half-day, free",
    description: "Start in the quiet town of Urquillos and hike the steep but beautiful ancient Inca trail up the mountain to reach the town of Chinchero. A fantastic physical challenge with rewarding views.",
    transportTip: "Take a colectivo to Urquillos paradero. Hike ends in Chinchero where you can easily catch a bus back to Urubamba or Cusco."
  },
  {
    title: "Arin Waterfall & ALTO Cafe",
    tagline: "A refreshing waterfall hike followed by creative Asian-inspired food.",
    sector: "EAST_VALLEY",
    pace: "SLOW",
    basePriceUsd: 15,
    tags: "waterfall, cafe, relax, half-day",
    description: "Take a gentle walk up to the beautiful Catarata de Arin. After enjoying the mist and nature, stroll back down to the pista and grab lunch at ALTO Cafe for fresh doughnuts and pad Thai.",
    transportTip: "Take any Urubamba-Calca colectivo and ask to be dropped at the 2nd Paradero in Arin."
  },
  {
    title: "Yucay Terraces, Molino & Sonesta Breakfast",
    tagline: "A luxurious breakfast followed by an exploration of grand Inca terraces.",
    sector: "URUBAMBA",
    pace: "SLOW",
    basePriceUsd: 20,
    tags: "breakfast, terraces, history, relax, half-day",
    description: "Start your morning with a hearty breakfast at the beautiful Sonesta Hotel cafe. Afterwards, walk up into the massive Inca agricultural terraces of Yucay and explore the ruins of the old Molino (mill).",
    transportTip: "Yucay is just 10 minutes from Urubamba via taxi or a S/1 colectivo."
  },
  {
    title: "Urubamba Chullpas & Kampu Lunch",
    tagline: "Hike to ancient tombs and enjoy the best curry in town.",
    sector: "URUBAMBA",
    pace: "BALANCED",
    basePriceUsd: 12,
    tags: "ruins, food, hike, half-day",
    description: "Hike up the valley side in Urubamba to explore 'Las Chullpas', ancient pre-Inca tombs built into the cliffside. Head back down to town and treat yourself to a massive bowl of curry at Kampu.",
    transportTip: "The trailhead is walkable from the center of Urubamba."
  },
  {
    title: "Huayna Capac Palace & Migas del Valle",
    tagline: "Inca royal history paired with sourdough pizza.",
    sector: "URUBAMBA",
    pace: "SLOW",
    basePriceUsd: 15,
    tags: "ruins, pizza, history, half-day",
    description: "Explore the atmospheric, un-restored ruins of Inca Emperor Huayna Capac's palace on the edge of Urubamba. Afterwards, walk over to Migas del Valle for amazing sourdough bread, coffee, or pizza.",
    transportTip: "Located on the outskirts of Urubamba; completely walkable or a S/3 mototaxi from the plaza."
  },
  {
    title: "Huayoccari & Yanacocha Lake",
    tagline: "A steep ascent to a black lake, with a quiet town lunch.",
    sector: "URUBAMBA",
    pace: "FAST",
    basePriceUsd: 10,
    tags: "hike, lake, intense, half-day",
    description: "Tackle the steep, challenging hike up to Yanacocha (Black Lake) nestled high in the mountains above Huayoccari. Descend back to the peaceful village for a well-earned local lunch.",
    transportTip: "Take a colectivo to the Huayoccari paradero between Urubamba and Calca."
  },
  {
    title: "Huaran Quebrada & Viva Peru Cafe",
    tagline: "A stunning valley walk ending with homemade ice cream.",
    sector: "EAST_VALLEY",
    pace: "BALANCED",
    basePriceUsd: 12,
    tags: "hike, cafe, nature, half-day",
    description: "Walk up the scenic 'quebrada' (ravine) of Huaran, following the river deep into the mountains past local farms. Finish your walk at Viva Peru Cafe for a falafel bowl and their famous homemade ice cream.",
    transportTip: "Drop off at Paradero Verde in Huaran via any Urubamba-Calca colectivo."
  },
  {
    title: "Calca Market & Garden Lunch",
    tagline: "Bustling local commerce and a serene garden retreat.",
    sector: "EAST_VALLEY",
    pace: "SLOW",
    basePriceUsd: 8,
    tags: "market, culture, food, half-day",
    description: "Dive into the authentic, bustling atmosphere of the Calca produce market—one of the best in the valley. Afterwards, escape the noise for a peaceful lunch at a local garden cafe like Del Campo or Pisonay.",
    transportTip: "Calca is a major hub, easily accessible by colectivo from Urubamba, Pisac, or Cusco."
  },
  {
    title: "Chinchero Market to Huaypo Lake Trout",
    tagline: "Textile traditions and fresh lakeside dining.",
    sector: "URUBAMBA",
    pace: "BALANCED",
    basePriceUsd: 25,
    tags: "market, food, lake, half-day",
    description: "Spend the morning admiring the textiles and colors of the Chinchero market. Then, catch a ride out to the stunning Piuray or Huaypo lake and eat freshly caught trout cooked right on the shore.",
    transportTip: "Requires a taxi from Chinchero to the lake, which can be negotiated in the plaza."
  },
  {
    title: "Abra Malaga Pass Hot Chocolate",
    tagline: "High-altitude views and the world's best hot chocolate.",
    sector: "OTHER",
    pace: "SLOW",
    basePriceUsd: 15,
    tags: "views, drive, food, half-day",
    description: "Take a spectacular drive up the winding mountain road past Ollantaytambo to the high pass of Abra Malaga. Bundle up, take in the glacier views, and stop at the tiny roadside shop for what locals swear is the best hot chocolate of your life.",
    transportTip: "Hire a taxi from Ollantaytambo for a round trip to the pass."
  }
];

const tourSchema = z.object({
  tours: z.array(z.object({
    title: z.string().describe("Short, standalone title for this activity (e.g. 'Pisac Ruins & Altar Hummus')."),
    tagline: z.string().describe("A catchy 1-sentence tagline."),
    sector: z.enum(["EAST_VALLEY", "URUBAMBA", "MACHU_PICCHU", "CUSCO_CITY", "OTHER"]),
    pace: z.enum(["FAST", "BALANCED", "SLOW"]),
    basePriceUsd: z.number().describe("Estimated price per person in USD (usually 5-25)."),
    tags: z.string().describe("CSV tags like 'ruins, food, relax, half-day, local-vibe'"),
    description: z.string().describe("A vivid description combining a walk/ruin/activity with a local cafe/restaurant stop. 2-3 sentences."),
    transportTip: z.string().describe("How to get there independently (e.g., walk, colectivo, S/5 taxi)."),
  }))
});

async function main() {
  console.log('🚀 Seeding Half-Day Local Vibes...');

  const dataPath = path.join(process.cwd(), 'research', 'sacred-valley-expats.json');
  let expatText = "";
  try {
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const articles = JSON.parse(fileContent);
    // Combine text from food and ruins articles to inspire Gemini
    expatText = articles
      .filter((a: any) => a.title.includes('Ruins') || a.title.includes('Eat') || a.title.includes('Cafes'))
      .map((a: any) => a.content)
      .join('\\n\\n')
      .substring(0, 20000); // limit context size
  } catch (e) {
    console.log("Could not load expats JSON, proceeding with just hardcoded tours.");
  }

  let generatedTours: any[] = [];
  
  if (expatText) {
    console.log("Generating 3 additional expat-inspired half-day combos using Gemini...");
    try {
      const { output } = await generateText({
        model: google('gemini-2.5-pro'),
        output: Output.object({ schema: tourSchema }),
        prompt: `You are a local expat in the Sacred Valley of Peru.
The user wants "half-day local vibes"—experiences that combine a cool walk, a lesser-known ruin, or an interesting town feature with a stop at a specific local cafe or restaurant for lunch/breakfast.

Here is some background text from local expat blogs:
${expatText}

Generate exactly 3 NEW half-day itineraries that combine an activity and a food stop in towns like Pisac, Urubamba, or Calca. Make them sound like insider secrets.`
      });
      if (output && output.tours) {
        generatedTours = output.tours;
        console.log(`Generated ${generatedTours.length} new AI tours.`);
      }
    } catch (err) {
      console.error("Failed to generate additional tours:", err);
    }
  }

  const allTours = [...userHardcodedTours, ...generatedTours];
  let added = 0;

  for (const tour of allTours) {
    const existing = await prisma.tourPackage.findFirst({ where: { title: tour.title } });
    if (existing) {
      console.log(`   ↩️  Skipping duplicate: ${tour.title}`);
      continue;
    }
    
    await prisma.tourPackage.create({
      data: {
        title: tour.title,
        tagline: tour.tagline,
        sector: tour.sector,
        pace: tour.pace,
        basePriceUsd: tour.basePriceUsd,
        tags: `${tour.tags}, half-day, local-vibe`,
        description: `${tour.description}\n\n**Getting there:** ${tour.transportTip}`,
        packageType: 'HALF_DAY',
      },
    });
    console.log(`   ✅ Saved: ${tour.title}`);
    added++;
  }

  console.log(`\n🎉 Seeded ${added} local half-day vibes!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());