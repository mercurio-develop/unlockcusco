/**
 * Google Indexing API Automation Script
 * 
 * This script allows you to push URLs directly to Google's indexing priority queue.
 * Default limit: 200 requests per day.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project or select an existing one.
 * 3. Enable the "Indexing API".
 * 4. Create a Service Account (IAM & Admin > Service Accounts).
 * 5. Download the JSON key file and save it as 'service-account.json' in the project root.
 * 6. Copy the Service Account email (e.g., your-sa@your-project.iam.gserviceaccount.com).
 * 7. Go to Google Search Console (https://search.google.com/search-console).
 * 8. Add the Service Account email as an 'Owner' or 'Full User' to your property.
 * 
 * USAGE:
 * npx tsx scripts/index-pages.ts
 */

import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const keyPath = path.join(process.cwd(), 'service-account.json');
  
  if (!fs.existsSync(keyPath)) {
    console.error('❌ Error: service-account.json not found in root directory.');
    console.info('Please follow the instructions in the script comments to set up your Google Cloud Service Account.');
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({
    version: 'v3',
    auth,
  });

  // 1. Fetch URLs to index
  // We'll prioritize businesses that are recently updated or associations
  const businesses = await prisma.business.findMany({
    where: {
      OR: [
        { isAsociado: true },
        { rating: { gt: 4.5 } }
      ]
    },
    select: { slug: true },
    take: 100 // Stay safe under the 200 daily limit
  });

  const urls = businesses.flatMap(b => [
    `https://unlockcusco.com/en/business/${b.slug}`,
    `https://unlockcusco.com/es/business/${b.slug}`
  ]);

  console.info(`🚀 Starting indexing for ${urls.length} URLs...`);

  for (const url of urls) {
    try {
      const res = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: 'URL_UPDATED',
        },
      });
      console.info(`✅ Indexed: ${url} (${res.status})`);
    } catch (error: any) {
      console.error(`❌ Failed to index ${url}:`, error.response?.data?.error?.message || error.message);
      
      // Stop if quota exceeded
      if (error.response?.data?.error?.code === 429) {
        console.error('🛑 Daily quota exceeded. Stopping.');
        break;
      }
    }
    
    // Slight delay to avoid burst limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.info('🏁 Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
