import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("🛠️ Starting Data Restoration from Backup JSONs...");

  // 1. Clear existing data to avoid conflicts
  console.log("🗑️ Clearing current database...");
  await prisma.review.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.tourPackage.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.business.deleteMany();
  await prisma.agency.deleteMany();

  const loadJson = (filename: string) => {
    const filePath = path.join(process.cwd(), 'prisma', filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  };

  // 2. Restore Agencies
  const backupAgencies = loadJson('backup_agency.json');
  console.log(`🏢 Restoring ${backupAgencies.length} Agencies...`);
  for (const a of backupAgencies) {
    let slug = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Check for slug collision
    const existing = await prisma.agency.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    await prisma.agency.create({
      data: {
        id: a.id,
        name: a.name,
        slug: slug,
        contactPhone: a.contactPhone,
        commissionRate: a.commissionRate,
        description: "", // Default for old data
        location: "Sacred Valley",
        imageUrl: "",
        specialties: "[]"
      }
    });
  }

  // 3. Restore Businesses
  const backupBusinesses = loadJson('backup_business.json');
  console.log(`🏪 Restoring ${backupBusinesses.length} Businesses...`);
  // Use createMany for speed if supported, but SQLite has limits on params.
  // We'll do chunks of 50.
  const businessChunks = [];
  for (let i = 0; i < backupBusinesses.length; i += 50) {
    businessChunks.push(backupBusinesses.slice(i, i + 50));
  }
  for (const chunk of businessChunks) {
    await prisma.business.createMany({
      data: chunk.map((b: any) => ({
        ...b,
        isClaimed: b.isClaimed === 1 || b.isClaimed === true
      }))
    });
  }

  // 4. Restore Reviews
  const backupReviews = loadJson('backup_review.json');
  console.log(`⭐ Restoring ${backupReviews.length} Reviews...`);
  
  // Get valid business IDs to avoid FK violations
  const validBusinessIds = new Set((await prisma.business.findMany({ select: { id: true } })).map(b => b.id));
  const filteredReviews = backupReviews.filter((r: any) => validBusinessIds.has(r.businessId));
  
  console.log(`⭐ Found ${filteredReviews.length} valid reviews out of ${backupReviews.length}.`);

  const reviewChunks = [];
  for (let i = 0; i < filteredReviews.length; i += 50) {
    reviewChunks.push(filteredReviews.slice(i, i + 50));
  }
  for (const chunk of reviewChunks) {
    await prisma.review.createMany({ data: chunk });
  }

  // 5. Restore TourPackages
  const backupPackages = loadJson('backup_tourpackage.json');
  console.log(`📦 Restoring ${backupPackages.length} TourPackages...`);
  for (const p of backupPackages) {
    await prisma.tourPackage.create({
      data: {
        id: p.id,
        title: p.title,
        sector: p.sector,
        pace: p.pace,
        description: p.description,
        basePriceUsd: p.basePriceUsd,
        tags: p.tags,
        agencyId: p.agencyId, // Might be null
        difficulty: p.difficulty || "MODERATE",
        maxAltitude: p.maxAltitude,
        durationDays: p.durationDays || 1,
        included: p.included || "[]"
      }
    });
  }

  // 6. Restore Trips
  const backupTrips = loadJson('backup_trip.json');
  console.log(`🗺️ Restoring ${backupTrips.length} Trips...`);
  for (const t of backupTrips) {
    await prisma.trip.create({
      data: {
        ...t,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        createdAt: new Date(t.createdAt),
        isVerifiedTemplate: t.isVerifiedTemplate === 1 || t.isVerifiedTemplate === true
      }
    });
  }

  // 7. Restore TripDays
  const backupTripDays = loadJson('backup_tripday.json');
  console.log(`📅 Restoring ${backupTripDays.length} TripDays...`);
  for (const d of backupTripDays) {
    await prisma.tripDay.create({
      data: {
        ...d,
        date: new Date(d.date),
        isAgencyLocked: d.isAgencyLocked === 1 || d.isAgencyLocked === true,
        isCustomized: d.isCustomized === 1 || d.isCustomized === true
      }
    });
  }

  console.log("✨ Restoration Complete!");
}

main()
  .catch(e => {
    console.error("❌ Restoration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Cleanup JSON files
    ['backup_agency.json', 'backup_business.json', 'backup_review.json', 'backup_tourpackage.json', 'backup_trip.json', 'backup_tripday.json'].forEach(f => {
      try { fs.unlinkSync(path.join(process.cwd(), 'prisma', f)); } catch(e) {}
    });
  });
