import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

/**
 * UNIFIED BUSINESS ENRICHMENT SCRIPT
 * 
 * 1. Finds businesses missing reviews, ratings, or descriptions.
 * 2. Scrapes Google Maps via Apify for missing reviews.
 * 3. Calculates dynamic ratings from the stored reviews (replacing "New" with actual data).
 * 4. Generates punchy, Zagat-style descriptions using Gemini 2.5 Flash.
 */

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

async function main() {
  console.log("🚀 Starting Business Enrichment Process...");

  // 1. Find targets: Missing description OR missing/zero rating OR < 5 reviews
  const allBusinesses = await prisma.business.findMany({
    include: {
      _count: {
        select: { reviews: true }
      },
      reviews: true
    }
  });

  const businesses = allBusinesses.filter(b => 
    b.description === "" || 
    b.rating === null || 
    b.rating === 0 || 
    b._count.reviews < 5
  );

  console.log(`📊 Found ${businesses.length} businesses requiring enrichment.`);

  // 2. Batch Scraping for those needing more reviews
  const businessesToScrape = businesses.filter(b => b._count.reviews < 5);
  console.log(`🔍 ${businessesToScrape.length} businesses need more reviews from Google Maps.`);

  if (businessesToScrape.length > 0) {
    const CHUNK_SIZE = 25; 
    for (let i = 0; i < businessesToScrape.length; i += CHUNK_SIZE) {
      const chunk = businessesToScrape.slice(i, i + CHUNK_SIZE);
      const searchStrings = chunk.map(b => `${b.name} ${b.locationSlug || ''} Cusco Peru`);
      
      console.log(`\n📦 Scraping batch ${Math.floor(i/CHUNK_SIZE) + 1} (${chunk.length} businesses)...`);
      
      try {
        const run = await apifyClient.actor("compass/google-maps-extractor").call({
          searchStringsArray: searchStrings,
          maxCrawledPlacesPerSearch: 1,
          language: "en",
          maxReviews: 10,
          reviewsSort: "newest",
          scrapeReviewerName: true,
          includeWebResults: false
        });

        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        console.log(`✅ Apify run finished. Found ${items.length} potential matches.`);

        for (const item of items) {
          const itemTitle = String(item.title || "").toLowerCase();
          const itemSearchStr = String(item.searchString || "").toLowerCase();
          
          // Match logic: title or search string match
          const matchingBusiness = chunk.find(b => 
             itemTitle.includes(b.name.toLowerCase()) || 
             b.name.toLowerCase().includes(itemTitle) ||
             itemSearchStr.includes(b.name.toLowerCase())
          );

          if (matchingBusiness) {
            const newReviews = ((item.reviews as any[]) || [])
              .filter(r => r.text && r.stars)
              .map(r => ({
                text: String(r.text),
                author: String(r.name || "Google Reviewer"),
                rating: Number(r.stars),
              }));

            if (newReviews.length > 0) {
              const existingTexts = new Set(matchingBusiness.reviews.map(r => r.text));
              const uniqueReviews = newReviews.filter(r => !existingTexts.has(r.text));

              if (uniqueReviews.length > 0) {
                await prisma.business.update({
                  where: { id: matchingBusiness.id },
                  data: {
                    reviews: { create: uniqueReviews },
                    // Also sync total count from Google if available
                    reviewsCount: Math.max(matchingBusiness.reviewsCount, (item.reviewsCount as number) ?? 0)
                  }
                });
                console.log(`   ✨ Added ${uniqueReviews.length} reviews for "${matchingBusiness.name}"`);
                // Update local memory for subsequent steps
                matchingBusiness.reviews.push(...(uniqueReviews as any));
              }
            }
          }
        }
      } catch (err: any) {
        console.error(`   ❌ Apify error in batch: ${err.message}`);
      }
    }
  }

  // 3. Re-calculate ratings and generate descriptions
  console.log("\n🖋️  Calculating dynamic ratings and generating Zagat descriptions...");
  
  // Refetch to get fresh data after scraping if needed, but we updated matchingBusiness.reviews inline
  // Let's do a final fetch for safety
  const finalTargets = await prisma.business.findMany({
    include: { reviews: true }
  });

  let updateCount = 0;

  for (const b of finalTargets) {
    const hasReviews = b.reviews.length > 0;
    
    // Calculate Average Rating
    let dynamicRating = b.rating;
    if (hasReviews) {
      const sum = b.reviews.reduce((acc, r) => acc + r.rating, 0);
      dynamicRating = Number((sum / b.reviews.length).toFixed(1));
    }

    // Skip if it already has a description AND rating is already correct
    if (b.description !== "" && b.rating === dynamicRating) continue;

    console.log(`\n📝 Processing "${b.name}" (${b.reviews.length} reviews, Rating: ${dynamicRating || "N/A"})`);

    let description = b.description;
    if (b.description === "") {
      const reviewsText = b.reviews.slice(0, 10).map(r => `- ${r.text}`).join('\n');
      
      const prompt = hasReviews 
        ? `You are an expert travel and food critic writing in the classic Zagat style. 
           Based ONLY on these customer reviews, write a 1 or 2 sentence punchy description for "${b.name}".
           In true Zagat style, weave short direct quotes (1-3 words) from the reviews into the sentence, enclosing the quoted words in single or double quotes.
           Keep it extremely brief (max 25 words).
           
           Reviews:
           ${reviewsText}`
        : `You are an expert travel and food critic writing in the classic Zagat style.
           Write a 1-sentence punchy description for "${b.name}" (${b.category} in ${b.locationSlug}).
           Use short, descriptive phrases that sound like quotes. Keep it under 25 words.`;

      try {
        const { text } = await generateText({
          model: google('gemini-2.5-flash'),
          prompt: prompt,
        });

        description = text.trim().replace(/^"|"$/g, '');
        console.log(`   💬 New Description: ${description}`);
      } catch (err: any) {
        console.error(`   ❌ Gemini error: ${err.message}`);
      }
    }

    // Update Business record
    await prisma.business.update({
      where: { id: b.id },
      data: {
        rating: dynamicRating,
        description: description
      }
    });
    updateCount++;

    // Small delay for rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n✅ Enrichment complete! Updated ${updateCount} businesses.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
