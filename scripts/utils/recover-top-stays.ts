import { PrismaClient } from "@prisma/client";
import { ApifyClient } from "apify-client";
import "dotenv/config";

const prisma = new PrismaClient();
const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function checkUrl(url: string): Promise<boolean> {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  if (!url.startsWith("http")) return false;
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    
    let res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(id);

    if (res.status !== 200) {
      const getController = new AbortController();
      const getId = setTimeout(() => getController.abort(), 4000);
      res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Range": "bytes=0-0"
        },
        signal: getController.signal
      });
      clearTimeout(getId);
    }

    return res.status === 200 || res.status === 206;
  } catch (e) {
    return false;
  }
}

function enhanceImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.includes("=w")) {
    return url.replace(/=w\d+-h\d+-k-no/g, "=s1600");
  }
  return url;
}

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function main() {
  console.log("🔍 Fetching top 5 stays from Supabase database...");
  
  const topStays = await prisma.business.findMany({
    where: { 
      category: { in: ["stays", "STAYS"] }, 
      imageUrl: { not: "" } 
    },
    orderBy: { reviewsCount: "desc" },
    take: 5,
    select: { id: true, name: true, imageUrl: true, googleMapsUrl: true, googlePlaceId: true, locationSlug: true }
  });

  console.log(`\nFound Top 5 Stays:`);
  topStays.forEach((stay, index) => {
    console.log(`${index + 1}. ${stay.name} (Reviews: ${stay.imageUrl ? "Has image" : "No image"})`);
    console.log(`   URL: ${stay.imageUrl?.substring(0, 80)}...`);
  });

  const brokenStays: typeof topStays = [];
  console.log("\nAuditing image URLs...");
  for (const stay of topStays) {
    const isValid = await checkUrl(stay.imageUrl || "");
    if (!isValid) {
      console.log(`❌ "${stay.name}" has a BROKEN image link!`);
      brokenStays.push(stay);
    } else {
      console.log(`✅ "${stay.name}" has a WORKING image link.`);
    }
  }

  if (brokenStays.length === 0) {
    console.log("\n🎉 All top 5 stays have fully functional working image links! No updates needed.");
    return;
  }

  console.log(`\n🚀 Starting Apify image recovery for ${brokenStays.length} broken stays...`);
  if (!process.env.APIFY_API_TOKEN) {
    console.error("❌ Error: APIFY_API_TOKEN is missing in environment variables.");
    process.exit(1);
  }

  const queries = brokenStays.map(b => {
    if (b.googleMapsUrl) return b.googleMapsUrl;
    if (b.googlePlaceId) return `https://www.google.com/maps/place/?q=place_id:${b.googlePlaceId}`;
    return `${b.name}, ${b.locationSlug || "Cusco"}, Peru`;
  });

  try {
    const run = await apifyClient.actor("compass/google-maps-extractor").call({
      searchStringsArray: queries,
      maxCrawledPlacesPerSearch: 1,
      language: "en",
      maxImages: 5,
      maxReviews: 0,
      extractOpeningHours: false,
      skipClosedPlaces: false,
      includeWebResults: false
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`Apify completed. Scraped ${items.length} items. Mapping back...`);

    for (const b of brokenStays) {
      const match = items.find(item => {
        if (b.googlePlaceId && item.placeId === b.googlePlaceId) return true;
        if (b.googleMapsUrl && item.url === b.googleMapsUrl) return true;
        
        const query = b.googleMapsUrl || (b.googlePlaceId ? `https://www.google.com/maps/place/?q=place_id:${b.googlePlaceId}` : `${b.name}, ${b.locationSlug || "Cusco"}, Peru`);
        if (item.searchString && item.searchString === query) return true;

        const bName = normalizeText(b.name);
        const itemTitle = normalizeText(item.title as string || "");
        return itemTitle.includes(bName) || bName.includes(itemTitle);
      });

      if (match) {
        const images = (match.imageUrls as string[]) || [];
        if (match.imageUrl) images.unshift(match.imageUrl as string);
        
        const validImageUrl = images.find(url => url && !url.includes("streetviewpixels"));
        if (validImageUrl) {
          const enhanced = enhanceImageUrl(validImageUrl);
          if (enhanced) {
            await prisma.business.update({
              where: { id: b.id },
              data: { imageUrl: enhanced }
            });
            console.log(`   ✅ Updated "${b.name}": ${enhanced}`);
          }
        } else {
          console.log(`   ❌ No street-view-free images found for "${b.name}".`);
        }
      } else {
        console.log(`   ❓ No Google Maps match found in dataset for "${b.name}"`);
      }
    }
  } catch (e) {
    console.error(`❌ Apify execution error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
