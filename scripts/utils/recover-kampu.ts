import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

function enhanceImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+-k-no/g, '=s1600');
  }
  return url;
}

async function main() {
  console.log('🔄 Manual recovery of Kampu image...');

  const target = await prisma.business.findFirst({
    where: { name: { contains: 'kampu', mode: 'insensitive' } }
  });

  if (!target) {
    console.log('Kampu not found in DB.');
    return;
  }

  console.log(`\n🔍 Searching for: "${target.name}"`);
  
  try {
    const run = await apifyClient.actor("compass/google-maps-extractor").call({
      searchStringsArray: [`${target.name}, Cusco`],
      maxCrawledPlacesPerSearch: 1,
      language: "en",
      maxImages: 5,
      maxReviews: 0,
      extractOpeningHours: false,
      skipClosedPlaces: false,
      includeWebResults: false
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    if (items.length > 0) {
      const item = items[0];
      const images = (item.imageUrls as string[]) || [];
      if (item.imageUrl) images.unshift(item.imageUrl as string);
      
      const validImageUrl = images.find(url => !url.includes('streetviewpixels'));
      
      if (validImageUrl) {
        const enhanced = enhanceImageUrl(validImageUrl);
        await prisma.business.update({
          where: { id: target.id },
          data: { ...(enhanced ? { imageUrl: enhanced } : {}) }
        });
        console.log(`   ✅ Success! Found image in ${images.length} photos.`);
        console.log(`   New URL: ${enhanced}`);
      } else {
        console.log(`   ❌ Only streetview found (${images.length} photos).`);
      }
    } else {
      console.log(`   ❌ No results for query.`);
    }
  } catch (e) {
    console.error(`   ❌ Error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
