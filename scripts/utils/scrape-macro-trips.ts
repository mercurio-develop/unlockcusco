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

// URLs of full multi-day Peru itineraries
const URLS = [
  'https://www.alpacaexpeditions.com/classic-inca-trail-4-days-3-nights/',
  'https://trexperienceperu.com/inca-trail/classic-inca-trail-4-days',
  'https://www.llamapath.com/inca-trail-tours/classic-inca-trail-4-days/',
  'https://www.andeantreks.com/en/classic-inca-trail-4-days/',
  'https://www.peruforless.com/peru-tours/cusco-sacred-valley-machu-picchu/',
  'https://www.inca-trail-peru.org/inca-trail-4-days/',
  'https://www.incatrailexpeditions.com/classic-inca-trail-4-days/',
  'https://www.apus-peru.com/en/trek/classic-inca-trail-4-days/',
];

const USER_EXAMPLE_TEXT = `Day 1
Peru – Lima
Arrive at your hotel in Lima after your international flight and recharge your energy for your city tour!

Day 2
Lima – Cusco - Sacred Valley
Welcome to Cusco! Explore the Textile House Museum and its living traditions and Pisac Inca neighborhood.

Day 3
Sacred Valley
Explore the last Inca fortress of Ollantaytambo, the Inca salt mines of Maras, and the circular terraces of Moray.

Day 4
Sacred Valley - Machu Picchu - Cusco
Conquest the most incredible Inca citadel, Machu Picchu, on an unforgettable day!

Day 5
Cusco
Explore the magical city of Cusco, the enigmatic heart of the Inca Empire.

Day 6
Cusco – Lima
Say goodbye to Peru in the best way with us!`;

async function extractPageText(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log(`\n🌐 Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Remove unnecessary elements to reduce token usage
    await page.evaluate(() => {
      document.querySelectorAll('script, style, nav, footer, iframe, img, svg').forEach(el => el.remove());
    });
    
    // Extract the remaining text using textContent to capture accordions
    const text = await page.evaluate(() => document.body.textContent || "");
    await browser.close();
    return text.substring(0, 40000); 
  } catch (error) {
    console.error(`❌ Failed to load ${url}:`, error);
    await browser.close();
    return "";
  }
}

async function processItinerary(text: string, sourceName: string) {
  console.log(`🧠 Extracting macro-trip details for ${sourceName} using Gemini...`);
  try {
    const { output: tripData } = await generateText({
      model: google('gemini-2.5-pro'),
      output: Output.object({ schema: z.object({
        tripTitle: z.string().describe("The name of the multi-day tour package (e.g. 'Essential Peru 6 Days')."),
        narrativeArc: z.string().describe("A short 1-2 sentence summary of the overall trip."),
        baseCampStrategy: z.string().describe("Where the traveler sleeps each night (e.g., '1N Lima, 2N Cusco, 1N Aguas Calientes')."),
        vibeTags: z.string().describe("Comma-separated tags like 'culture, adventure, classic'"),
        agencyName: z.string().describe("The agency providing this tour. Use 'Vallecito Curated' if not specified."),
        days: z.array(z.object({
          dayNumber: z.number(),
          sleepTown: z.string().describe("Town where they sleep tonight (e.g., 'Cusco', 'Lima', 'Aguas Calientes')."),
          dayTheme: z.string().describe("The title or theme of this day (e.g., 'Sacred Valley Exploration')."),
          packageTitle: z.string().describe("A standalone title for this day's activity to save as a modular Lego Brick."),
          packageTagline: z.string().describe("A catchy 1-sentence tagline for this day's activity."),
          packageSector: z.enum(["EAST_VALLEY", "URUBAMBA", "MACHU_PICCHU", "CUSCO_CITY", "LIMA", "OTHER"]),
          packagePace: z.enum(["FAST", "BALANCED", "SLOW"]),
          packageDescription: z.string().describe("Detailed description of what happens on this day."),
          packagePriceUsd: z.number().describe("Estimated standalone price for this day's activity in USD (guess 50-150 if not provided)."),
          packageDifficulty: z.string().describe("Difficulty level (e.g., 'Moderate', 'Easy')."),
          packageInclusions: z.array(z.string()).describe("List of items included in this day's activity."),
          packageExclusions: z.array(z.string()).describe("List of items NOT included."),
          packageHighlights: z.array(z.string()).describe("3-4 bullet points of the main highlights for this day."),
          packageRequirements: z.array(z.string()).describe("Items the traveler must bring (e.g., 'Water bottle', 'Sunscreen')."),
          packageTags: z.string().describe("Tags for this specific day's activity (e.g., 'ruins, market').")
        }))
      }) }),
      prompt: `Extract the full day-by-day itinerary from the following text.\n\nSource: ${sourceName}\n\nText:\n${text}`
    });
    
    console.log(`✅ Extracted Trip: ${tripData.tripTitle} (${tripData.days.length} days) by ${tripData.agencyName}`);
    if (tripData.days.length === 0) {
      console.log(`⚠️ Warning: 0 days extracted. Text might be malformed or hidden.`);
      return;
    }
    
    let agency = await prisma.agency.findFirst({
      where: { name: tripData.agencyName }
    });
    
    if (!agency) {
      agency = await prisma.agency.create({
        data: {
          slug: tripData.agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: tripData.agencyName,
          contactPhone: "+51 999 999 999",
          commissionRate: 0.05
        }
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + tripData.days.length);

    const trip = await prisma.trip.create({
      data: {
        agencyId: agency.id,
        tripTitle: tripData.tripTitle,
        startDate: startDate,
        endDate: endDate,
        paxCount: 2,
        baseCampStrategy: tripData.baseCampStrategy,
        status: "DRAFT",
        isVerifiedTemplate: true,
        templateVibeTags: tripData.vibeTags,
      }
    });

    console.log(`   🧱 Creating ${tripData.days.length} Lego Bricks (TourPackages) for each day...`);

    for (const day of tripData.days) {
      if (day.packageDescription.length < 20 || day.dayTheme.toLowerCase().includes('departure')) {
         await prisma.tripDay.create({
           data: {
             tripId: trip.id,
             dayNumber: day.dayNumber,
             date: new Date(startDate.getTime() + (day.dayNumber * 86400000)),
             sleepTown: day.sleepTown,
             dayTheme: day.dayTheme,
             guideNotes: day.packageDescription,
           }
         });
         continue;
      }

      const tourPackage = await prisma.tourPackage.create({
        data: {
          agencyId: agency.id,
          title: `${day.packageTitle} (${tripData.agencyName})`,
          tagline: day.packageTagline,
          sector: day.packageSector,
          pace: day.packagePace,
          basePriceUsd: day.packagePriceUsd,
          difficulty: day.packageDifficulty,
          tags: day.packageTags,
          description: day.packageDescription,
          included: JSON.stringify(day.packageInclusions),
          notIncluded: JSON.stringify(day.packageExclusions),
          highlights: JSON.stringify(day.packageHighlights),
          requirements: JSON.stringify(day.packageRequirements),
          durationDays: 1,
          durationStr: "Full day"
        }
      });

      await prisma.tripDay.create({
        data: {
          tripId: trip.id,
          dayNumber: day.dayNumber,
          date: new Date(startDate.getTime() + (day.dayNumber * 86400000)),
          sleepTown: day.sleepTown,
          dayTheme: day.dayTheme,
          tourPackageId: tourPackage.id,
          guideNotes: `Part of the ${tripData.tripTitle} itinerary.`,
        }
      });
    }

    console.log(`   🎉 Successfully saved Trip Template and Lego Bricks to database!\n`);
    
  } catch (error) {
    console.error(`❌ Failed to extract data for ${sourceName}:`, error);
  }
}

async function scrapeAndSeed() {
  console.log('🚀 Starting Macro-Trip Scraper...\n');
  
  // 1. Process User Example Text directly
  await processItinerary(USER_EXAMPLE_TEXT, "User Provided Example 6-Day Itinerary");

  // 2. Process URLs
  for (const url of URLS) {
    const text = await extractPageText(url);
    if (!text) continue;
    await processItinerary(text, url);
  }
  
  console.log('Scraping and seeding complete!');
}

scrapeAndSeed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });