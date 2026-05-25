import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.business.findMany({
    select: { name: true, category: true, imageUrl: true, id: true }
  });
  
  const nameMap = new Map<string, any[]>();

  all.forEach(t => {
    const n = t.name.toLowerCase().replace(' ruins', '').replace(' fortress', '').replace(' citadel', '').trim();
    if (!nameMap.has(n)) nameMap.set(n, []);
    nameMap.get(n)!.push(t);
  });

  const targets = [
    'pisac', 'qorikancha', 'sacsayhuaman', 'q\'enqo', 'puka pukara', 'tambomachay',
    'chinchero', 'salineras de maras', 'machu picchu', 'plaza de armas', 'moray',
    'san pedro market', 'ollantaytambo'
  ];

  targets.forEach(t => {
    console.log(`\n--- ${t.toUpperCase()} ---`);
    const group = nameMap.get(t) || [];
    if (group.length === 0) {
       // try partial
       for (const [k, v] of nameMap.entries()) {
          if (k.includes(t)) {
            v.forEach(item => console.log(`  - ${item.name} (${item.category}): ${item.imageUrl}`));
          }
       }
    } else {
      group.forEach(item => console.log(`  - ${item.name} (${item.category}): ${item.imageUrl}`));
    }
  });

}

main().finally(() => prisma.$disconnect());
