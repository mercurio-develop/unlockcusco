import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to unified polymorphic Business model...');

  const backupDir = path.join(process.cwd(), 'prisma');

  // Helper to read backup files
  const readBackup = (filename: string) => {
    const filePath = path.join(backupDir, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return [];
  };

  const businesses = readBackup('backup_business.json');
  const agencies = readBackup('backup_agency.json');
  const reviews = readBackup('backup_review.json');
  const tourPackages = readBackup('backup_tourpackage.json');
  const trips = readBackup('backup_trip.json');
  const tripDays = readBackup('backup_tripday.json');

  console.log(`Found ${businesses.length} businesses, ${agencies.length} agencies.`);

  await prisma.$transaction(async (tx) => {
    // 1. Migrate Businesses
    for (const b of businesses) {
      const isClaimed = b.isClaimed === 1 || b.isClaimed === true;
      const category = b.category ? b.category.toUpperCase() : 'DINING';
      
      const mappedData = {
        id: b.id,
        slug: b.slug,
        name: b.name,
        category: category,
        lat: b.lat,
        lng: b.lng,
        rating: b.rating,
        reviewsCount: b.reviewsCount || 0,
        imageUrl: b.imageUrl || '',
        heroImages: b.heroImages || '[]',
        whatsapp: b.whatsapp,
        isClaimed: isClaimed,
        locationSlug: b.locationSlug || '',
        tagline: b.tagline || '',
        description: b.description || '',
        contactEmail: b.contactEmail || '',
        socialLinks: b.socialLinks || '{}',
        instagramHandle: b.instagramHandle,
        instagramFollowers: b.instagramFollowers || 0,
        priceTier: b.priceTier || '$$',
        marginTier: b.marginTier || 'STANDARD',
        commissionRate: b.commissionRate || 0.05,
        viewsCount: b.viewsCount || 0,
        whatsappClicksCount: b.whatsappClicksCount || 0,
        aiRecommendationsCount: b.aiRecommendationsCount || 0,
        vehicleType: null,
        capacity: null,
        serviceZones: b.serviceZones || '[]',
        guideName: null,
        seoMetaTitle: null,
        seoMetaDesc: null,
        specialties: b.specialties || '[]',
        themeConfig: b.themeConfig || '{}',
        featuresJson: b.featuresJson || '[]',
      };

      await tx.business.upsert({
        where: { id: b.id },
        update: mappedData,
        create: mappedData
      });
    }

    // 2. Migrate Agencies
    for (const a of agencies) {
      const baseSlug = a.slug || a.name.toLowerCase().replace(/\\s+/g, '-');
      // If this slug already exists in the new business table, we need to make it unique
      let finalSlug = baseSlug;
      const existing = await tx.business.findUnique({ where: { slug: baseSlug }});
      if (existing && existing.id !== a.id) {
        finalSlug = `${baseSlug}-${a.id.substring(0, 6)}`;
      }
      
      const mappedData = {
          id: a.id,
          slug: finalSlug,
          name: a.name,
          category: 'ADVENTURE',
          description: a.description || '',
          tagline: a.tagline || '',
          locationSlug: a.location ? a.location.toLowerCase() : '',
          imageUrl: a.imageUrl || '',
          contactEmail: a.contactEmail || '',
          socialLinks: a.socialLinks || '{}',
          themeConfig: a.themeConfig || '{}',
          featuresJson: a.featuresJson || '[]',
          specialties: a.specialties || '[]',
          commissionRate: a.commissionRate || 0.05,
          guideName: a.guideName || '',
          seoMetaTitle: a.seoMetaTitle || '',
          seoMetaDesc: a.seoMetaDesc || '',
      };
      
      await tx.business.upsert({
        where: { id: a.id },
        update: mappedData,
        create: mappedData
      });
    }

    // 3. Migrate Reviews
    for (const r of reviews) {
      const exists = await tx.business.findUnique({ where: { id: r.businessId }});
      if (exists) {
        await tx.review.upsert({
          where: { id: r.id },
          update: { ...r },
          create: { ...r }
        });
      }
    }

    // 4. Migrate Tour Packages
    for (const tp of tourPackages) {
      await tx.tourPackage.upsert({
        where: { id: tp.id },
        update: {
          title: tp.title,
          tagline: tp.tagline || '',
          sector: tp.sector || '',
          pace: tp.pace || 'BALANCED',
          description: tp.description || '',
          basePriceUsd: tp.basePriceUsd || 0,
          difficulty: tp.difficulty || 'MODERATE',
          maxAltitude: tp.maxAltitude || '',
          durationDays: tp.durationDays || 1,
          durationStr: tp.durationStr || '',
          elevation: tp.elevation || '',
          bestSeason: tp.bestSeason || '',
          packageType: tp.packageType || 'SINGLE_DAY',
          tags: tp.tags || '',
          included: tp.included || '[]',
          notIncluded: tp.notIncluded || '[]',
          highlights: tp.highlights || '[]',
          requirements: tp.requirements || '[]',
          itineraryJson: tp.itineraryJson || '[]',
          galleryJson: tp.galleryJson || '[]',
          heroImage: tp.heroImage || '',
          businessId: tp.agencyId,
        },
        create: {
          id: tp.id,
          title: tp.title,
          tagline: tp.tagline || '',
          sector: tp.sector || '',
          pace: tp.pace || 'BALANCED',
          description: tp.description || '',
          basePriceUsd: tp.basePriceUsd || 0,
          difficulty: tp.difficulty || 'MODERATE',
          maxAltitude: tp.maxAltitude || '',
          durationDays: tp.durationDays || 1,
          durationStr: tp.durationStr || '',
          elevation: tp.elevation || '',
          bestSeason: tp.bestSeason || '',
          packageType: tp.packageType || 'SINGLE_DAY',
          tags: tp.tags || '',
          included: tp.included || '[]',
          notIncluded: tp.notIncluded || '[]',
          highlights: tp.highlights || '[]',
          requirements: tp.requirements || '[]',
          itineraryJson: tp.itineraryJson || '[]',
          galleryJson: tp.galleryJson || '[]',
          heroImage: tp.heroImage || '',
          businessId: tp.agencyId,
        }
      });
    }

    // 5. Migrate Trips
    for (const t of trips) {
      const dStart = t.startDate ? new Date(t.startDate) : new Date();
      const dEnd = t.endDate ? new Date(t.endDate) : new Date();
      const dCreated = t.createdAt ? new Date(t.createdAt) : new Date();
      await tx.trip.upsert({
        where: { id: t.id },
        update: {
          tripTitle: t.tripTitle,
          startDate: dStart,
          endDate: dEnd,
          paxCount: t.paxCount || 1,
          baseCampStrategy: t.baseCampStrategy || '',
          shareToken: t.shareToken,
          status: t.status || 'DRAFT',
          totalPriceUsd: t.totalPriceUsd || 0,
          createdAt: dCreated,
          isVerifiedTemplate: t.isVerifiedTemplate ? true : false,
          templateVibeTags: t.templateVibeTags,
          clonedFromId: t.clonedFromId,
          userId: t.userId,
          businessId: t.agencyId,
        },
        create: {
          id: t.id,
          tripTitle: t.tripTitle,
          startDate: dStart,
          endDate: dEnd,
          paxCount: t.paxCount || 1,
          baseCampStrategy: t.baseCampStrategy || '',
          shareToken: t.shareToken,
          status: t.status || 'DRAFT',
          totalPriceUsd: t.totalPriceUsd || 0,
          createdAt: dCreated,
          isVerifiedTemplate: t.isVerifiedTemplate ? true : false,
          templateVibeTags: t.templateVibeTags,
          clonedFromId: t.clonedFromId,
          userId: t.userId,
          businessId: t.agencyId,
        }
      });
    }

    // 6. Migrate TripDays
    for (const td of tripDays) {
      await tx.tripDay.upsert({
        where: { id: td.id },
        update: {
          dayNumber: td.dayNumber,
          date: td.date ? new Date(td.date) : new Date(),
          sleepTown: td.sleepTown || '',
          tourPackageId: td.tourPackageId,
          dayTheme: td.dayTheme || '',
          guideNotes: td.guideNotes,
          startTime: td.startTime || '08:00 AM',
          meetingPoint: td.meetingPoint,
          eventsJson: td.eventsJson || '[]',
          isAgencyLocked: td.isAgencyLocked === 1 || td.isAgencyLocked === true,
          isCustomized: td.isCustomized === 1 || td.isCustomized === true,
          tripId: td.tripId,
        },
        create: {
          id: td.id,
          dayNumber: td.dayNumber,
          date: td.date ? new Date(td.date) : new Date(),
          sleepTown: td.sleepTown || '',
          tourPackageId: td.tourPackageId,
          dayTheme: td.dayTheme || '',
          guideNotes: td.guideNotes,
          startTime: td.startTime || '08:00 AM',
          meetingPoint: td.meetingPoint,
          eventsJson: td.eventsJson || '[]',
          isAgencyLocked: td.isAgencyLocked === 1 || td.isAgencyLocked === true,
          isCustomized: td.isCustomized === 1 || td.isCustomized === true,
          tripId: td.tripId,
        }
      });
    }
  });

  console.log('Migration complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
