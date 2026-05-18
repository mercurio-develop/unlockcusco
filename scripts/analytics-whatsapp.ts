/**
 * UNLOCKCUSCO WHATSAPP ANALYTICS
 * Run: node_modules/.bin/tsx scripts/analytics-whatsapp.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [total, withWA, claimed, claimedWithWA, notClaimedWithWA, noWA] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { whatsapp: { not: null } } }),
    prisma.business.count({ where: { isClaimed: true } }),
    prisma.business.count({ where: { isClaimed: true, whatsapp: { not: null } } }),
    prisma.business.count({ where: { isClaimed: false, whatsapp: { not: null } } }),
    prisma.business.count({ where: { OR: [{ whatsapp: null }, { whatsapp: '' }] } }),
  ]);

  console.log('\n📊 WHATSAPP CAMPAIGN ANALYTICS');
  console.log('='.repeat(50));
  console.log(`Total businesses:              ${total}`);
  console.log(`With WhatsApp number:          ${withWA}  (${pct(withWA, total)})`);
  console.log(`No WhatsApp number:            ${noWA}  (${pct(noWA, total)})`);
  console.log('');
  console.log(`Already verified (isClaimed):  ${claimed}`);
  console.log(`  → have WA (contactable now): ${claimedWithWA}`);
  console.log('');
  console.log(`🎯 CAMPAIGN TARGETS`);
  console.log(`   Not claimed + have WA:      ${notClaimedWithWA}  ← will receive message`);

  // By location
  const byLoc = await prisma.business.groupBy({
    by: ['locationSlug'],
    where: { isClaimed: false, whatsapp: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
  console.log('\n📍 Target breakdown by location:');
  byLoc.forEach(l => console.log(`   ${String(l._count.id).padStart(3)}  ${l.locationSlug || '(no location)'}`));

  // By category
  const byCat = await prisma.business.groupBy({
    by: ['category'],
    where: { isClaimed: false, whatsapp: { not: null } },
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
    take: 10
  });
  console.log('\n🏷️  Target breakdown by category:');
  byCat.forEach(c => console.log(`   ${String(c._count.category).padStart(3)}  ${c.category}`));

  // Sample WA numbers — format check
  const samples = await prisma.business.findMany({
    where: { isClaimed: false, whatsapp: { not: null } },
    select: { name: true, whatsapp: true, locationSlug: true },
    take: 10
  });
  console.log('\n🔍 Sample WA numbers (format check):');
  samples.forEach(b => console.log(`   ${b.locationSlug} | ${b.whatsapp} | ${b.name}`));

  console.log('\n✅ Analytics complete. Ready to run campaign.\n');
}

function pct(n: number, total: number) {
  return `${Math.round((n / total) * 100)}%`;
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
