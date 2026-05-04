import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test(id: string) {
  try {
    const tourPackage = await prisma.tourPackage.findUnique({
      where: { id }
    })

    if (tourPackage) {
      console.log("Found tour package");
      return;
    }

    const business = await prisma.business.findUnique({
      where: { id }
    })

    if (business) {
      const response = {
        id: business.id,
        title: business.name,
        heroImage: business.imageUrl,
        sector: business.locationSlug || 'VALLE_SAGRADO',
        pace: 'FLEXIBLE',
        tagline: business.category,
        durationStr: 'Flexible',
        difficulty: 'EASY',
        description: business.editorialSummary || 'A local business in the Sacred Valley.',
        tags: business.category
      }
      console.log("Success mapped business:", response);
      return;
    }
    console.log("Not found in db");
  } catch(e) {
    console.error("DB error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test('65ea3319-2b51-4067-b431-8d556217537d')
