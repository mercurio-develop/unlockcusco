import { prisma } from "../src/lib/prisma";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

async function translateContent(texts: Record<string, string | null>) {
  const toTranslate = Object.entries(texts).filter(([_, v]) => v && v.trim().length > 0);
  if (toTranslate.length === 0) return {};

  const inputObj = Object.fromEntries(toTranslate);

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: z.record(z.string(), z.string()),
      prompt: `Translate the following JSON object values from English to Spanish. Maintain any markdown formatting, emojis, tone, or specific names. If a value is a JSON stringified array (e.g., '["item 1"]'), translate the items but return the result as a valid JSON stringified array. Only translate the values, keep the keys identical.\n\n${JSON.stringify(inputObj, null, 2)}`
    });
    return object;
  } catch (err) {
    console.error("Translation error:", err);
    return {};
  }
}

async function run() {
  console.log("Starting translation...");

  // 1. Businesses
  const businesses = await prisma.business.findMany({
    where: { descriptionEs: null }
  });
  console.log(`Found ${businesses.length} businesses to translate.`);
  for (const b of businesses) {
    console.log(`Translating Business: ${b.name}`);
    const translated = await translateContent({
      nameEs: b.name,
      categoryEs: b.category,
      taglineEs: b.tagline,
      descriptionEs: b.description,
      seoMetaTitleEs: b.seoMetaTitle,
      seoMetaDescEs: b.seoMetaDesc,
      specialtiesEs: b.specialties !== "[]" ? b.specialties : null,
    });
    if (Object.keys(translated).length > 0) {
      await prisma.business.update({
        where: { id: b.id },
        data: translated
      });
      console.log(`  -> Translated Business: ${b.name}`);
    }
  }

  // 2. BusinessServices
  const services = await prisma.businessService.findMany({
    where: { descriptionEs: null }
  });
  console.log(`Found ${services.length} services to translate.`);
  for (const s of services) {
    const translated = await translateContent({
      titleEs: s.title,
      descriptionEs: s.description,
    });
    if (Object.keys(translated).length > 0) {
      await prisma.businessService.update({
        where: { id: s.id },
        data: translated
      });
      console.log(`  -> Translated Service: ${s.title}`);
    }
  }

  // 3. TourPackages
  const tours = await prisma.tourPackage.findMany({
    where: { descriptionEs: null }
  });
  console.log(`Found ${tours.length} tour packages to translate.`);
  for (const t of tours) {
    const translated = await translateContent({
      titleEs: t.title,
      taglineEs: t.tagline,
      descriptionEs: t.description,
      includedEs: t.included !== "[]" ? t.included : null,
      highlightsEs: t.highlights !== "[]" ? t.highlights : null,
      itineraryEs: t.itinerary !== "[]" ? t.itinerary : null,
    });
    if (Object.keys(translated).length > 0) {
      await prisma.tourPackage.update({
        where: { id: t.id },
        data: translated
      });
      console.log(`  -> Translated Tour: ${t.title}`);
    }
  }

  // 4. BusinessPillars
  const pillars = await prisma.businessPillar.findMany({
    where: { descriptionEs: null }
  });
  console.log(`Found ${pillars.length} business pillars to translate.`);
  for (const p of pillars) {
    const translated = await translateContent({
      titleEs: p.title,
      descriptionEs: p.description,
    });
    if (Object.keys(translated).length > 0) {
      await prisma.businessPillar.update({
        where: { id: p.id },
        data: translated
      });
      console.log(`  -> Translated Pillar: ${p.title}`);
    }
  }

  console.log("Translation complete.");
}

run().catch(console.error);
