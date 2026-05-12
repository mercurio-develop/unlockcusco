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
  "Tourist Ticket": 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop',
  Textiles: 'https://images.unsplash.com/photo-1606132717013-09436324a350?q=80&w=1000&auto=format&fit=crop',
};

function mapCategory(googleCategory: string): string {
  const c = googleCategory.toLowerCase();
  if (c.match(/restaurant|cafe|food|picantería|pizza|bar|brewery|bakery|comida|restaurante|chifa|polleria|cevicheria|cafeteria/)) return "Dining";
  if (c.match(/spa|massage|yoga|wellness|therapist|sauna|retreat|meditation|masaje|terapia|bienestar/))    return "Wellness";
  if (c.match(/tour|travel|agency|agencia|turismo|operator/)) return "Agency";
  if (c.match(/hiking|atv|rafting|zipline|adventure|trekking|aventura|cuatrimotos|caminata|paragliding/)) return "Adventure";
  if (c.match(/taxi|transport|shuttle|transfer|colectivo|terminal|omnibus|airport|conductor|driver/)) return "Transport";
  if (c.match(/hotel|hostel|lodge|inn|camping|alojamiento|airbnb|resort|hospedaje|stay|boutique/))        return "Stays";
  if (c.match(/textile|tejido|weaving|artesanía|artisan|tejedoras|tejidos/)) return "Textiles";
  if (c.match(/ruin|archaeological|arqueológico|museum|museo|monument|site|landmark|historical|histórico/)) return "Tourist Ticket";
  if (c.match(/artesanía|market|clothing|souvenir|textil|tejido|mercado|artesano|culture|cultura/)) return "Culture";
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
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+-k-no/g, '=s1600');
  }
  return url;
}

function getLocationSlug(searchQuery: string): string {
  const q = searchQuery.toLowerCase();
  if (q.includes("machu picchu") || q.includes("aguas calientes")) return "machu-picchu";
  if (q.includes("pisac")) return "pisac";
  if (q.includes("urubamba")) return "urubamba";
  if (q.includes("calca")) return "calca";
  if (q.includes("ollantaytambo")) return "ollantaytambo";
  if (q.includes("chinchero")) return "chinchero";
  if (q.includes("cusco")) return "cusco";
  return "sacred-valley";
}

const LOCATIONS = [
  "Machu Picchu, Aguas Calientes, Peru"
];

const SEARCHES: string[] = [];

LOCATIONS.forEach(loc => {
  // Stays
  SEARCHES.push(`Boutique hotel ${loc}`);
  SEARCHES.push(`Best hostel ${loc}`);
  SEARCHES.push(`Eco lodge ${loc}`);
  
  // Dining
  SEARCHES.push(`Best restaurant ${loc}`);
  SEARCHES.push(`Picanteria tradicional ${loc}`);
  SEARCHES.push(`Specialty coffee cafe ${loc}`);
  SEARCHES.push(`Comida tipica ${loc}`);
  
  // Culture
  SEARCHES.push(`Museum museo ${loc}`);
  SEARCHES.push(`Art gallery galeria de arte ${loc}`);
  SEARCHES.push(`Centro cultural ${loc}`);
  
  // Tourist Ticket
  SEARCHES.push(`Archaeological site ruinas ${loc}`);
  SEARCHES.push(`Boleto turistico attractions ${loc}`);
  
  // Wellness
  SEARCHES.push(`Yoga studio ${loc}`);
  SEARCHES.push(`Spa massage masajes ${loc}`);
  SEARCHES.push(`Wellness retreat center ${loc}`);
  
  // Textiles
  SEARCHES.push(`Textile artisan market mercado artesanal ${loc}`);
  SEARCHES.push(`Tejedoras tradicionales textiles ${loc}`);
  
  // Adventure
  SEARCHES.push(`Trekking hiking trails ${loc}`);
  SEARCHES.push(`ATV cuatrimotos tour ${loc}`);
  SEARCHES.push(`Adventure sports rafting zipline ${loc}`);
});

async function main() {
  let added = 0;
  let skipped = 0;

  console.log(`Starting targeted scraper with ${SEARCHES.length} total search queries across ${LOCATIONS.length} locations...\n`);

  for (const search of SEARCHES) {
    console.log(`\n🔍 Scraping: "${search}"`);
    const locationSlug = getLocationSlug(search);

    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: [search],
        maxCrawledPlacesPerSearch: 15,
        language: "es",
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
          let imageUrl = enhanceImageUrl(imageUrls?.[0]) ?? FALLBACK_IMAGES[category] ?? FALLBACK_IMAGES['Culture'];
          
          const rawImages = (imageUrls || []).slice(0, 5).map(enhanceImageUrl).filter(Boolean) as string[];
          const heroImages = JSON.stringify(rawImages);

          const rating = (item.totalScore as number) ?? null;
          
          if (rating !== null && rating < 4.5) {
            console.log(`   ⏭  Skipped (rating ${rating} < 4.5): ${name}`);
            continue;
          }

          const websiteUrl = (item.website as string) || null;
          const mapsUrl = (item.url as string) || null;
          
          const whatsapp = extractWhatsApp(item.phoneUnformatted as string | undefined);
          
          const socialLinks: any = {};
          if (websiteUrl) socialLinks.website = websiteUrl;
          if (mapsUrl) socialLinks.googleMaps = mapsUrl;
          const socialLinksJson = JSON.stringify(socialLinks);

          // Extract amenities from additionalInfo
          const features: string[] = [];
          if (item.additionalInfo) {
            const info = item.additionalInfo as Record<string, any[]>;
            for (const key in info) {
              if (Array.isArray(info[key])) {
                info[key].forEach(feature => {
                  if (Object.values(feature)[0] === true) {
                    const featureName = Object.keys(feature)[0];
                    if (featureName) features.push(featureName);
                  }
                });
              }
            }
          }
          const featuresJson = JSON.stringify(features);

          const originalReviews = ((item.reviews as Record<string, unknown>[]) || [])
            .filter((r) => r.textTranslated || r.text)
            .slice(0, 5);
            
          let finalName = name;
          let finalReviews = originalReviews.map(r => String(r.textTranslated || r.text));
          let finalTagline = "";
          let finalDescription = "";
          let finalPriceTier = "$$";

          try {
            console.log(`   🗣 Generating business profile with Gemini...`);
            const { object: profileData } = await generateObject({
              model: google('gemini-2.5-flash'),
              schema: z.object({
                name: z.string().describe("The business name translated to English. Keep brand names intact. Only translate descriptive nouns (e.g. 'Mercado de Artesania' -> 'Artisan Market')."),
                tagline: z.string().describe("A short, catchy, 3-5 word tagline for the business. E.g., 'Authentic Andean Textiles', 'Boutique Sacred Valley Retreat'"),
                description: z.string().describe("A short, engaging 1-2 sentence description summarizing what makes this place special based on the reviews and category."),
                priceTier: z.enum(["$", "$$", "$$$"]).describe("Estimated price tier based on the business type and reviews. Default to $$ if unsure."),
                reviews: z.array(z.string()).describe("The translated reviews in perfect natural English.")
              }),
              prompt: `Translate and analyze this Peruvian business data for an American/European tourist audience. Generate an engaging profile based on the name, category (${category}), and reviews.\n\nJSON Data:\n${JSON.stringify({ name, reviews: finalReviews })}`
            });
            finalName = profileData.name;
            finalReviews = profileData.reviews;
            finalTagline = profileData.tagline;
            finalDescription = profileData.description;
            finalPriceTier = profileData.priceTier;
          } catch (generationErr) {
            console.warn(`   ⚠️ Profile generation failed, using fallbacks.`);
            finalTagline = `${category} in ${locationSlug}`;
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
              heroImages,
              whatsapp,
              socialLinks: socialLinksJson,
              isClaimed: false,
              locationSlug,
              tagline: finalTagline,
              description: finalDescription,
              priceTier: finalPriceTier,
              featuresJson,
              ...(reviewsData.length > 0 && { reviews: { create: reviewsData } }),
            },
          });

          added++;
          console.log(`   ✅ ${finalName} (${category}) | Tier: ${finalPriceTier} | Loc: ${locationSlug}`);
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
