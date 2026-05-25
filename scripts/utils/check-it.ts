import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
p.savedItinerary.findUnique({ where: { shortId: 'top-7-culinary-route' } }).then(res => {
  console.log(res ? 'EXISTS: ' + res.shortId : 'NOT FOUND');
  p.$disconnect();
})
