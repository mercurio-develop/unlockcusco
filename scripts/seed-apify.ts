import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

const FALLBACK_IMAGES: Record<string, string> = {
  Dining: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop',
  Wellness: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
  Adventure: 'https://images.unsplash.com/photo-1522345678432-8dfc0a273dd9?q=80&w=1000&auto=format&fit=crop',
  Stays: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
  Culture: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop',
};

function mapCategory(googleCategory: string): string {
  const c = googleCategory.toLowerCase();
  if (c.match(/restaurant|cafe|food|picantería|pizza|bar|brewery|bakery|comida/)) return "Dining";
  if (c.match(/spa|massage|yoga|wellness|therapist|sauna|retreat|meditation/))    return "Wellness";
  if (c.match(/tour|travel|agency|hiking|atv|rafting|zipline|adventure|trekking/)) return "Adventure";
  if (c.match(/hotel|hostel|lodge|inn|camping|alojamiento|airbnb|resort/))        return "Stays";
  return "Culture";
}

function extractWhatsApp(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) return digits;
  if (digits.length === 11 && digits.startsWith('51')) return digits.slice(2);
  if (digits.length === 12 && digits.startsWith('519')) return digits.slice(2);
  return null;
}

const SEARCHES = [
  "Spa and wellness Urubamba, Cusco, Peru",
  "Vegan and organic restaurant Urubamba, Cusco, Peru",
  "Specialty coffee cafe Urubamba, Cusco, Peru",
  "Private taxi transport Urubamba, Cusco, Peru",
  "Textiles authentic market Pisac, Cusco, Peru",
  "Yoga and spiritual retreat Pisac, Cusco, Peru",
  "Shaman plant medicine Pisac, Cusco, Peru",
  "ATV tour Cuatrimotos Maras, Cusco, Peru",
  "Salt mines tour Maras, Cusco, Peru",
  "Boutique hotel Ollantaytambo, Cusco, Peru",
  "Restaurant near train station Ollantaytambo, Cusco, Peru",
  "Local tour guide Ollantaytambo, Cusco, Peru",
  "Artisan weaving workshop Chinchero, Cusco, Peru"
];

async function main() {
  let added = 0;
  let skipped = 0;

  for (const search of SEARCHES) {
    console.log(`\n🔍 Scraping: "${search}"`);

    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: [search],
        maxCrawledPlacesPerSearch: 15,
        language: "en",
        maxImages: 3,
        maxReviews: 5,
        reviewsSort: "newest",
        scrapeReviewerName: false,
        scrapeReviewerId: false,
        scrapeReviewerUrl: false,
        scrapeResponseFromOwnerText: false,
        extractOpeningHours: true,
        skipClosedPlaces: false,
        includeWebResults: false
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      console.log(`   → ${items.length} results`);

      for (const item of items) {
        try {
          const name = item.title as string;
          if (!name) continue;

          const exists = await prisma.business.findFirst({ where: { name } });
          if (exists) {
            skipped++;
            continue;
          }

          const location = item.location as { lat: number; lng: number } | undefined;
          if (!location?.lat || !location?.lng) continue;

          const category = mapCategory((item.categoryName as string) || '');
          const imageUrls = item.imageUrls as string[] | undefined;
          const imageUrl = imageUrls?.[0] ?? FALLBACK_IMAGES[category];
          const rating = (item.totalScore as number) ?? null
          
          if (rating !== null && rating < 4.5) {
            console.log(`   ⏭  Skipped (rating ${rating} < 4.5): ${name}`)
            continue
          }

          const whatsapp = extractWhatsApp(item.phoneUnformatted as string | undefined);

          const reviewsData = ((item.reviews as Record<string, unknown>[]) || [])
            .filter((r) => r.text && r.stars)
            .slice(0, 5)
            .map((r) => ({
              text: String(r.text),
              author: "Google Reviewer",
              rating: Number(r.stars),
            }));

          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

          await prisma.business.create({
            data: {
              name,
              slug,
              category,
              lat: location.lat,
              lng: location.lng,
              rating,
              reviewsCount: (item.reviewsCount as number) ?? 0,
              imageUrl,
              whatsapp,
              isClaimed: false,
              ...(reviewsData.length > 0 && { reviews: { create: reviewsData } }),
            },
          });

          added++;
          console.log(`   ✅ ${name} (${category})${whatsapp ? ' 📱' : ''}`);
        } catch (err) {
          console.error(`   ❌ Error:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.error(`   ❌ Search failed: ${(err as Error).message}`);
    }
  }

  console.log(`\n✨ Done. Added: ${added} | Skipped (duplicates): ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
