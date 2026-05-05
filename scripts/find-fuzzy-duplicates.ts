import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allBusinesses = await prisma.business.findMany();
  
  const normalize = (name: string) => name.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(restaurant|restaurante|valle|sagrado|hotel|hostal|lodge|tour|tours|travel|agency|peru|sacred|valley|in|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const groups = new Map<string, any[]>();
  for (const b of allBusinesses) {
    const norm = normalize(b.name);
    // Ignore empty norms
    if (!norm) continue;
    if (!groups.has(norm)) groups.set(norm, []);
    groups.get(norm)!.push(b);
  }

  for (const [norm, group] of groups.entries()) {
    if (group.length > 1) {
      console.log(`\nPotential Match Group (norm: "${norm}"):`);
      group.forEach(g => console.log(` - [${g.isClaimed ? 'CLAIMED' : 'UNCLAIMED'}] ${g.name} (${g.id})`));
    }
  }
}
main().finally(() => prisma.$disconnect());
