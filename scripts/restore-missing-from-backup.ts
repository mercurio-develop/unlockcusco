import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const CATEGORY_MAP: Record<string, string> = {
  'aventura': 'Adventure',
  'adventure': 'Adventure',
  'descanso': 'Wellness',
  'bienestar': 'Wellness',
  'therapy': 'Wellness',
  'therapist': 'Wellness',
  'cultura': 'Culture',
  'taxi': 'Transport',
  'guide': 'GUIDE',
  'guia': 'GUIDE',
};

function normalizeCategory(cat: string): string {
  const lower = (cat || '').toLowerCase().trim();
  return CATEGORY_MAP[lower] || cat;
}

const MOCK_KEYWORDS = ['dummy', 'mock', 'test', 'example'];

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  console.log(`=== Restoring Missing Businesses from Backup ${isDryRun ? '(DRY RUN)' : ''} ===`);

  const backupPath = path.join(process.cwd(), 'prisma', 'backup_business.json');
  if (!fs.existsSync(backupPath)) {
    console.error("Backup file not found at:", backupPath);
    process.exit(1);
  }

  const backupData: any[] = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`Loaded ${backupData.length} businesses from backup.`);

  const currentBusinesses = await prisma.business.findMany({
    select: { name: true, whatsapp: true }
  });

  const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

  const currentNamesNorm = new Set(currentBusinesses.map(b => normalizeName(b.name)));
  
  const currentWhatsapps = new Set(
    currentBusinesses
      .filter(b => b.whatsapp && b.whatsapp.length > 5)
      .map(b => b.whatsapp)
  );

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const b of backupData) {
    const isMock = MOCK_KEYWORDS.some(kw => b.name.toLowerCase().includes(kw));
    if (isMock) {
      skipped++;
      continue;
    }

    const normName = normalizeName(b.name);
    
    // Check if it exists by name or by WhatsApp
    let exists = currentNamesNorm.has(normName);
    if (!exists && b.whatsapp && b.whatsapp.length > 5) {
      exists = currentWhatsapps.has(b.whatsapp);
    }

    if (exists) {
      skipped++;
      continue;
    }

    const slug = b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (isDryRun) {
      console.log(`[DRY RUN] Would insert: [${normalizeCategory(b.category)}] ${b.name}`);
      inserted++;
    } else {
      try {
        await prisma.business.upsert({
          where: { slug },
          update: {}, // Don't overwrite if it magically exists by slug
          create: {
            slug,
            name: b.name,
            category: normalizeCategory(b.category),
            locationSlug: b.locationSlug,
            lat: b.lat,
            lng: b.lng,
            whatsapp: b.whatsapp,
            rating: b.rating,
            reviewsCount: b.reviewsCount || 0,
            imageUrl: b.imageUrl,
            tagline: b.tagline,
            description: b.description,
            priceTier: b.priceTier,
            instagramFollowers: b.instagramFollowers || 0,
            isClaimed: false,
            isAsociado: false,
          }
        });
        inserted++;
      } catch (err: any) {
        console.error(`Error inserting ${b.name}:`, err.message);
        errors++;
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total Backup Records: ${backupData.length}`);
  console.log(`Inserted (or would be): ${inserted}`);
  console.log(`Skipped (Exists/Mock): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
