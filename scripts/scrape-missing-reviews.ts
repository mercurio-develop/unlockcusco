import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

async function main() {
  console.log("Fetching businesses missing descriptions...");
  
  const businesses = await prisma.business.findMany({
    where: {
      description: ""
    },
    include: {
      reviews: true
    }
  });

  console.log(`Found ${businesses.length} businesses missing a description.`);

  const businessesToScrape = businesses.filter(b => b.reviews.length < 5);
  console.log(`${businessesToScrape.length} businesses have < 5 reviews and need scraping.`);

  if (businessesToScrape.length > 0) {
    console.log(`Batch scraping reviews for ${businessesToScrape.length} businesses...`);
    
    // We'll batch in chunks of 50 to avoid any Apify array limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < businessesToScrape.length; i += CHUNK_SIZE) {
      const chunk = businessesToScrape.slice(i, i + CHUNK_SIZE);
      const searchStrings = chunk.map(b => `${b.name} ${b.locationSlug} Cusco Peru`);
      
      console.log(`\nStarting Apify run for batch of ${chunk.length} searches...`);
      try {
        const run = await apifyClient.actor("compass/google-maps-extractor").call({
          searchStringsArray: searchStrings,
          maxCrawledPlacesPerSearch: 1,
          language: "en",
          maxReviews: 5,
          reviewsSort: "newest",
          scrapeReviewerName: false,
          scrapeReviewerId: false,
          scrapeReviewerUrl: false,
          scrapeResponseFromOwnerText: false,
          includeWebResults: false
        });

        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        console.log(`Apify run finished. Found ${items.length} places in this batch.`);
        
        for (const item of items) {
          const itemTitle = String(item.title || "").toLowerCase();
          const itemSearchStr = String(item.searchString || "").toLowerCase();
          
          // Try to match the result back to our business
          const matchingBusiness = chunk.find(b => 
             itemTitle.includes(b.name.toLowerCase()) || 
             b.name.toLowerCase().includes(itemTitle) ||
             itemSearchStr.includes(b.name.toLowerCase())
          );
          
          if (matchingBusiness) {
            const newReviews = ((item.reviews as Record<string, unknown>[]) || [])
              .filter((r) => r.text && r.stars)
              .slice(0, 5)
              .map((r) => ({
                text: String(r.text),
                author: "Google Reviewer",
                rating: Number(r.stars),
              }));
              
            if (newReviews.length > 0) {
              const existingTexts = new Set(matchingBusiness.reviews.map(r => r.text));
              const reviewsToAdd = newReviews.filter(r => !existingTexts.has(r.text));
              
              if (reviewsToAdd.length > 0) {
                await prisma.business.update({
                  where: { id: matchingBusiness.id },
                  data: {
                    reviews: {
                      create: reviewsToAdd
                    },
                    reviewsCount: Math.max(matchingBusiness.reviewsCount, (item.reviewsCount as number) ?? 0)
                  }
                });
                console.log(` ✅ Added ${reviewsToAdd.length} reviews for ${matchingBusiness.name}`);
                matchingBusiness.reviews.push(...(reviewsToAdd as any));
              }
            }
          } else {
             // Let's print out what we missed
             console.log(` ⚠️ Could not match Apify result: "${item.title}" (search: "${item.searchString}") back to any business in chunk.`);
          }
        }
      } catch (err) {
        console.error(`Apify scraping failed for batch:`, (err as Error).message);
      }
    }
  }

  // Refetch to get the latest reviews for generation
  console.log(`\n\nGenerating descriptions for all ${businesses.length} businesses...`);
  const finalBusinesses = await prisma.business.findMany({
    where: { description: "" },
    include: { reviews: true }
  });

  for (const b of finalBusinesses) {
    const reviewsText = b.reviews.map(r => `- ${r.text}`).join('\n');
    let prompt = "";

    if (!reviewsText || reviewsText.trim().length === 0) {
      console.log(`Using generic prompt for ${b.name}`);
      prompt = `
You are a concise, expert travel and food critic writing in the classic Zagat style.
Write a 1 or 2 sentence punchy description for this business. 
In true Zagat style, use short descriptive phrases that sound like quotes.
Keep it extremely brief (max 20-25 words).

Business Name: ${b.name}
Category: ${b.category}
Location: ${b.locationSlug}
      `;
    } else {
      console.log(`Using reviews prompt for ${b.name} (${b.reviews.length} reviews)`);
      prompt = `
You are a concise, expert travel and food critic writing in the classic Zagat style.
Based ONLY on the following customer reviews, write a 1 or 2 sentence punchy description for this business. 
In true Zagat style, weave short direct quotes (1-3 words) from the reviews into the sentence, enclosing the quoted words in single or double quotes.
Do not add information that is not in the reviews. Keep it extremely brief (max 20-25 words).

Business Name: ${b.name}
Category: ${b.category}

Reviews:
${reviewsText}
      `;
    }

    try {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: prompt,
      });

      let cleanText = text.trim();
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
          cleanText = cleanText.substring(1, cleanText.length - 1);
      }

      console.log(`[${b.name}] Zagat Description: ${cleanText}`);

      await prisma.business.update({
        where: { id: b.id },
        data: { description: cleanText }
      });
    } catch (err) {
      console.error(`Error generating description for ${b.name}:`, err);
    }
    
    // Wait slightly to avoid rate limiting on Gemini
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\nAll done!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
