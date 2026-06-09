import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const prisma = new PrismaClient();

async function checkUrl(url: string): Promise<boolean> {
  if (!url) return false;
  // Local assets are valid
  if (url.startsWith("/")) return true;
  if (!url.startsWith("http")) return false;
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    
    // Try HEAD request first with User-Agent
    let res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(id);

    // If HEAD is blocked or returns non-200, try a GET request but abort quickly
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
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+-k-no/g, '=s1600');
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
  console.log('🔍 Auditing database for broken images...');

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, imageUrl: true, googleMapsUrl: true, googlePlaceId: true, category: true, locationSlug: true }
  });

  const broken: typeof businesses = [];
  
  // Audit all businesses in batches
  const batchSize = 15;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    await Promise.all(batch.map(async (b) => {
      let isBroke = false;
      if (!b.imageUrl || b.imageUrl === "") {
        isBroke = true;
      } else {
        const isValid = await checkUrl(b.imageUrl);
        if (!isValid) {
          isBroke = true;
        }
      }
      if (isBroke) {
        broken.push(b);
      }
    }));
  }

  console.log(`\n--- Broken Image Summary ---`);
  console.log(`Total Businesses Audited: ${businesses.length}`);
  console.log(`Broken/Missing Images: ${broken.length}`);

  if (broken.length === 0) {
    console.log('✅ No broken images found in the database!');
    return;
  }

  console.log(`\nBroken List (Truncated to first 10):`);
  broken.slice(0, 10).forEach((b, idx) => {
    console.log(`${idx + 1}. ${b.name} (${b.imageUrl ? 'Stale: ' + b.imageUrl.substring(0, 50) + '...' : 'Missing'})`);
  });

  const runApify = process.argv.includes('--run-apify');
  if (!runApify) {
    console.log('\n💡 To fix these broken images, run this script with --run-apify:');
    console.log('rtk ./node_modules/.bin/tsx scripts/utils/refresh-broken-images-apify.ts --run-apify [--limit <number>]');
    return;
  }

  // Parse limit (defaults to 5 to protect credits)
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(process.argv[limitIdx + 1], 10) : 5;
  
  const targets = broken.slice(0, limit);
  console.log(`\n🚀 Starting Apify image recovery pipeline for ${targets.length} businesses (Limit: ${limit})...`);
  
  if (!process.env.APIFY_API_TOKEN) {
    console.error('❌ Error: APIFY_API_TOKEN is missing in environment variables.');
    process.exit(1);
  }

  // Compile search queries (use Place ID URL for precise mapping if available)
  const queries = targets.map(b => {
    if (b.googleMapsUrl) return b.googleMapsUrl;
    if (b.googlePlaceId) return `https://www.google.com/maps/place/?q=place_id:${b.googlePlaceId}`;
    return `${b.name}, ${b.locationSlug || 'Cusco'}, Peru`;
  });
  
  try {
    console.log(`\nCalling Apify actor with ${queries.length} search queries in parallel...`);
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
    console.log(`\nApify actor finished. Scraped ${items.length} items. Mapping back to database...`);

    let updatedCount = 0;
    
    for (const b of targets) {
      // Find matching item in scraped results
      // Match by placeId, maps url, query matching, or name similarity
      const match = items.find(item => {
        if (b.googlePlaceId && item.placeId === b.googlePlaceId) return true;
        if (b.googleMapsUrl && item.url === b.googleMapsUrl) return true;
        
        // Match by exact query string
        const query = b.googleMapsUrl || (b.googlePlaceId ? `https://www.google.com/maps/place/?q=place_id:${b.googlePlaceId}` : `${b.name}, ${b.locationSlug || 'Cusco'}, Peru`);
        if (item.searchString && item.searchString === query) return true;

        // Loose name comparison with accent normalization
        const bName = normalizeText(b.name);
        const itemTitle = normalizeText(item.title as string || '');
        return itemTitle.includes(bName) || bName.includes(itemTitle);
      });

      if (match) {
        const images = (match.imageUrls as string[]) || [];
        if (match.imageUrl) images.unshift(match.imageUrl as string);
        
        const validImageUrl = images.find(url => url && !url.includes('streetviewpixels'));
        
        if (validImageUrl) {
          const enhanced = enhanceImageUrl(validImageUrl);
          if (enhanced) {
            await prisma.business.update({
              where: { id: b.id },
              data: { imageUrl: enhanced }
            });
            updatedCount++;
            console.log(`   ✅ Updated "${b.name}": ${enhanced}`);
          }
        } else {
          console.log(`   ❌ No street-view-free images found for "${b.name}" in scraped results.`);
        }
      } else {
        console.log(`   ❓ No Google Maps match found in dataset for "${b.name}"`);
      }
    }

    console.log(`\n✨ Apify recovery complete! Successfully updated ${updatedCount} business images.`);
  } catch (e) {
    console.error(`❌ Apify error: ${e instanceof Error ? e.message : String(e)}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
