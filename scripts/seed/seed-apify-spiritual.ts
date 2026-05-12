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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1545389336-cf090694435e?q=80&w=1000&auto=format&fit=crop';

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
  "Cusco, Peru",
  "Pisac, Cusco, Peru",
  "Urubamba, Cusco, Peru",
  "Calca, Cusco, Peru",
];

const SEARCHES: string[] = [];

LOCATIONS.forEach(loc => {
  SEARCHES.push(`Spiritual retreat center ${loc}`);
  SEARCHES.push(`Ayahuasca San Pedro retreat ${loc}`);
  SEARCHES.push(`Ashram yoga meditation ${loc}`);
  SEARCHES.push(`Holistic healing sanctuary ${loc}`);
  SEARCHES.push(`Shamanic plant medicine ${loc}`);
});

async function main() {
  let added = 0;
  let skipped = 0;

  console.log(`Starting Spiritual Scraper with ${SEARCHES.length} search queries...\n`);

  for (const search of SEARCHES) {
    console.log(`\n🔍 Scraping: "${search}"`);
    const locationSlug = getLocationSlug(search);

    try {
      const run = await apifyClient.actor("compass/google-maps-extractor").call({
        searchStringsArray: [search],
        maxCrawledPlacesPerSearch: 10,
        language: "en",
        maxImages: 4,
        maxReviews: 5,
        reviewsSort: "newest",
        scrapeReviewerName: false,
        scrapeReviewerId: false,
        scrapeReviewerUrl: false,
        scrapeResponseFromOwnerText: false,
        extractOpeningHours: false,
        skipClosedPlaces: true,
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

          const imageUrls = item.imageUrls as string[] | undefined;
          let imageUrl = enhanceImageUrl(imageUrls?.[0]) ?? FALLBACK_IMAGE;
          
          const rawImages = (imageUrls || []).slice(0, 5).map(enhanceImageUrl).filter(Boolean) as string[];
          const heroImages = JSON.stringify(rawImages);

          const rating = (item.totalScore as number) ?? null;
          
          // Retreats must be highly rated
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

          const originalReviews = ((item.reviews as Record<string, unknown>[]) || [])
            .filter((r) => r.textTranslated || r.text)
            .slice(0, 5);
            
          let finalName = name;
          let finalReviews = originalReviews.map(r => String(r.textTranslated || r.text));
          let finalTagline = "";
          let finalDescription = "";
          let finalPriceTier = "$$";

          try {
            console.log(`   ✨ Generating Spiritual AI profile...`);
            const { object: profileData } = await generateObject({
              model: google('gemini-2.5-flash'),
              schema: z.object({
                name: z.string().describe("The clean business name."),
                tagline: z.string().describe("A short, catchy, 3-5 word spiritual tagline. E.g., 'Ancestral Plant Medicine', 'Holistic Yoga Sanctuary'"),
                description: z.string().describe("A 1-2 sentence description emphasizing the spiritual, healing, or transformational aspect of the retreat based on reviews."),
                priceTier: z.enum(["$$", "$$$", "$$$$"]).describe("Estimated price tier based on luxury vs rustic vibe in reviews. Default to $$$."),
                reviews: z.array(z.string()).describe("The translated reviews in perfect natural English.")
              }),
              prompt: `Analyze this spiritual center/retreat data for a tourist directory. Generate an engaging profile.\n\nJSON Data:\n${JSON.stringify({ name, reviews: finalReviews })}`
            });
            finalName = profileData.name;
            finalReviews = profileData.reviews;
            finalTagline = profileData.tagline;
            finalDescription = profileData.description;
            finalPriceTier = profileData.priceTier;
          } catch (generationErr) {
            console.warn(`   ⚠️ Profile generation failed, using fallbacks.`);
            finalTagline = `Spiritual Center in ${locationSlug}`;
          }

          const reviewsData = originalReviews.map((r, index) => ({
            text: finalReviews[index] || String(r.textTranslated || r.text),
            author: "Retreat Guest",
            rating: Number(r.stars),
          }));

          const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);

          await prisma.business.create({
            data: {
              name: finalName,
              slug,
              category: "Spiritual",
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
              featuresJson: "[]",
              ...(reviewsData.length > 0 && { reviews: { create: reviewsData } }),
            },
          });

          added++;
          console.log(`   ✅ Added: ${finalName} | Tier: ${finalPriceTier}`);
        } catch (err) {
          console.error(`   ❌ Error:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.error(`   ❌ Search failed: ${(err as Error).message}`);
    }
  }

  console.log(`\n🙏 Done! Added: ${added} new spiritual centers | Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
