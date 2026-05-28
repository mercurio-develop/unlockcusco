import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

function extractWhatsAppFromText(text: string | undefined | null): string | null {
  if (!text) return null;
  // Match any sequence of 9 digits starting with 9, ignoring spaces/dashes in between
  // Sometimes numbers are formatted like +51 987 654 321 or 987-654-321
  const matches = text.match(/(?:\+?51\s*)?9[\d\s-]{8,12}/g);
  
  if (matches) {
    for (const match of matches) {
      const digits = match.replace(/\D/g, '');
      if (digits.length === 9 && digits.startsWith('9')) return digits;
      if (digits.length === 11 && digits.startsWith('519')) return digits.slice(2);
      if (digits.length === 12 && digits.startsWith('519')) return digits.slice(2);
    }
  }
  return null;
}

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { whatsapp: null },
        { whatsapp: '' }
      ]
    },
    select: {
      id: true,
      name: true,
      locationSlug: true
    }
  });

  console.log(`Found ${businesses.length} businesses without a phone number.`);

  if (businesses.length === 0) {
    console.log('Nothing to scrape.');
    return;
  }

  // To prevent the string from getting too huge, we'll batch them in chunks if necessary,
  // but 119 queries separated by newlines should be perfectly fine for Apify.
  const searchMap = new Map<string, typeof businesses[0]>();
  const queries: string[] = [];

  for (const b of businesses) {
    const loc = b.locationSlug ? b.locationSlug.replace('-', ' ') : 'Cusco';
    // Using site:facebook.com OR site:tripadvisor.com
    const query = `"${b.name}" ${loc} Cusco (site:facebook.com OR site:tripadvisor.com)`;
    queries.push(query);
    searchMap.set(query, b);
  }

  console.log(`\n🔍 Calling apify/google-search-scraper for ${queries.length} businesses...`);
  console.log(`Querying Facebook and TripAdvisor via Google snippets.\n`);

  try {
    const run = await apifyClient.actor("apify/google-search-scraper").call({
      queries: queries.join('\n'),
      resultsPerPage: 3,
      maxPagesPerQuery: 1,
      languageCode: "es", // Spanish often has phone numbers in descriptions here
      countryCode: "pe",
      saveHtml: false,
      saveHtmlToKeyValueStore: false,
      includeUnfilteredResults: false
    });

    console.log(`✅ Apify run complete. Fetching results...`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`Found ${items.length} result sets from Google Search.`);

    let updatedCount = 0;

    for (const item of items) {
      const searchStr = (item.searchQuery as any)?.term as string;
      if (!searchStr) continue;

      const matchedBusiness = searchMap.get(searchStr);
      if (!matchedBusiness) continue;

      const organicResults = (item.organicResults || []) as any[];
      let foundPhone = null;

      for (const result of organicResults) {
        const textToCheck = `${result.title || ''} ${result.description || ''}`;
        const phone = extractWhatsAppFromText(textToCheck);
        if (phone) {
          foundPhone = phone;
          break; // Stop looking for this business once we find a valid number
        }
      }

      if (foundPhone) {
        console.log(`   + Updating phone for ${matchedBusiness.name} -> ${foundPhone}`);
        await prisma.business.update({
          where: { id: matchedBusiness.id },
          data: { whatsapp: foundPhone }
        });
        updatedCount++;
      } else {
        console.log(`   - No phone found in snippets for ${matchedBusiness.name}`);
      }
    }

    console.log(`\n🎉 Finished! Successfully extracted and updated ${updatedCount} businesses with new WhatsApp numbers.`);

  } catch (error) {
    console.error("Error during Apify run:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
