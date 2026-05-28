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

// Fixed list of high-value businesses needing photos
const TARGETS = [
  { id: "00a9481c-db88-4425-bed7-a420ccb57e8b", name: "Camping Equipment El Viajero", query: "Camping Equipment El Viajero, Cusco" },
  { id: "cmp1sjce50087ml2i9w8le7xb", name: "SUMAQ Health & Beauty Massage", query: "SUMAQ Health & Beauty Massage, Urubamba" },
  { id: "cmp239xgd002dml2unzac9p82", name: "LR ALPACA FASHION", query: "LR ALPACA FASHION, Cusco" },
  { id: "cmp239xif003bml2uz5azbuhg", name: "Sacred Valley Treehouse Retreat", query: "Sacred Valley Treehouse Retreat, Calca" },
  { id: "7f43cb56-7517-4a56-bfd2-8a4967c57df8", name: "Qhaly Kay Centro de bienestar", query: "Qhaly Kay, Urubamba" },
  { id: "cmp239xiu003iml2u41oaoq6h", name: "Cusco City Tours", query: "Cusco City Tours, Pisac" },
  { id: "cmp1pode0000lml2i1hcocf2m", name: "Cusco Art and Culture", query: "Cusco Art and Culture - Courses and Services" },
  { id: "cmp239xf9001vml2uhhql1i2m", name: "Horseback Riding Tours Cusco", query: "Horseback Riding Tours Cusco" }
];

async function main() {
  console.log('🔄 Manual recovery of missing images...');

  for (const target of TARGETS) {
    console.log(`\n🔍 Searching for: "${target.name}"`);
    
    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: [target.query],
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
