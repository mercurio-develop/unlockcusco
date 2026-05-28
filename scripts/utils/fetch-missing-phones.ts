import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

function extractWhatsApp(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) return digits;
  if (digits.length === 11 && digits.startsWith('51')) return digits.slice(2);
  if (digits.length === 12 && digits.startsWith('519')) return digits.slice(2);
  return null;
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      category: { notIn: ['boleto', 'BOLETO'] },
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

  console.log(`Found ${businesses.length} businesses without a phone number (excluding boleto).`);

  if (businesses.length === 0) {
    console.log('Nothing to scrape.');
    return;
  }

  // Create mapping of search string to business ID for reliable matching
  const searchMap = new Map<string, typeof businesses[0]>();
  const searchStringsArray: string[] = [];

  for (const b of businesses) {
    const loc = b.locationSlug ? b.locationSlug.replace('-', ' ') : 'Cusco';
    const query = `${b.name} ${loc} Peru`;
    searchStringsArray.push(query);
    searchMap.set(query, b);
  }

  console.log(`\n🔍 Calling Apify to search for ${searchStringsArray.length} businesses...`);
  console.log(`This might take a few minutes as Apify queries Google Maps.\n`);

  try {
    const run = await apifyClient.actor("compass/google-maps-extractor").call({
      searchStringsArray: searchStringsArray,
      maxCrawledPlacesPerSearch: 1, // Only get the top result
      language: "en",
      maxImages: 0,
      maxReviews: 0,
      scrapeReviewerName: false,
      scrapeReviewerId: false,
      scrapeReviewerUrl: false,
      scrapeResponseFromOwnerText: false,
      extractOpeningHours: false,
      skipClosedPlaces: false,
      includeWebResults: false
    });

    console.log(`✅ Apify run complete. Fetching results...`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`Found ${items.length} items from Google Maps.`);

    let updatedCount = 0;

    for (const item of items) {
      // compass/google-maps-extractor returns `searchString` if it comes from searchStringsArray
      const searchStr = item.searchString as string;
      const title = item.title as string;
      const phoneRaw = item.phoneUnformatted as string | undefined;

      const whatsapp = extractWhatsApp(phoneRaw);
      
      let matchedBusiness;
      
      if (searchStr && searchMap.has(searchStr)) {
         matchedBusiness = searchMap.get(searchStr);
      } else {
         // Fallback: match by title similarity
         matchedBusiness = businesses.find(b => 
           normalizeName(b.name).includes(normalizeName(title)) || 
           normalizeName(title).includes(normalizeName(b.name))
         );
      }

      if (matchedBusiness && whatsapp) {
        console.log(`   + Updating phone for ${matchedBusiness.name} -> ${whatsapp}`);
        await prisma.business.update({
          where: { id: matchedBusiness.id },
          data: { whatsapp }
        });
        updatedCount++;
        // Remove from map to prevent duplicate updates
        if (searchStr) searchMap.delete(searchStr);
      } else if (matchedBusiness && !whatsapp) {
        console.log(`   - No valid phone found for ${matchedBusiness.name}`);
      } else if (!matchedBusiness && whatsapp) {
         console.log(`   ? Found phone ${whatsapp} for "${title}" but couldn't match to a DB business.`);
      }
    }

    console.log(`\n🎉 Finished! Successfully updated ${updatedCount} businesses with new WhatsApp numbers.`);

  } catch (error) {
    console.error("Error during Apify run:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
