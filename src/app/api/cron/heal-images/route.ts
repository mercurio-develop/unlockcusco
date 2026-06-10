import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApifyClient } from 'apify-client';

export const maxDuration = 300; // Allow up to 5 minutes for this cron job if on Pro, 10s on Hobby

function enhanceImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.includes('=w')) {
    return url.replace(/=w\d+-h\d+-k-no/g, '=s1600');
  }
  return url;
}

export async function GET(req: Request) {
  try {
    // Vercel Cron Security: Ensure the request comes from Vercel
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('🔄 Starting Image Healing CRON job...');

    const businesses = await prisma.business.findMany({
      where: {
        imageUrl: { contains: 'googleusercontent.com' }
      },
      select: { id: true, name: true, locationSlug: true, imageUrl: true }
    });

    const brokenBusinesses = [];

    // Step 1: Detect broken images
    for (const b of businesses) {
      if (!b.imageUrl) continue;
      try {
        const response = await fetch(b.imageUrl, { method: 'HEAD' });
        if (response.status === 403 || response.status === 404) {
          brokenBusinesses.push(b);
        }
      } catch {
        brokenBusinesses.push(b); // If fetch fails entirely, assume broken
      }
    }

    console.log(`Found ${brokenBusinesses.length} broken images out of ${businesses.length} checked.`);

    if (brokenBusinesses.length === 0) {
      return NextResponse.json({ success: true, message: 'All images are healthy.', brokenCount: 0, fixedCount: 0 });
    }

    // Step 2: Heal broken images via Apify
    const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
    let fixedCount = 0;

    for (const target of brokenBusinesses) {
      const loc = target.locationSlug ? target.locationSlug.replace('-', ' ') : 'Cusco';
      const searchString = `${target.name}, ${loc}`;
      console.log(`🔍 Healing: "${searchString}"`);
      
      try {
        const run = await apifyClient.actor("compass/google-maps-extractor").call({
          searchStringsArray: [searchString],
          maxCrawledPlacesPerSearch: 1,
          language: "en",
          maxImages: 5,
          maxReviews: 0,
          extractOpeningHours: false,
          skipClosedPlaces: false,
          includeWebResults: false
        });

        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        
        if (items.length > 0) {
          const item = items[0];
          const images = (item.imageUrls as string[]) || [];
          if (item.imageUrl) images.unshift(item.imageUrl as string);
          
          const validImageUrl = images.find(url => !url.includes('streetviewpixels'));
          
          if (validImageUrl) {
            const enhanced = enhanceImageUrl(validImageUrl);
            await prisma.business.update({
              where: { id: target.id },
              data: { ...(enhanced ? { imageUrl: enhanced } : {}) }
            });
            fixedCount++;
            console.log(`   ✅ Success! New URL: ${enhanced}`);
          } else {
            console.log(`   ❌ Only streetview found.`);
          }
        } else {
          console.log(`   ❌ No results for query.`);
        }
      } catch (e) {
        console.error(`   ❌ Apify Error for ${target.name}:`, e);
      }
    }

    console.log(`🎉 CRON Finished. Fixed ${fixedCount}/${brokenBusinesses.length} broken images.`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Healing complete.', 
      brokenCount: brokenBusinesses.length, 
      fixedCount 
    });

  } catch (error) {
    console.error('Fatal error in heal-images CRON:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
