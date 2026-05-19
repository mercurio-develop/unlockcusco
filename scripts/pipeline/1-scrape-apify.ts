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
  if (c.match(/restaurant|cafe|food|picantería|pizza|bar|brewery|bakery|comida/)) return "DINING";
  if (c.match(/spa|massage|yoga|wellness|therapist|sauna|retreat|meditation/))    return "WELLNESS";
  if (c.match(/tour|travel|agency|hiking|atv|rafting|zipline|adventure|trekking/)) return "ADVENTURE";
  if (c.match(/hotel|hostel|lodge|inn|camping|alojamiento|airbnb|resort/))        return "STAYS";
  return "CULTURE";
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
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+-k-no/g, '=s1600');
  }
  return url;
}

const SEARCHES = [
  "Restaurant Cusco, Peru",
  // Add other searches as needed
];

async function main() {
  let added = 0;
  let skipped = 0;

  for (const search of SEARCHES) {
    console.log(`\n🔍 Scraping: "${search}"`);

    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: [search],
        maxCrawledPlacesPerSearch: 2, // Limit for testing
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

          const googlePlaceId = item.placeId as string;
          
          // 1. Check placeId
          if (googlePlaceId) {
            const existsPlace = await prisma.business.findUnique({ where: { googlePlaceId } });
            if (existsPlace) {
              console.log(`   ⏭  Skipped (duplicate placeId): ${name}`);
              skipped++;
              continue;
            }
          }

          const whatsapp = extractWhatsApp(item.phoneUnformatted as string | undefined);
          const location = item.location as { lat: number; lng: number } | undefined;

          // 2. Check whatsapp or location (lat/lng)
          const duplicates = await prisma.business.findMany({
            where: {
              OR: [
                ...(whatsapp ? [{ whatsapp }] : []),
                ...(location?.lat && location?.lng ? [
                  { lat: location.lat, lng: location.lng }
                ] : [])
              ]
            }
          });

          if (duplicates.length > 0) {
            console.log(`   ⏭  Skipped (duplicate whatsapp or location): ${name}`);
            skipped++;
            continue;
          }

          if (!location?.lat || !location?.lng) continue;

          const category = mapCategory((item.categoryName as string) || '');
          const imageUrls = item.imageUrls as string[] | undefined;
          let imageUrl = enhanceImageUrl(imageUrls?.[0]) ?? FALLBACK_IMAGES[category] ?? FALLBACK_IMAGES['Culture'];
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
              googlePlaceId,
              googleMapsUrl: item.url as string | undefined,
              website: item.website as string | undefined,
              openingHours: item.openingHours as any,
              priceLevel: item.price as string | undefined,
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