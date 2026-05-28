import { PrismaClient } from '@prisma/client';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import 'dotenv/config';

const prisma = new PrismaClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) return digits;
  if (digits.length === 11 && digits.startsWith('51')) return digits.slice(2);
  if (digits.length === 12 && digits.startsWith('519')) return digits.slice(2);
  return null;
}

async function main() {
  const businesses = await prisma.business.findMany({
    where: {
      category: { notIn: ['boleto', 'BOLETO'] },
      OR: [
        { whatsapp: null },
        { whatsapp: '' }
      ]
    },
    select: {
      id: true,
      name: true,
      locationSlug: true
    }
  });

  console.log(`Found ${businesses.length} businesses without a phone number.`);

  if (businesses.length === 0) {
    console.log('Nothing to process.');
    return;
  }

  let updatedCount = 0;

  for (const [index, b] of businesses.entries()) {
    const loc = b.locationSlug ? b.locationSlug.replace('-', ' ') : 'Cusco';
    console.log(`[${index + 1}/${businesses.length}] Searching for: ${b.name} (${loc})...`);

    try {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: z.object({
          website: z.string().url().nullable().describe('The official website URL of the business if found, otherwise null. Only return the official website, do not return Tripadvisor, Facebook, or OTA links.'),
          whatsapp: z.string().nullable().describe('A public contact phone number for the business if found, otherwise null. Format as a string of digits.')
        }),
        prompt: `Use Google Search to find the official website and a public contact phone number (preferably WhatsApp) for the business "${b.name}" located in ${loc}, Cusco, Peru. If it is a hotel or agency, they likely have an official website. If they don't have an official website, return null for website. Return the phone number if found, otherwise null.`,
      });

      const formattedWhatsapp = extractWhatsApp(object.whatsapp);
      const website = object.website;

      const dataToUpdate: any = {};
      if (formattedWhatsapp) dataToUpdate.whatsapp = formattedWhatsapp;
      if (website) dataToUpdate.website = website;

      if (Object.keys(dataToUpdate).length > 0) {
        console.log(`   ✅ Found: Phone -> ${formattedWhatsapp || 'null'}, Website -> ${website || 'null'}`);
        await prisma.business.update({
          where: { id: b.id },
          data: dataToUpdate
        });
        updatedCount++;
      } else {
        console.log(`   ❌ No valid website or Peruvian mobile phone found.`);
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`   ⚠️ Error for ${b.name}:`, error.message);
    }
  }

  console.log(`\n🎉 Finished! Successfully updated ${updatedCount} businesses with new data.`);
  await prisma.$disconnect();
}

main().catch(console.error);
