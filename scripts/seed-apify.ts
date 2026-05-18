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

function enhanceImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  // Replace typical Google Maps size parameters (e.g. =w400-h300-k-no) with high-res equivalents
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+-k-no/g, '=s1600');
  }
  return url;
}

const SEARCHES = [
  // Maras Gaps
  "Restaurant Maras, Cusco, Peru",
  "Cafe Maras, Cusco, Peru",
  "Hotel Maras, Cusco, Peru",
  "Spa and wellness Maras, Cusco, Peru",
  
  // Chinchero Gaps
  "Restaurant Chinchero, Cusco, Peru",
  "Cafe Chinchero, Cusco, Peru",
  "Hotel Chinchero, Cusco, Peru",
  "Spa and wellness Chinchero, Cusco, Peru",
  
  // Calca Gaps
  "Hotel Calca, Cusco, Peru",
  "Lodge Calca, Cusco, Peru",
  "Adventure tours Calca, Cusco, Peru",
  "Spa and wellness Calca, Cusco, Peru"
];

async function main() {
  let added = 0;
  let skipped = 0;

  for (const search of SEARCHES) {
    console.log(`\n🔍 Scraping: "${search}"`);

    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: [search],
        maxCrawledPlacesPerSearch: 20,
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

          const whatsapp = extractWhatsApp(item.phoneUnformatted as string | undefined);
          if (whatsapp) {
            const phoneExists = await prisma.business.findFirst({ where: { whatsapp } });
            if (phoneExists) {
              console.log(`   ⏭  Skipped (duplicate phone ${whatsapp}): ${name}`);
              skipped++;
              continue;
            }
          }

          const location = item.location as { lat: number; lng: number } | undefined;
          if (!location?.lat || !location?.lng) continue;

          const category = mapCategory((item.categoryName as string) || '');
          const imageUrls = item.imageUrls as string[] | undefined;
          let imageUrl = enhanceImageUrl(imageUrls?.[0]) ?? FALLBACK_IMAGES[category];
          const rating = (item.totalScore as number) ?? null
          
          if (rating !== null && rating < 4.0) {
            console.log(`   ⏭  Skipped (rating ${rating} < 4.0): ${name}`)
            continue
          }

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
