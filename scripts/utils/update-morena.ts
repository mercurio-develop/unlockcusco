import { PrismaClient } from '@prisma/client';
import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const prisma = new PrismaClient();
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  console.log('--- Fetching Real Images via Apify for Morena ---');

  const morena = await prisma.business.findFirst({
    where: { name: { contains: 'Morena Peruvian Kitchen' } }
  });

  if (!morena) {
    console.log("Not found.");
    return;
  }

  console.log(`Scraping images for ${morena.name}...`);
  
  try {
    const run = await apifyClient.actor("compass/google-maps-extractor").call({
      searchStringsArray: [`Morena Peruvian Kitchen Cusco`],
      maxCrawledPlacesPerSearch: 1,
      language: "en",
      maxImages: 5,
      reviewsSort: "newest",
      includeWebResults: false,
      skipClosedPlaces: false
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`✅ Apify run finished. Found ${items.length} potential matches.`);

    if (items.length > 0) {
      const item = items[0];
      const imageUrl = item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0 
        ? item.imageUrls[0] 
        : null;

      if (imageUrl) {
          const allImages = (item.imageUrls as string[]).slice(0, 5);
          
          await prisma.business.update({
            where: { id: morena.id },
            data: {
              imageUrl: String(imageUrl),
              heroImages: JSON.stringify(allImages),
            }
          });
          console.log(`✨ Updated image for "${morena.name}"`);
          console.log(`New image URL: ${imageUrl}`);
      } else {
          console.log(`⚠️ No images found on Google Maps.`);
      }
    }
  } catch (err: any) {
    console.error(`❌ Apify error: ${err.message}`);
  }

  console.log(`\n✨ Done.`);
}

main().finally(() => prisma.$disconnect());
