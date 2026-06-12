import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PremiumClientData {
  business: {
    slug: string;
    name: string;
    category: string;
    tagline: string;
    taglineEs?: string;
    description: string;
    descriptionEs?: string;
    locationSlug: string;
    whatsapp: string;
    contactEmail?: string;
    imageUrl: string;
  };
  premiumProfile: {
    logoUrl?: string;
    coverPhotoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    fonts?: string;
    visionStatement?: string;
    pillars: Array<{
      title: string;
      titleEs?: string;
      description: string;
      descriptionEs?: string;
      icon: string;
    }>;
  };
  tourPackages?: Array<{
    title: string;
    titleEs?: string;
    tagline?: string;
    taglineEs?: string;
    description: string;
    descriptionEs?: string;
    durationDays?: number;
    difficulty?: string;
    pace?: string;
    basePriceUsd: number;
    included: string[];
    includedEs?: string[];
    highlights: string[];
    highlightsEs?: string[];
    itinerary: any[];
    itineraryEs?: any[];
    gallery: string[];
  }>;
  services?: Array<{
    title: string;
    titleEs?: string;
    description: string;
    descriptionEs?: string;
    priceUsd: number;
    durationMins: number;
  }>;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    textEn?: string;
    textEs?: string;
  }>;
}

async function importClient(filePath: string) {
  console.log(`📥 Reading onboarding data from ${filePath}...`);
  const rawData = fs.readFileSync(path.resolve(filePath), 'utf8');
  const data: PremiumClientData = JSON.parse(rawData);

  console.log(`🌱 Importing Premium Client: ${data.business.name}...`);

  try {
    // 1. Check if exists and delete
    const existing = await prisma.business.findUnique({
      where: { slug: data.business.slug }
    });

    if (existing) {
      await prisma.business.delete({ where: { slug: data.business.slug } });
      console.log(`   Deleted existing business with slug: ${data.business.slug}`);
    }

    // 2. Create the business and premium profile
    const createPayload: any = {
      slug: data.business.slug,
      name: data.business.name,
      category: data.business.category,
      tagline: data.business.tagline,
      taglineEs: data.business.taglineEs,
      description: data.business.description,
      descriptionEs: data.business.descriptionEs,
      locationSlug: data.business.locationSlug,
      whatsapp: data.business.whatsapp,
      contactEmail: data.business.contactEmail || "",
      isAsociado: true,
      isClaimed: true,
      imageUrl: data.business.imageUrl,
      
      premiumProfile: {
        create: {
          logoUrl: data.premiumProfile.logoUrl,
          coverPhotoUrl: data.premiumProfile.coverPhotoUrl,
          primaryColor: data.premiumProfile.primaryColor,
          accentColor: data.premiumProfile.accentColor,
          fonts: data.premiumProfile.fonts,
          visionStatement: data.premiumProfile.visionStatement,
          pillars: {
            create: data.premiumProfile.pillars
          }
        }
      }
    };

    // 3. Map Offerings
    if (data.tourPackages && data.tourPackages.length > 0) {
      createPayload.tourPackages = {
        create: data.tourPackages.map(pkg => ({
          title: pkg.title,
          titleEs: pkg.titleEs,
          tagline: pkg.tagline,
          taglineEs: pkg.taglineEs,
          description: pkg.description,
          descriptionEs: pkg.descriptionEs,
          durationDays: pkg.durationDays,
          difficulty: pkg.difficulty,
          pace: pkg.pace,
          basePriceUsd: pkg.basePriceUsd,
          included: JSON.stringify(pkg.included || []),
          includedEs: pkg.includedEs ? JSON.stringify(pkg.includedEs) : undefined,
          highlights: JSON.stringify(pkg.highlights || []),
          highlightsEs: pkg.highlightsEs ? JSON.stringify(pkg.highlightsEs) : undefined,
          itinerary: JSON.stringify(pkg.itinerary || []),
          itineraryEs: pkg.itineraryEs ? JSON.stringify(pkg.itineraryEs) : undefined,
          gallery: JSON.stringify(pkg.gallery || [])
        }))
      };
    }
    
    if (data.services && data.services.length > 0) {
      createPayload.services = { create: data.services };
    }

    if (data.reviews && data.reviews.length > 0) {
      createPayload.reviews = { create: data.reviews };
      
      // Calculate initial aggregate rating
      const avgRating = data.reviews.reduce((acc, r) => acc + r.rating, 0) / data.reviews.length;
      createPayload.rating = avgRating;
      createPayload.reviewsCount = data.reviews.length;
    }

    const business = await prisma.business.create({
      data: createPayload
    });

    console.log(`✅ Successfully imported ${business.name}!`);
    if (data.reviews && data.reviews.length > 0) {
      console.log(`   Added ${data.reviews.length} reviews. Next step: Run 'npx tsx scripts/generate-zagat-descriptions.ts'`);
    } else {
      console.log(`   ⚠️ No reviews provided. Ask the client for 10 reviews to generate AI descriptions!`);
    }

  } catch (error) {
    console.error(`❌ Error importing premium client:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.error("Please provide the path to the onboarding JSON file.");
  console.error("Usage: npx tsx scripts/import-premium-client.ts public/agencies/client/onboarding-data.json");
  process.exit(1);
}

importClient(targetFile);
