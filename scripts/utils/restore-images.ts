import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const slugs = [
    'chicha-gaston-acurio', 
    'limbus-resto-bar', 
    'cicciolina', 
    'map-cafe', 
    'morena-peruvian-kitchen', 
    'pachapapa', 
    'uchu-peruvian-steakhouse'
  ];

  for (const slug of slugs) {
    const business = await prisma.business.findUnique({
      where: { slug }
    });

    if (business && business.heroImages) {
      try {
        const images = JSON.parse(business.heroImages);
        if (Array.isArray(images) && images.length > 0) {
          await prisma.business.update({
            where: { slug },
            data: { imageUrl: images[0] }
          });
          console.log(`✅ Restored image for ${business.name}`);
        } else {
           console.log(`⚠️ No hero images found for ${business.name}`);
        }
      } catch (e) {
        console.error(`❌ Error parsing images for ${business.name}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
