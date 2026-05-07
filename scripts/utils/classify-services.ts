/**
 * Classifies existing taxi businesses as services, extracts their zones from name text.
 * Run: npx tsx scripts/classify-services.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KNOWN_ZONES = [
  'pisac', 'urubamba', 'ollantaytambo', 'cusco', 'calca',
  'chinchero', 'machupicchu', 'maras', 'moray', 'aguas calientes',
];

function extractZones(name: string): string[] {
  const lower = name.toLowerCase();
  const zones = new Set<string>();

  for (const zone of KNOWN_ZONES) {
    if (lower.includes(zone)) zones.add(zone);
  }

  // "Valle Sagrado" or "Sacred Valley" → all major valley towns
  if (lower.includes('valle sagrado') || lower.includes('sacred valley') || lower.includes('valle')) {
    ['pisac', 'urubamba', 'ollantaytambo', 'calca', 'chinchero'].forEach(z => zones.add(z));
  }

  // If no zones found, default to urubamba (most central)
  if (zones.size === 0) zones.add('urubamba');

  return Array.from(zones);
}

async function main() {
  const taxiKeywords = ['taxi', 'transfer', 'transporte', 'tours'];

  const allBusinesses = await prisma.business.findMany();

  let updated = 0;

  for (const b of allBusinesses) {
    const nameLower = b.name.toLowerCase();
    const isTaxi = taxiKeywords.some(k => nameLower.includes(k));

    if (isTaxi) {
      const zones = extractZones(b.name);
      await prisma.business.update({
        where: { id: b.id },
        data: {
          category: 'TRANSPORT',
          serviceZones: JSON.stringify(zones),
        },
      });
      console.log(`✓ ${b.name} → zones: [${zones.join(', ')}]`);
      updated++;
    }
  }

  console.log(`\nDone. ${updated} businesses classified as Taxi services.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
