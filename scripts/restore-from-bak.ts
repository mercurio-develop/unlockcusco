import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("🛠️ Starting Data Restoration from Backup JSONs...");

  const loadJson = (filename: string) => {
    const filePath = path.join(process.cwd(), 'prisma', filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return [];
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ Loaded ${data.length} records from ${filename}`);
    return data;
  };

  // 1. Clear existing data to avoid conflicts
  console.log("🗑️ Clearing current database...");
  await prisma.review.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.tourPackage.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.business.deleteMany();
  await prisma.agency.deleteMany();

  // 2. Restore Agencies
  const backupAgencies = loadJson('backup_agency.json');
  for (const a of backupAgencies) {
    let slug = a.slug || a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Ensure unique slug
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
        tagline: a.tagline || "",
        description: a.description || "",
        location: a.location || "Sacred Valley",
        imageUrl: a.imageUrl || "",
        guideName: a.guideName || "",
        specialties: a.specialties || "[]",
        contactEmail: a.contactEmail || "",
        themeConfig: a.themeConfig || "{}"
      }
    });
  }

  // 3. Restore Businesses
  const backupBusinesses = loadJson('backup_business.json');
  // Chunks of 50 to avoid SQLite limits
  for (let i = 0; i < backupBusinesses.length; i += 50) {
    const chunk = backupBusinesses.slice(i, i + 50);
    await prisma.business.createMany({
      data: chunk.map((b: any) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        category: b.category,
        lat: b.lat,
        lng: b.lng,
        rating: b.rating,
        reviewsCount: b.reviewsCount || 0,
        imageUrl: b.imageUrl,
        whatsapp: b.whatsapp,
        isClaimed: b.isClaimed === 1 || b.isClaimed === true,
        locationSlug: b.locationSlug || "",
        categorySlug: b.categorySlug || "",
        instagramHandle: b.instagramHandle,
        instagramFollowers: b.instagramFollowers || 0,
        heroImages: b.heroImages || "[]",
        businessType: b.businessType || "place",
        serviceZones: b.serviceZones || "[]",
        elevationMeters: b.elevationMeters,
        avgDwellTimeMins: b.avgDwellTimeMins || 60,
        marginTier: b.marginTier || "STANDARD",
        viewsCount: b.viewsCount || 0,
        whatsappClicksCount: b.whatsappClicksCount || 0,
        aiRecommendationsCount: b.aiRecommendationsCount || 0
      }))
    });
  }

  // 4. Restore Reviews
  const backupReviews = loadJson('backup_review.json');
  // Get valid business IDs to avoid FK violations
  const validBusinessIds = new Set((await prisma.business.findMany({ select: { id: true } })).map(b => b.id));
  const filteredReviews = backupReviews.filter((r: any) => validBusinessIds.has(r.businessId));
  
  for (let i = 0; i < filteredReviews.length; i += 50) {
    const chunk = filteredReviews.slice(i, i + 50);
    await prisma.review.createMany({ data: chunk });
  }

  // 5. Restore TourPackages
  const backupPackages = loadJson('backup_tourpackage.json');
  for (const p of backupPackages) {
    await prisma.tourPackage.create({
      data: {
        id: p.id,
        agencyId: p.agencyId,
        title: p.title,
        tagline: p.tagline || "",
        sector: p.sector,
        pace: p.pace || "BALANCED",
        description: p.description,
        basePriceUsd: p.basePriceUsd,
        difficulty: p.difficulty || "MODERATE",
        maxAltitude: String(p.maxAltitude || ""),
        durationDays: p.durationDays || 1,
        durationStr: p.durationStr || "",
        elevation: p.elevation || "",
        bestSeason: p.bestSeason || "",
        tags: p.tags || "",
        included: p.included || "[]",
        notIncluded: p.notIncluded || "[]",
        highlights: p.highlights || "[]",
        requirements: p.requirements || "[]",
        itineraryJson: p.itineraryJson || "[]",
        galleryJson: p.galleryJson || "[]"
      }
    });
  }

  // 6. Restore Trips
  const backupTrips = loadJson('backup_trip.json');
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
  });
