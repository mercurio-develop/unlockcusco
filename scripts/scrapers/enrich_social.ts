import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

// A simple delay function to respect rate limits if needed
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("🕵️ Starting the Meta Data Heist...");

  // Select a small batch of top-rated businesses that don't have an Instagram handle yet.
  // Using a small batch (e.g., 5) to avoid burning all Apify credits during testing.
  const businesses = await prisma.business.findMany({
    where: { instagramHandle: null },
    orderBy: { rating: 'desc' },
    take: 5,
  });

  if (businesses.length === 0) {
    console.log("✅ All businesses already enriched!");
    return;
  }

  console.log(`🎯 Targeting ${businesses.length} businesses for enrichment.\n`);

  for (const business of businesses) {
    console.log(`\n=============================================`);
    console.log(`📍 Target: ${business.name}`);
    
    let instagramHandle: string | null = null;

    try {
      // Step 1: The OSINT Discovery (Finding the Handles)
      console.log(`🔍 Step 1: Running Google Dork OSINT for Instagram handle...`);
      const googleDorkQuery = `"${business.name}" site:instagram.com`;
      
      const searchRun = await apifyClient.actor("apify/google-search-scraper").call({
        queries: googleDorkQuery,
        maxPagesPerQuery: 1,
        resultsPerPage: 3, // Just need the top result
      });

      const { items: searchResults } = await apifyClient.dataset(searchRun.defaultDatasetId).listItems();
      
      // Parse the first valid Instagram profile URL
      for (const result of searchResults) {
        if (result.organicResults && Array.isArray(result.organicResults)) {
          const firstHit = result.organicResults.find((r: any) => r.url.includes("instagram.com/"));
          if (firstHit) {
            const url = new URL(firstHit.url);
            // Example URL: https://www.instagram.com/kawsay_spa/
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
              // Ignore posts (p), reels (reel), etc., looking for a profile handle
              if (!['p', 'reel', 'tv', 'explore', 'tags'].includes(pathParts[0])) {
                instagramHandle = pathParts[0];
                console.log(`   ✅ Found Handle: @${instagramHandle}`);
                break;
              }
            }
          }
        }
      }

      if (!instagramHandle) {
        console.log(`   ⚠️ No Instagram handle found on Google. Skipping enrichment.`);
        continue;
      }

      // Step 2: The Surgical Strike (Extracting the Vibe)
      console.log(`\n📸 Step 2: Surgical Strike on Instagram Profile: @${instagramHandle}...`);
      const igRun = await apifyClient.actor("apify/instagram-profile-scraper").call({
        usernames: [instagramHandle],
        resultsType: "details",
      });

      const { items: igProfiles } = await apifyClient.dataset(igRun.defaultDatasetId).listItems();
      
      if (igProfiles.length === 0) {
        console.log(`   ⚠️ Instagram Profile Scraper returned no results for @${instagramHandle}.`);
        continue;
      }

      const profile = igProfiles[0] as any;
      const followers = profile.followersCount || 0;
      const biography = profile.biography || "";
      
      // Extract latest 3 high-res photos
      const latestPosts = profile.latestPosts || [];
      const extractedHighResPhotos = latestPosts
        .filter((post: any) => post.displayUrl || post.imageUrl)
        .slice(0, 3)
        .map((post: any) => post.displayUrl || post.imageUrl);

      console.log(`   📊 Followers: ${followers}`);
      console.log(`   🖼️  High-Res Photos Extracted: ${extractedHighResPhotos.length}`);

      // Optional: Extract WhatsApp from bio if it wasn't already on Google Maps
      let extractedBioPhoneRegex = business.whatsapp;
      if (!extractedBioPhoneRegex) {
        const phoneMatch = biography.match(/(?:\+|00)?(?:51)?\s*9\d{2}\s*\d{3}\s*\d{3}/);
        if (phoneMatch) {
          extractedBioPhoneRegex = phoneMatch[0].replace(/\D/g, '');
          // Keep only the 9 digits if it matched with country code
          if (extractedBioPhoneRegex && extractedBioPhoneRegex.length > 9) extractedBioPhoneRegex = extractedBioPhoneRegex.slice(-9);
          console.log(`   📱 Found WhatsApp in Bio: ${extractedBioPhoneRegex}`);
        }
      }

      // Step 3: The Prisma Merge
      console.log(`\n💾 Step 3: Merging data into Prisma Database...`);
      await prisma.business.update({
        where: { id: business.id },
        data: {
          instagramHandle: `@${instagramHandle}`,
          instagramFollowers: followers,
          heroImages: JSON.stringify(extractedHighResPhotos),
          ...(extractedBioPhoneRegex && { whatsapp: extractedBioPhoneRegex }),
        }
      });
      
      console.log(`   ✅ Successfully enriched: ${business.name}`);

    } catch (err) {
      console.error(`   ❌ Failed to enrich ${business.name}:`, (err as Error).message);
    }
    
    // Slight delay to prevent rate limits
    await delay(2000);
  }

  console.log(`\n✨ Meta Data Heist Complete!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
