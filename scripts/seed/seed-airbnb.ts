import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

const LOCATIONS = [
  "Urubamba, Cusco, Peru",
  "Pisac, Cusco, Peru",
  "Ollantaytambo, Cusco, Peru",
  "Calca, Cusco, Peru",
  "Chinchero, Cusco, Peru"
];

async function main() {
  console.log("🏡 Starting Airbnb scraping for the Sacred Valley...");
  let added = 0;
  let skipped = 0;

  for (const location of LOCATIONS) {
    console.log(`\n🔍 Scraping Airbnb in: "${location}"`);

    try {
      // Using a popular Airbnb scraper on Apify
      const run = await apifyClient.actor("dtrungtin/airbnb-scraper").call({
        locationQueries: [location],
        maxListings: 10, // Limit to top 10 per location for high quality
        currency: "USD",
        minPrice: 50, // Filter for decent quality / high margin
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      console.log(`   → ${items.length} listings found`);

      if (items.length > 0) {
        console.log("Sample Item keys:", Object.keys(items[0]));
        console.log("Sample Item name/title/id:", items[0].name, items[0].title, items[0].id);
      }

      for (const item of items) {
        try {
          const name = (item.name || item.title || item.roomType) as string;
          if (!name) continue;

          // Check if already exists in DB
          const exists = await prisma.business.findFirst({ where: { name } });
          if (exists) {
            skipped++;
            continue;
          }

          // Airbnb scraper returns location as lat/lng directly or in location object
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const loc = item.location as Record<string, unknown>;
          const lat = (item.lat as number) || (loc?.lat as number);
          const lng = (item.lng as number) || (loc?.lng as number);
          
          if (!lat || !lng) continue;

          const rating = (item.rating as number) || null;
          const reviewsCount = (item.reviewsCount as number) || 0;
          
          // Only add highly rated Airbnbs
          if (rating !== null && rating < 4.8) {
            console.log(`   ⏭  Skipped (rating ${rating} < 4.8): ${name}`);
            continue;
          }

          const imageUrls = item.photos as string[] | undefined;
          const imageUrl = imageUrls?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop';
          const heroImages = imageUrls ? JSON.stringify(imageUrls.slice(0, 5)) : "[]";

          // Generate a slug
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

          // We don't have WhatsApp for Airbnbs, but they are great for Stays
          await prisma.business.create({
            data: {
              name,
              slug,
              category: "Stays",
              lat,
              lng,
              reviewsCount,
              imageUrl,
              heroImages,
              whatsapp: null,
              isClaimed: false, 
              // Add a default review noting it's an Airbnb
              reviews: {
                create: [
                  { author: "InkaPortal Concierge", text: "Beautiful curated Airbnb stay in the Sacred Valley." , rating: 5 }
                ]
              }
            },
          });

          added++;
          console.log(`   ✅ Added Airbnb: ${name}`);
        } catch (err) {
          console.error(`   ❌ Error processing listing:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.error(`   ❌ Scraping failed for ${location}: ${(err as Error).message}`);
    }
  }

  console.log(`\n✨ Airbnb Scraping Done. Added: ${added} | Skipped (duplicates/low rating): ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
