import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FAKE_TRANSPORTS = [
  {
    name: "Juan Perez - Sacred Valley Taxi",
    category: "Taxi",
    vehicleType: "Sedan",
    capacity: 4,
    basePriceUsd: 25,
    whatsapp: "+51999888777",
    imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGeE7Jz0AdcRqbI4So95DuYN3YHNlCZDphZcVFkKuz_Q7c6YzhILLAg2oJdz53-m_URe-H-PYHiRH6sBd7QkZxZE10tasMbgwJsx0XiBTrTEfMynqQZ-yExDpOi-xHQjBC9V1g=w1920-h1080-k-no",
    serviceZones: JSON.stringify(["pisac", "urubamba", "calca"]),
    reviewsCount: 142
  },
  {
    name: "Mateo - 4x4 Explorer Taxi",
    category: "Taxi",
    vehicleType: "SUV",
    capacity: 4,
    basePriceUsd: 35,
    whatsapp: "+51988777666",
    imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGS6AucUNBISJJrFd5uMAlg_e06ENDg2rdTNKSkbLDsNQUm6GFy0kuTZ0Mqurc5krfeV5zP1RaafcFJZxNsKCCuCRChmBXaecZ-5JPAs1gcR4Y5aduGEsGeevSQ3QQajK7O3EJO=w1920-h1080-k-no",
    serviceZones: JSON.stringify(["ollantaytambo", "urubamba", "maras", "moray"]),
    reviewsCount: 89
  },
  {
    name: "Cusco to Valley Transfer (Luis)",
    category: "Taxi",
    vehicleType: "Van",
    capacity: 8,
    basePriceUsd: 50,
    whatsapp: "+51977666555",
    imageUrl: "https://lh3.googleusercontent.com/p/AF1QipMH23fcLbu70HwxmsIDyuV6jDF0z-9o4XS8pDFU=w1920-h1080-k-no",
    serviceZones: JSON.stringify(["cusco", "airport", "pisac", "urubamba", "ollantaytambo"]),
    reviewsCount: 320
  }
];

async function main() {
  console.log("🌿 Seeding Fake Services (Transports)...");
  
  let added = 0;
  let skipped = 0;

  for (const transport of FAKE_TRANSPORTS) {
    const slug = transport.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);
    
    // Check if exists
    const exists = await prisma.transport.findFirst({
      where: { name: transport.name }
    });

    if (exists) {
      console.log(`⏭️ Skipped: ${transport.name} (already exists)`);
      skipped++;
      continue;
    }

    await prisma.transport.create({
      data: {
        slug,
        name: transport.name,
        category: transport.category,
        vehicleType: transport.vehicleType,
        capacity: transport.capacity,
        basePriceUsd: transport.basePriceUsd,
        whatsapp: transport.whatsapp,
        imageUrl: transport.imageUrl,
        serviceZones: transport.serviceZones,
        reviewsCount: transport.reviewsCount
      }
    });

    console.log(`✅ Added: ${transport.name}`);
    added++;
  }

  console.log(`\n✨ Done. Added: ${added} | Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
