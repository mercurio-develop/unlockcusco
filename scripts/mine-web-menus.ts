import { PrismaClient } from '@prisma/client';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { ApifyClient } from 'apify-client';
import * as cheerio from 'cheerio';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, etc.
    $('script, style, noscript, iframe, img, svg').remove();
    
    let text = $('body').text().replace(/\s+/g, ' ').trim();
    // Return first 10,000 characters to avoid huge payloads
    return text.substring(0, 10000);
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return '';
  }
}

async function main() {
  // Let's grab some top dining businesses
  const businesses = await prisma.business.findMany({
    where: {
      category: { in: ['DINING', 'Dining', 'dining'] },
      // To save tokens/time, let's just pick a few for demonstration
    },
    take: 10, 
    orderBy: { reviewsCount: 'desc' }
  });

  console.log(`Analyzing websites and menus for ${businesses.length} dining businesses...`);

  for (const biz of businesses) {
    console.log(`\n🍽️ Processing: ${biz.name}`);
    let websiteUrl = '';

    // First try to parse socialLinks
    try {
      const social = JSON.parse(biz.socialLinks || '{}');
      if (social.website) websiteUrl = social.website;
    } catch(e) {}

    // If no website, try finding it via Apify Google Maps
    if (!websiteUrl) {
      console.log(`   🔍 Finding website via Google Maps...`);
      try {
        const run = await apifyClient.actor("compass/google-maps-extractor").call({
          searchStringsArray: [`${biz.name} Valle Sagrado Peru`],
          maxCrawledPlacesPerSearch: 1,
        });
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        if (items.length > 0 && items[0].website) {
          websiteUrl = items[0].website as string;
          console.log(`   ✨ Found website: ${websiteUrl}`);
          
          // Update the DB with the found website
          const socialLinks = JSON.parse(biz.socialLinks || '{}');
          socialLinks.website = websiteUrl;
          await prisma.business.update({
            where: { id: biz.id },
            data: { socialLinks: JSON.stringify(socialLinks) }
          });
        } else {
          console.log(`   ⚠️ No website found.`);
        }
      } catch (err) {
         console.log(`   ⚠️ Google Maps search failed.`);
      }
    } else {
      console.log(`   🌐 Known website: ${websiteUrl}`);
    }

    if (websiteUrl) {
      console.log(`   📄 Scraping website content...`);
      const pageText = await extractTextFromUrl(websiteUrl);

      if (pageText.length > 200) {
        console.log(`   🤖 Extracting menu with Gemini...`);
        try {
          const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
              menuHighlights: z.array(z.object({
                item: z.string(),
                description: z.string().optional(),
                price: z.string().optional()
              })).describe("5 to 10 specific menu items with descriptions and prices if available.")
            }),
            prompt: `You are an expert food data extractor. Look at the text scraped from this restaurant's website (${biz.name}) and extract their menu highlights. If prices are mentioned, include them.\n\nWebsite Text:\n${pageText}`
          });

          console.log(`   ✅ Extracted ${object.menuHighlights.length} menu items.`);
          
          // Store this rich menu data in featuresJson
          const existingFeatures = JSON.parse(biz.featuresJson || '[]');
          
          // Find if there's already a menu highlights object
          const filteredFeatures = existingFeatures.filter((f: any) => !f.menuHighlights);
          filteredFeatures.push({ menuHighlights: object.menuHighlights });

          await prisma.business.update({
            where: { id: biz.id },
            data: { featuresJson: JSON.stringify(filteredFeatures) }
          });

        } catch (err: any) {
           console.log(`   ❌ Gemini extraction failed: ${err.message}`);
        }
      } else {
        console.log(`   ⚠️ Website content too short or blocked.`);
      }
    }
  }

  console.log(`\n🎉 Web scraping phase complete.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
