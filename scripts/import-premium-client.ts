import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

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

async function generateAIDescriptions(businessId: string, name: string, reviews: any[]) {
  console.log(`\n🤖 Generating AI Descriptions for ${name}...`);
  const reviewsText = reviews.map(r => `- ${r.text}`).join('\n');

  const prompt = `
You are an expert travel writer and critic. Based ONLY on the following customer reviews, generate two descriptions for this business:

1. A Zagat-style description: 1 or 2 punchy sentences focusing exclusively on positive sentiments. Weave short direct quotes (1-3 words) from the reviews into the sentence using quotes. Maximum 25 words.
2. A Long description: 2-3 paragraphs providing a comprehensive, compelling overview of the experience, atmosphere, and service based on the reviews. Write it in an engaging, professional tone.

Additionally, infer the price tier: '$' (budget), '$$' (moderate), '$$$' (expensive), or '$$$$' (luxury). Default to '$$' if unsure.

Business Name: ${name}

Reviews:
${reviewsText}
  `;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        zagatDescription: z.string().describe('The short Zagat-style description'),
        longDescription: z.string().describe('The long, multi-paragraph description'),
        priceTier: z.enum(['$', '$$', '$$$', '$$$$']).describe('The inferred price tier')
      }),
      prompt: prompt,
    });

    let cleanZagat = object.zagatDescription.trim();
    if (cleanZagat.startsWith('"') && cleanZagat.endsWith('"')) {
        cleanZagat = cleanZagat.substring(1, cleanZagat.length - 1);
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { 
        description: cleanZagat,
        longDescription: object.longDescription,
        priceTier: object.priceTier
      }
    });

    console.log(`   ✅ AI Zagat Description: ${cleanZagat}`);
    console.log(`   ✅ AI Price Tier: ${object.priceTier}`);
    console.log(`   ✅ AI Long Description generated successfully.`);
  } catch (err) {
    console.error(`❌ Error generating AI descriptions:`, err);
  }
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
      console.log(`   Added ${data.reviews.length} reviews. Running AI Generation...`);
      await generateAIDescriptions(business.id, business.name, data.reviews);
    } else {
      console.log(`   ⚠️ No reviews provided. Ask the client for 10 reviews to generate AI descriptions!`);
    }

    console.log(`\n🎉 Profile is ready! View it here:`);
    console.log(`   🇬🇧 EN: http://localhost:3000/en/business/${business.slug}`);
    console.log(`   🇪🇸 ES: http://localhost:3000/es/business/${business.slug}\n`);

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
