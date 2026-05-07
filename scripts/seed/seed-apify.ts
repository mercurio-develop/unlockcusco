import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

const FALLBACK_IMAGES: Record<string, string> = {
  Dining: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop',
  Wellness: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
  Adventure: 'https://images.unsplash.com/photo-1522345678432-8dfc0a273dd9?q=80&w=1000&auto=format&fit=crop',
  Stays: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
  Culture: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop',
};

function mapCategory(googleCategory: string): string {
  const c = googleCategory.toLowerCase();
  if (c.match(/restaurant|cafe|food|picantería|pizza|bar|brewery|bakery|comida|restaurante|chifa|polleria|cevicheria|cafeteria/)) return "Dining";
  if (c.match(/spa|massage|yoga|wellness|therapist|sauna|retreat|meditation|masaje|terapia|bienestar/))    return "Wellness";
  if (c.match(/tour|travel|agency|agencia|turismo|operator/)) return "Agency";
  if (c.match(/hiking|atv|rafting|zipline|adventure|trekking|aventura|cuatrimotos|caminata|paragliding/)) return "Adventure";
  if (c.match(/taxi|transport|shuttle|transfer|colectivo|terminal|omnibus|airport|conductor|driver/)) return "Transport";
  if (c.match(/hotel|hostel|lodge|inn|camping|alojamiento|airbnb|resort|hospedaje/))        return "Stays";
  if (c.match(/textile|tejido|weaving|artesanía|artisan|tejedoras|tejidos/)) return "Textiles";
  if (c.match(/textile|artisan|artesanía|market|clothing|souvenir|textil|tejido|mercado|artesano/)) return "Culture";
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
  // --- TEXTILES & ARTISANS (English & Spanish) ---
  // Pisac
  "Textiles authentic market Pisac, Cusco, Peru",
  "Mercado de artesania Pisac, Cusco, Peru",
  "Centro de textiles tradicionales Pisac, Cusco, Peru",
  "Tejidos artesanales Pisac, Cusco, Peru",
  // Urubamba
  "Alpaca textiles Urubamba, Cusco, Peru",
  "Taller de tejido Urubamba, Cusco, Peru",
  "Artesania local Urubamba, Cusco, Peru",
  "Ceramica y textiles Urubamba, Cusco, Peru",
  // Calca
  "Mercado de artesania Calca, Cusco, Peru",
  "Tejidos tradicionales Calca, Cusco, Peru",
  "Asociacion de artesanos Calca, Cusco, Peru",
  // Ollantaytambo
  "Weaving cooperative Ollantaytambo, Cusco, Peru",
  "Textiles tradicionales Ollantaytambo, Cusco, Peru",
  "Mercado artesanal Ollantaytambo, Cusco, Peru",
  "Taller de artesania Ollantaytambo, Cusco, Peru",
  // Chinchero
  "Centro de textiles Chinchero, Cusco, Peru",
  "Tejedoras tradicionales Chinchero, Cusco, Peru",
  "Mercado de artesania Chinchero, Cusco, Peru",
  "Taller de tejido andino Chinchero, Cusco, Peru",

  // --- RESTAURANTS & DINING (English & Spanish) ---
  // Pisac
  "Best restaurant Pisac, Cusco, Peru",
  "Restaurante local Pisac, Cusco, Peru",
  "Picanteria tradicional Pisac, Cusco, Peru",
  "Comida tipica Pisac, Cusco, Peru",
  "Cafeteria especialidad Pisac, Cusco, Peru",
  "Restaurante vegetariano Pisac, Cusco, Peru",
  // Urubamba
  "Restaurante campestre Urubamba, Cusco, Peru",
  "Picanteria local Urubamba, Cusco, Peru",
  "Comida tradicional Urubamba, Cusco, Peru",
  "Cafe specialty coffee Urubamba, Cusco, Peru",
  "Restaurante organico Urubamba, Cusco, Peru",
  // Calca
  "Restaurante Calca, Cusco, Peru",
  "Picanteria Calca, Cusco, Peru",
  "Comida local Calca, Cusco, Peru",
  "Cafeteria Calca, Cusco, Peru",
  "Caldo de gallina Calca, Cusco, Peru", // Very local search term
  // Ollantaytambo
  "Restaurant near ruins Ollantaytambo, Cusco, Peru",
  "Restaurante tipico Ollantaytambo, Cusco, Peru",
  "Comida local Ollantaytambo, Cusco, Peru",
  "Cafeteria estacion de tren Ollantaytambo, Cusco, Peru",
  "Cerveceria artesanal Ollantaytambo, Cusco, Peru",
  // Chinchero
  "Restaurante turistico Chinchero, Cusco, Peru",
  "Comida tipica Chinchero, Cusco, Peru",
  "Picanteria Chinchero, Cusco, Peru",
  "Restaurante campestre Chinchero, Cusco, Peru"
];

async function main() {
  let added = 0;
  let skipped = 0;

  for (const search of SEARCHES) {
    console.log(`\n🔍 Scraping: "${search}"`);

    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: [search],
        maxCrawledPlacesPerSearch: 20, // Increased to capture more local places
        language: "es", // Set to Spanish to get the most authentic local results
        maxImages: 4,
        maxReviews: 5,
        reviewsSort: "newest",
        scrapeReviewerName: false,
        scrapeReviewerId: false,
        scrapeReviewerUrl: false,
        scrapeResponseFromOwnerText: false,
        extractOpeningHours: true,
        skipClosedPlaces: true,
        includeWebResults: true
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
          let imageUrl = enhanceImageUrl(imageUrls?.[0]) ?? FALLBACK_IMAGES[category];
          const rating = (item.totalScore as number) ?? null
          
          if (rating !== null && rating < 4.5) {
            console.log(`   ⏭  Skipped (rating ${rating} < 4.5): ${name}`)
            continue
          }

          // Try Instagram extraction for high-quality authenticated photos
          try {
            console.log(`   📸 Searching Instagram for: ${name}`);
            const igRun = await apifyClient.actor("apify/instagram-scraper").call({
              search: `${name} peru`,
              searchType: "hashtag",
              searchLimit: 1,
              resultsType: "posts",
              resultsLimit: 1,
            });
            const { items: igItems } = await apifyClient.dataset(igRun.defaultDatasetId).listItems();
            if (igItems.length > 0 && (igItems[0] as Record<string, unknown>).displayUrl) {
              imageUrl = (igItems[0] as Record<string, unknown>).displayUrl as string;
              console.log(`   ✨ Found authentic Instagram image!`);
            } else {
              console.log(`   ⚠️ No IG image, using enhanced Google Maps photo.`);
            }
          } catch {
            console.log(`   ⚠️ IG scraper failed, using enhanced Google Maps photo.`);
          }

          const whatsapp = extractWhatsApp(item.phoneUnformatted as string | undefined);

          const originalReviews = ((item.reviews as Record<string, unknown>[]) || [])
            .filter((r) => r.textTranslated || r.text)
            .slice(0, 5);
            
          let finalName = name;
          let finalReviews = originalReviews.map(r => String(r.textTranslated || r.text));

          try {
            console.log(`   🗣 Translating to English with Gemini...`);
            const { object: translatedData } = await generateObject({
              model: google('gemini-2.5-flash'),
              schema: z.object({
                name: z.string().describe("The business name translated to English. Keep brand names intact. Only translate descriptive nouns (e.g. 'Mercado de Artesania' -> 'Artisan Market')."),
                reviews: z.array(z.string()).describe("The translated reviews in perfect natural English.")
              }),
              prompt: `Translate this Peruvian business data into English for an American/European tourist audience. Keep brand names intact.\n\nJSON Data to translate:\n${JSON.stringify({ name, reviews: finalReviews })}`
            });
            finalName = translatedData.name;
            finalReviews = translatedData.reviews;
          } catch (translationErr) {
            console.warn(`   ⚠️ Translation failed, using original text.`);
          }

          const reviewsData = originalReviews.map((r, index) => ({
            text: finalReviews[index] || String(r.textTranslated || r.text),
            author: "Google Reviewer",
            rating: Number(r.stars),
          }));

          const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

          await prisma.business.create({
            data: {
              name: finalName,
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
