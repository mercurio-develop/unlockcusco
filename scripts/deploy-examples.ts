import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

async function deployExample(markdownPath: string, businessSlug: string) {
  console.log(`\nParsing markdown for ${businessSlug}...`);
  const mdContent = fs.readFileSync(markdownPath, 'utf-8');
  
  const business = await prisma.business.findUnique({ 
    where: { slug: businessSlug },
    include: { reviews: { take: 10, orderBy: { rating: 'desc' } } }
  });
  
  if (!business) {
    console.error(`Could not find business ${businessSlug}`);
    return;
  }

  const prompt = `
Extract the premium profile details and offerings from this markdown project brief into a JSON object.

Markdown Content:
${mdContent}
`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        tagline: z.string(),
        premiumProfile: z.object({
          primaryColor: z.string(),
          accentColor: z.string(),
          fonts: z.string(),
          visionStatement: z.string(),
          pillars: z.array(z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string()
          }))
        }),
        tourPackages: z.array(z.object({
          title: z.string(),
          tagline: z.string(),
          description: z.string(),
          basePriceUsd: z.number(),
          included: z.array(z.string()),
          highlights: z.array(z.string())
        }))
      }),
      prompt
    });

    const clientData = {
      business: {
        slug: business.slug,
        name: business.name,
        category: business.category,
        tagline: object.tagline || business.tagline || "",
        locationSlug: business.locationSlug || "cusco",
        whatsapp: business.whatsapp || "51999999999",
        imageUrl: business.imageUrl
      },
      premiumProfile: {
        coverPhotoUrl: business.imageUrl,
        ...object.premiumProfile
      },
      tourPackages: object.tourPackages.map(pkg => ({
        ...pkg,
        gallery: [business.imageUrl]
      })),
      reviews: business.reviews.map(r => ({
        author: r.author,
        rating: r.rating,
        text: r.text
      }))
    };

    const outPath = `/tmp/${businessSlug}-onboarding.json`;
    fs.writeFileSync(outPath, JSON.stringify(clientData, null, 2));
    
    console.log(`Deploying ${business.name}...`);
    execSync(`npx tsx scripts/import-premium-client.ts ${outPath}`, { stdio: 'inherit' });

  } catch (err) {
    console.error(`Failed to deploy ${businessSlug}`, err);
  }
}

async function main() {
  await deployExample('premium-clients/examples/stays/palacio-del-inka-hotel-jbaxq-brief.md', 'palacio-del-inka-hotel-jbaxq');
  await deployExample('premium-clients/examples/dining/kusykay-peruvian-craft-food-dyvva-brief.md', 'kusykay-peruvian-craft-food-dyvva');
  await deployExample('premium-clients/examples/wellness/cusco-spa-massage-wellness-center-valley-140cc7-brief.md', 'cusco-spa-massage-wellness-center-valley-140cc7');
  console.log("\nDeployment complete!");
}

main().finally(() => prisma.$disconnect());
