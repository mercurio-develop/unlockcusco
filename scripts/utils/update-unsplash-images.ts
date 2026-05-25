import { PrismaClient } from '@prisma/client';
import { ApifyClient } from 'apify-client';
import 'dotenv/config';

const prisma = new PrismaClient();

// Ensure the token exists
if (!process.env.APIFY_API_TOKEN) {
  console.error("Missing APIFY_API_TOKEN in environment variables.");
  process.exit(1);
}

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  console.log('--- Fetching Real Images via Apify ---');

  // 1. Target only businesses with Unsplash placeholders
  const allBusinesses = await prisma.business.findMany({
    select: { id: true, name: true, category: true, imageUrl: true }
  });

  const targets = allBusinesses.filter(b => b.imageUrl && b.imageUrl.includes('unsplash'));
  console.log(`Found ${targets.length} businesses with Unsplash placeholders.`);

  if (targets.length === 0) {
    console.log("No businesses to update. Exiting.");
    return;
  }

  // 2. Batch process to avoid huge Apify payloads
  const CHUNK_SIZE = 10; 
  let updatedCount = 0;

  for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
    const chunk = targets.slice(i, i + CHUNK_SIZE);
    // Append location context to improve search accuracy
    const searchStrings = chunk.map(b => `${b.name} Cusco Peru`);
    
    console.log(`\n📦 Scraping images for batch ${Math.floor(i/CHUNK_SIZE) + 1} (${chunk.length} businesses)...`);
    
    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: searchStrings,
        maxCrawledPlacesPerSearch: 1, // Only need the top hit
        language: "en",
        maxImages: 3, // Only pull the first few images to save time/bandwidth
        reviewsSort: "newest",
        includeWebResults: false,
        skipClosedPlaces: false
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      console.log(`✅ Apify run finished. Found ${items.length} potential matches in this batch.`);

      // 3. Match and Update
      for (const item of items) {
        const itemTitle = String(item.title || "").toLowerCase();
        const itemSearchStr = String(item.searchString || "").toLowerCase();
        
        // Find which business from our chunk matches this result
        const matchingBusiness = chunk.find(b => {
           const bName = b.name.toLowerCase();
           return itemTitle.includes(bName) || 
                  bName.includes(itemTitle) ||
                  itemSearchStr.includes(bName);
        });

        if (matchingBusiness) {
          // Extract image URLs
          const imageUrl = item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0 
            ? item.imageUrls[0] 
            : null;

          if (imageUrl) {
             const allImages = (item.imageUrls as string[]).slice(0, 3);
             
             // Update the existing record ONLY. Do not create new ones.
             await prisma.business.update({
               where: { id: matchingBusiness.id },
               data: {
                 imageUrl: String(imageUrl),
                 heroImages: JSON.stringify(allImages),
                 googlePlaceId: item.placeId ? String(item.placeId) : undefined
               }
             });
             console.log(`   ✨ Updated image for "${matchingBusiness.name}"`);
             updatedCount++;
          } else {
             console.log(`   ⚠️ No images found on Google Maps for "${matchingBusiness.name}"`);
          }
        }
      }
    } catch (err: any) {
      console.error(`   ❌ Apify error in batch: ${err.message}`);
    }
  }

  console.log(`\n✨ Done. Successfully updated ${updatedCount} businesses with real images.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
