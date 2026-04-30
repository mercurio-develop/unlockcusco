import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

// A list of popular trekking packages to scrape
const URLS = [
  'https://www.willkaperutours.com/en/tours/maras-moray-salt-mines',
  'https://www.willkaperutours.com/en/tours/rainbow-mountain-peru',
  'https://trexperienceperu.com/rainbow-mountain/rainbow-mountain-tour-1-day',
  'https://www.alpacaexpeditions.com/rainbow-mountain-peru/',
  'https://www.salkantay.org/en/rainbow-mountain-tour-1-day/'
];

async function extractPageText(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Remove unnecessary elements to reduce token usage
    await page.evaluate(() => {
      document.querySelectorAll('script, style, nav, footer, iframe, img, svg').forEach(el => el.remove());
    });
    
    // Extract the remaining text
    const text = await page.evaluate(() => document.body.innerText);
    await browser.close();
    return text.substring(0, 30000); // Keep within a reasonable token limit (30k chars is approx 6k-8k tokens)
  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
    await browser.close();
    return "";
  }
}

async function scrapeAndSeed() {
  console.log('Starting trekking package scraper...');
  
  for (const url of URLS) {
    const text = await extractPageText(url);
    if (!text) continue;
    
    console.log(`Extracting package details from ${url} using Gemini...`);
    try {
      const { object: packageData } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({
          title: z.string().describe("The full name of the trekking package (e.g. 'Classic Inca Trail 4 Days')."),
          tagline: z.string().describe("A catchy 1-sentence tagline for this trek."),
          sector: z.enum(["EAST_VALLEY", "URUBAMBA", "MACHU_PICCHU", "CUSCO_CITY", "OTHER"]).describe("The geographical sector of the trek. Usually MACHU_PICCHU for these trails."),
          pace: z.enum(["FAST", "BALANCED", "SLOW"]).describe("The pace of the trek based on distance and days."),
          basePriceUsd: z.number().describe("The base price in USD per person. Extract the most standard adult price."),
          difficulty: z.string().describe("Difficulty level (e.g., 'Moderate', 'Challenging')."),
          maxAltitude: z.string().describe("Maximum altitude reached (e.g., '4,215m / 13,828ft')."),
          durationDays: z.number().describe("Total number of days."),
          durationStr: z.string().describe("Duration in string format (e.g., '4 Days / 3 Nights')."),
          elevation: z.string().describe("Elevation gain/loss or range."),
          bestSeason: z.string().describe("Recommended months or season to visit."),
          tags: z.string().describe("A comma-separated list of relevant tags (e.g. 'trekking, machu_picchu, camping, difficult'). Max 5 tags."),
          description: z.string().describe("A comprehensive Markdown formatted description of the trek."),
          included: z.array(z.string()).describe("List of items included."),
          notIncluded: z.array(z.string()).describe("List of items NOT included."),
          highlights: z.array(z.string()).describe("List of key highlights."),
          requirements: z.array(z.string()).describe("List of things to bring or prerequisites."),
          itinerary: z.array(z.object({
            day: z.number(),
            title: z.string(),
            description: z.string()
          })).describe("Full daily breakdown."),
          agencyName: z.string().describe("The name of the agency providing this tour (e.g. 'Alpaca Expeditions', 'Salkantay Trekking').")
        }),
        prompt: `Extract the details of the trekking package from the following website text.\n\nWebsite URL: ${url}\n\nWebsite Text:\n${text}`
      });
      
      console.log(`Extracted: ${packageData.title} by ${packageData.agencyName} - $${packageData.basePriceUsd}`);
      
      // Ensure the Agency exists
      let agency = await prisma.agency.findFirst({
        where: { name: packageData.agencyName }
      });
      
      if (!agency) {
        agency = await prisma.agency.create({
          data: {
            slug: packageData.agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: packageData.agencyName,
            contactPhone: "+51 999 999 999", // Placeholder
            commissionRate: 0.05
          }
        });
      }
      
      const updateData = {
        agencyId: agency.id,
        tagline: packageData.tagline,
        sector: packageData.sector,
        pace: packageData.pace,
        basePriceUsd: packageData.basePriceUsd,
        difficulty: packageData.difficulty,
        maxAltitude: packageData.maxAltitude,
        durationDays: packageData.durationDays,
        durationStr: packageData.durationStr,
        elevation: packageData.elevation,
        bestSeason: packageData.bestSeason,
        tags: packageData.tags,
        description: packageData.description,
        included: JSON.stringify(packageData.included),
        notIncluded: JSON.stringify(packageData.notIncluded),
        highlights: JSON.stringify(packageData.highlights),
        requirements: JSON.stringify(packageData.requirements),
        itineraryJson: JSON.stringify(packageData.itinerary),
      };

      const existingPackage = await prisma.tourPackage.findFirst({
        where: { 
          title: packageData.title,
          agencyId: agency.id
        }
      });
      
      if (existingPackage) {
        await prisma.tourPackage.update({
          where: { id: existingPackage.id },
          data: updateData
        });
        console.log(`Updated existing package: ${packageData.title}`);
      } else {
        await prisma.tourPackage.create({
          data: {
            title: packageData.title,
            ...updateData
          }
        });
        console.log(`Created new package: ${packageData.title}`);
      }
      
    } catch (error) {
      console.error(`Failed to extract data for ${url}:`, error);
    }
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
