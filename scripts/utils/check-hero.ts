import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
p.business.findMany({
  where: { slug: { in: ['chicha-gaston-acurio', 'limbus-resto-bar', 'cicciolina', 'map-cafe', 'morena-peruvian-kitchen', 'pachapapa', 'uchu-peruvian-steakhouse'] } },
  select: { name: true, heroImages: true, imageUrl: true }
}).then(res => {
  console.log(JSON.stringify(res, null, 2));
  p.$disconnect();
})
