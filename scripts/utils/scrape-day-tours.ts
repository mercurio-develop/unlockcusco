import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { generateText, Output } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

// Day tours a solo tourist can do independently (public bus, taxi, walkable)
const URLS = [
  'https://www.willkaperutours.com/en/tours/sacred-valley',
  'https://www.willkaperutours.com/en/tours/maras-moray-salt-mines',
  'https://trexperienceperu.com/cusco-tours/cusco-city-tour',
  'https://www.alpacaexpeditions.com/cusco-city-tour/',
  'https://www.andeantreks.com/en/sacred-valley-tour/',
  'https://www.salkantay.org/en/sacred-valley-tour/',
  'https://trexperienceperu.com/sacred-valley/sacred-valley-tour',
];

// Hardcoded solo-friendly activities to seed directly (no scraping needed)
const SOLO_EXAMPLES = [
  {
    title: 'Pisac Inca Ruins + Market (Self-Guided)',
    sector: 'EAST_VALLEY' as const,
    pace: 'SLOW' as const,
    basePriceUsd: 15,
    tags: 'ruins, market, solo, public-bus, half-day',
    description: 'Take a public colectivo from Cusco Av. Tullumayo (S/2.50) to Pisac. Walk up to the Inca terraces and temple complex (entrance with BTC ticket). Descend to the artisan market for lunch and handicrafts. Easy half-day, no guide needed.',
  },
  {
    title: 'Cusco Plaza de Armas + Cathedral (Self-Guided)',
    sector: 'CUSCO_CITY' as const,
    pace: 'SLOW' as const,
    basePriceUsd: 10,
    tags: 'cathedral, plaza, solo, walking, colonial, half-day',
    description: 'Walk the historic center from San Blas neighborhood down to the Plaza de Armas. Enter the Cathedral (included in Cusco Tourism Circuit ticket). Grab lunch at Marcelo Batata or a local menu on Plateros. Fully walkable from any Cusco hotel.',
  },
  {
    title: 'Sacsayhuaman Inca Fortress (Self-Guided)',
    sector: 'CUSCO_CITY' as const,
    pace: 'BALANCED' as const,
    basePriceUsd: 20,
    tags: 'ruins, inca, solo, walking, views, half-day',
    description: '30-minute walk uphill from Plaza de Armas or quick S/5 taxi. Massive Inca military complex with panoramic Cusco views. Use BTC (Boleto Turístico del Cusco) for entry. Combine with nearby Qenqo and Puca Pucara in the same morning.',
  },
  {
    title: 'Ollantaytambo Fortress Town (Self-Guided)',
    sector: 'URUBAMBA' as const,
    pace: 'BALANCED' as const,
    basePriceUsd: 20,
    tags: 'ruins, inca, living-city, solo, colectivo, full-day',
    description: 'Colectivo from Cusco (S/10, 1.5h) to Ollantaytambo. Explore the only living Inca town — original street grid intact. Climb the Sun Temple terraces (BTC ticket). Watch the Pinkuylluna granaries across the valley. Train hub for Machu Picchu — easy onward connection.',
  },
  {
    title: 'San Pedro Market Morning (Self-Guided)',
    sector: 'CUSCO_CITY' as const,
    pace: 'SLOW' as const,
    basePriceUsd: 5,
    tags: 'market, food, local, solo, free, morning',
    description: 'Free entry. Two blocks from Plaza de Armas. Try chicha morada, fresh juices, and a S/5 set breakfast at the market stalls. Watch locals shop for herbs, textiles, and produce. Best before 10am. No ticket needed.',
  },
  {
    title: 'Moray Circular Terraces + Maras Salt Mines (Guided Day)',
    sector: 'URUBAMBA' as const,
    pace: 'BALANCED' as const,
    basePriceUsd: 45,
    tags: 'ruins, salt-mines, agriculture, half-day, small-group',
    description: 'Shared minivan tour from Cusco (departs 8am). Moray agricultural amphitheater — Inca microclimate experiment site. Then 3km downhill walk or taxi to Maras salt pans (no BTC needed). Back by 2pm. Small-group format, no big bus.',
  },
];

const tourSchema = z.object({
  tours: z.array(z.object({
    title: z.string().describe("Short, standalone title for this activity (e.g. 'Pisac Market Half-Day')."),
    sector: z.enum(["EAST_VALLEY", "URUBAMBA", "MACHU_PICCHU", "CUSCO_CITY", "LIMA", "OTHER"]),
    pace: z.enum(["FAST", "BALANCED", "SLOW"]),
    basePriceUsd: z.number().describe("Estimated price per person in USD. Use 5-30 for self-guided, 30-80 for guided day tours."),
    tags: z.string().describe("CSV tags like 'ruins, solo, half-day, public-bus, free'"),
    description: z.string().describe("Practical description: how to get there, what to do, entry cost, solo-friendliness level. 2-4 sentences."),
    soloFriendly: z.boolean().describe("True if a tourist alone can do this without a guide or group."),
    transportTip: z.string().describe("How to get there independently: colectivo route, taxi cost, walking distance, etc."),
  }))
});

async function extractPageText(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log(`\n🌐 Scraping ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      document.querySelectorAll('script, style, nav, footer, iframe, img, svg').forEach(el => el.remove());
    });
    const text = await page.evaluate(() => document.body.textContent || '');
    await browser.close();
    return text.substring(0, 30000);
  } catch (error) {
    console.error(`❌ Failed: ${url}`);
    await browser.close();
    return '';
  }
}

async function extractToursFromText(text: string, source: string) {
  console.log(`🧠 Extracting day tours from ${source}...`);
  try {
    const { output } = await generateText({
      model: google('gemini-2.5-pro'),
      output: Output.object({ schema: tourSchema }),
      prompt: `You are building a database of solo-friendly day tours and activities in Cusco and the Sacred Valley of Peru.

Extract all distinct day-tour activities from the following page text. Focus on:
- Things a solo traveler can do without needing a large group
- Activities that are half-day or full-day (NOT multi-day treks)
- Include transport tips so a tourist can figure it out independently
- Realistic USD prices per person

Source: ${source}

Text:
${text}`,
    });

    if (!output || output.tours.length === 0) {
      console.log(`⚠️  No tours found from ${source}`);
      return;
    }

    console.log(`✅ Found ${output.tours.length} tours from ${source}`);
    for (const tour of output.tours) {
      const existing = await prisma.tourPackage.findFirst({ where: { title: tour.title } });
      if (existing) {
        console.log(`   ↩️  Skipping duplicate: ${tour.title}`);
        continue;
      }
      await prisma.tourPackage.create({
        data: {
          title: tour.title,
          sector: tour.sector,
          pace: tour.pace,
          basePriceUsd: tour.basePriceUsd,
          tags: `${tour.tags}, solo:${tour.soloFriendly ? 'yes' : 'no'}, transport:${tour.transportTip.slice(0, 60)}`,
          description: `${tour.description} | Getting there: ${tour.transportTip}`,
        },
      });
      console.log(`   ✅ Saved: ${tour.title} ($${tour.basePriceUsd})`);
    }
  } catch (err) {
    console.error(`❌ Extraction failed for ${source}:`, err);
  }
}

async function main() {
  console.log('🚀 Day Tour Scraper — Solo & Valley Focus\n');

  // 1. Seed hardcoded solo examples directly
  console.log('📌 Seeding hardcoded solo-friendly examples...');
  for (const tour of SOLO_EXAMPLES) {
    const existing = await prisma.tourPackage.findFirst({ where: { title: tour.title } });
    if (existing) {
      console.log(`   ↩️  Skipping duplicate: ${tour.title}`);
      continue;
    }
    await prisma.tourPackage.create({ data: tour });
    console.log(`   ✅ Saved: ${tour.title}`);
  }

  // 2. Scrape tour operator pages
  for (const url of URLS) {
    const text = await extractPageText(url);
    if (!text) continue;
    await extractToursFromText(text, url);
  }

  console.log('\n✅ Done. Day tour bricks seeded.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
