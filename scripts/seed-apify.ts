import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

const FALLBACK_IMAGES: Record<string, string> = {
  Gastronomía: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop',
  Bienestar:   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
  Aventura:    'https://images.unsplash.com/photo-1522345678432-8dfc0a273dd9?q=80&w=1000&auto=format&fit=crop',
  Descanso:    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
  Cultura:     'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop',
};

function mapCategory(googleCategory: string): string {
  const c = googleCategory.toLowerCase();
  if (c.match(/restaurant|cafe|food|picantería|pizza|bar|brewery|bakery|comida/)) return "Gastronomía";
  if (c.match(/spa|massage|yoga|wellness|therapist|sauna|retreat|meditation/))    return "Bienestar";
  if (c.match(/tour|travel|agency|hiking|atv|rafting|zipline|adventure|trekking/)) return "Aventura";
  if (c.match(/hotel|hostel|lodge|inn|camping|alojamiento|airbnb|resort/))        return "Descanso";
  return "Cultura";
}

function extractWhatsApp(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) return digits;          // 9XXXXXXXX
  if (digits.length === 11 && digits.startsWith('51')) return digits.slice(2); // 519XXXXXXXX
  if (digits.length === 12 && digits.startsWith('519')) return digits.slice(2);
  return null; // landline or unknown — store null, don't discard business
}

const SEARCHES = [
  // Urubamba
  "restaurantes en Urubamba Cusco",
  "tour agencies in Urubamba Sacred Valley Peru",
  "hoteles en Urubamba Valle Sagrado",
  "spas y masajes en Urubamba",
  // Pisac
  "restaurantes en Pisac Cusco",
  "artesanías y mercado en Pisac",
  "hoteles en Pisac Valle Sagrado",
  "tour operators Pisac Peru",
  // Ollantaytambo
  "restaurantes en Ollantaytambo",
  "hoteles en Ollantaytambo Cusco",
  "adventure tours Ollantaytambo",
  // Chinchero & Maras
  "tour Maras Moray Cusco",
  "artesanías Chinchero Cusco",
  // Wellness & Culture
  "yoga retreat Sacred Valley Peru",
  "wellness center Valle Sagrado Cusco",
  "cultural experiences Sacred Valley",
  "hiking guides Sacred Valley Peru",
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
        language: 'es',
        maxImages: 1,
        maxReviews: 3,
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      console.log(`   → ${items.length} results`);

      for (const item of items) {
        try {
          const name = item.title as string;
          if (!name) continue;

          // Skip if already exists
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
          // Skip low-quality businesses
          if (rating !== null && rating < 4.0) {
            console.log(`   ⏭  Skipped (low rating ${rating}): ${name}`)
            continue
          }

          const whatsapp = extractWhatsApp(item.phoneUnformatted as string | undefined);

          const reviewsData = ((item.reviews as Record<string, unknown>[]) || [])
            .filter((r) => r.text && r.name && r.stars)
            .slice(0, 3)
            .map((r) => ({
              text: String(r.text),
              author: String(r.name),
              rating: Number(r.stars),
            }));

          await prisma.business.create({
            data: {
              name,
              category,
              lat: location.lat,
              lng: location.lng,
              rating,
              reviewsCount: (item.reviewsCount as number) ?? 0,
              imageUrl,
              whatsapp,          // null is fine — business still listed
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
