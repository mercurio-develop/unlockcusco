import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

const prisma = new PrismaClient();
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

async function main() {
  console.log("🚀 Starting SEO Enrichment Process...");

  const targets = await prisma.business.findMany({
    where: {
      OR: [
        { seoMetaTitle: null },
        { seoMetaDesc: null },
        { seoMetaTitleEs: null },
        { seoMetaDescEs: null }
      ]
    }
  });

  console.log(`📊 Found ${targets.length} businesses requiring SEO metadata.`);

  let updateCount = 0;

  for (const b of targets) {
    console.log(`\n📝 SEO for "${b.name}"`);

    try {
      const prompt = `
        Generate SEO metadata for a business named "${b.name}" in category "${b.category}".
        Return ONLY valid JSON with keys:
        - "seoMetaTitle" (max 60 chars)
        - "seoMetaDesc" (max 155 chars)
        - "seoMetaTitleEs" (Spanish title, max 60 chars)
        - "seoMetaDescEs" (Spanish description, max 155 chars)
        Do not use markdown blocks. Return pure JSON.
      `;

      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: prompt,
      });

      const cleanedText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const seoData = JSON.parse(cleanedText);

      await prisma.business.update({
        where: { id: b.id },
        data: {
          seoMetaTitle: seoData.seoMetaTitle,
          seoMetaDesc: seoData.seoMetaDesc,
          seoMetaTitleEs: seoData.seoMetaTitleEs,
          seoMetaDescEs: seoData.seoMetaDescEs,
        }
      });
      
      console.log(`   ✅ Generated SEO metadata`);
      updateCount++;

      await new Promise(r => setTimeout(r, 200));
    } catch (err: any) {
      console.error(`   ❌ Error parsing or generating SEO: ${err.message}`);
    }
  }

  console.log(`\n✅ SEO Enrichment complete! Updated ${updateCount} businesses.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
