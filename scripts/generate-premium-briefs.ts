import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

const CATEGORIES = ['STAYS', 'DINING', 'WELLNESS', 'CULTURE', 'AGENCY'];

async function generateBrief(business: any, category: string) {
  console.log(`🤖 Generating brief for ${business.name}...`);
  
  const reviewsText = business.reviews.slice(0, 10).map((r: any) => `- ${r.rating} stars: ${r.text}`).join('\n');
  
  const prompt = `
You are an expert travel business consultant for UnlockCusco. 
We need to generate a mock 'PROJECT_BRIEF.md' for a premium client onboarding.

The business is: ${business.name}
Category: ${category}
Tagline/Description: ${business.tagline || business.description || 'N/A'}
Price Tier: ${business.priceTier || '$$'}

Here are some real reviews from their customers:
${reviewsText}

Please generate a realistic Markdown document structured EXACTLY like our onboarding template, but tailored for a ${category} business. Fill in realistic placeholder data that matches their vibe based on the reviews.

# UnlockCusco - One-Page Website Strategy: ${business.name}

## 1. Defining Your Brand Identity
- **Primary Brand Color (Hex)**: (Guess a color based on their vibe)
- **Secondary Accent Color (Hex)**: (Guess an accent)
- **Typography (Google Fonts)**: (Suggest a display font and a body font)

## 2. Business Information
- **Business Name**: ${business.name}
- **Tagline / Short Slogan**: (Write a catchy slogan)
- **Description / Lineage**: (Write a brief summary of their history and what they do)
- **Category**: ${category}

## 3. The Ethos (Why Choose Us?)
- **Vision/Mission Statement**: (Write a short vision paragraph based on the positive sentiments in reviews)
- **3 Key Pillars**: (Provide 3 short bullet points. Each with a Title, Short Description, and Recommended Icon from lucide-react)

## 4. Offerings
(Adapt this section to the category! If it's a restaurant, list "Signature Dishes" or "Menu Highlights". If it's a hotel, list "Room Types" or "Amenities". If it's wellness, list "Therapies" or "Treatments". If it's an agency, list "Tour Packages".)
Provide 3-4 distinct offerings. For each, include:
- **Title**
- **Tagline**
- **Description**
- **Base Price** (Estimate based on their ${business.priceTier || '$$'} tier)
- **Highlights/Inclusions** (Bullet points)

## 5. Customer Reviews
(Select 3-5 of the best quotes from the provided reviews and translate/format them cleanly).

Please output ONLY the Markdown text.
  `;

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
    });

    const categoryDir = path.join(process.cwd(), 'premium-clients', 'examples', category.toLowerCase());
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const filePath = path.join(categoryDir, `${business.slug}-brief.md`);
    fs.writeFileSync(filePath, text);
    console.log(`   ✅ Saved brief to ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Failed to generate brief for ${business.name}:`, error);
  }
}

async function main() {
  console.log("🚀 Starting Premium Brief Generation across Categories...\n");

  for (const category of CATEGORIES) {
    console.log(`\n==================================`);
    console.log(`Fetching top 3 businesses for ${category}...`);
    console.log(`==================================\n`);
    
    // We handle ADVENTURE and AGENCY as the same logical category for briefs
    const catQuery = category === 'AGENCY' ? ['AGENCY', 'ADVENTURE'] : [category, category.toLowerCase()];

    const topBusinesses = await prisma.business.findMany({
      where: { category: { in: catQuery } },
      orderBy: { reviewsCount: 'desc' },
      take: 3,
      include: {
        reviews: {
          take: 10,
          orderBy: { rating: 'desc' }
        }
      }
    });

    if (topBusinesses.length === 0) {
      console.log(`No businesses found for ${category}. Skipping.`);
      continue;
    }

    for (const business of topBusinesses) {
      await generateBrief(business, category);
      // Wait briefly to avoid API rate limits
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log("\n✨ All Premium Briefs Generated!");
}

main().finally(() => prisma.$disconnect());
