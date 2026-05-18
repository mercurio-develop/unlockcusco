import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BOLETO_PLACES = [
  {
    "name": "Sacsayhuaman",
    "lat": -13.5097,
    "lng": -71.9817,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sacsayhuam%C3%A1n%2C_Cusco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_27.JPG/1280px-Sacsayhuam%C3%A1n%2C_Cusco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_27.JPG"
  },
  {
    "name": "Q'enqo",
    "lat": -13.5095,
    "lng": -71.9686,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/10.24_Cusco_Q%27enqo-18.jpg/1280px-10.24_Cusco_Q%27enqo-18.jpg"
  },
  {
    "name": "Puka Pukara",
    "lat": -13.4833,
    "lng": -71.9619,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Puka_Pukara_Inca_site%2C_Peru.jpg/1280px-Puka_Pukara_Inca_site%2C_Peru.jpg"
  },
  {
    "name": "Tambomachay",
    "lat": -13.4797,
    "lng": -71.9667,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Tambomachay%2C_Cuzco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_89.JPG/1280px-Tambomachay%2C_Cuzco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_89.JPG"
  },
  {
    "name": "Pisac Ruins",
    "lat": -13.4075,
    "lng": -71.8419,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Pisac_-_panoramio_%282%29.jpg/1280px-Pisac_-_panoramio_%282%29.jpg"
  },
  {
    "name": "Ollantaytambo Ruins",
    "lat": -13.2566,
    "lng": -72.2644,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ollantaytambo_-_Heiliges_Tal.jpg/1280px-Ollantaytambo_-_Heiliges_Tal.jpg"
  },
  {
    "name": "Chinchero Ruins",
    "lat": -13.393,
    "lng": -72.0478,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f9/Inca_Ruins_at_Chincero_%287914099430%29.jpg"
  },
  {
    "name": "Moray",
    "lat": -13.3297,
    "lng": -72.1975,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Peru_-_Sacred_Valley_%26_Incan_Ruins_279_-_Moray_%288118174960%29.jpg/1280px-Peru_-_Sacred_Valley_%26_Incan_Ruins_279_-_Moray_%288118174960%29.jpg"
  },
  {
    "name": "Tipon",
    "lat": -13.5694,
    "lng": -71.7828,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/7/72/Tiponperu.jpg"
  },
  {
    "name": "Pikillaqta",
    "lat": -13.6133,
    "lng": -71.7167,
    "type": "Archaeological Site",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Piquillacta_Archaeological_site_-_street.jpg/1280px-Piquillacta_Archaeological_site_-_street.jpg"
  },
  {
    "name": "Monumento a Pachacutec",
    "lat": -13.5322,
    "lng": -71.9569,
    "type": "Monument",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/1280px-Machu_Picchu%2C_2023_%28012%29.jpg"
  },
  {
    "name": "Centro Qosqo de Arte Nativo",
    "lat": -13.5221,
    "lng": -71.9796,
    "type": "Culture",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Centro_Qosqo_3.jpg/1280px-Centro_Qosqo_3.jpg"
  },
  {
    "name": "Museo Historico Regional",
    "lat": -13.5173,
    "lng": -71.9803,
    "type": "Museum",
    "imageUrl": "https://images.unsplash.com/photo-1549429215-6235b2eef014?q=80&w=1000" // Generic colonial museum vibe for now
  },
  {
    "name": "Museo de Arte Contemporaneo",
    "lat": -13.5165,
    "lng": -71.9794,
    "type": "Museum",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f4/Cusco_-_Peru_%2820751186472%29.jpg"
  },
  {
    "name": "Museo de Arte Popular",
    "lat": -13.5178,
    "lng": -71.9782,
    "type": "Museum",
    "imageUrl": "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?q=80&w=1000" // Generic art
  },
  {
    "name": "COSITUC Ticket Office (Av. El Sol)",
    "lat": -13.5218,
    "lng": -71.975,
    "type": "Ticket Office",
    "imageUrl": "https://cuscoperu.b-cdn.net/wp-content/uploads/2026/04/Plaza-de-Armas-1024x576.jpg" // Beautiful Cusco shot
  }
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop";

async function main() {
  console.log("🎟️ Seeding Boleto Turistico places...");
  
  // Remove Qorikancha from Boleto specifically as user requested
  await prisma.business.updateMany({
    where: { name: { contains: 'Qorikancha' }, category: 'Boleto' },
    data: { category: 'Museum' }
  });
  console.log("✅ Moved Qorikancha out of Boleto category");

  let added = 0;
  let updated = 0;

  for (const place of BOLETO_PLACES) {
    const slug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);
    
    const imageUrl = place.imageUrl || FALLBACK_IMAGE;

    // Check if exists
    const exists = await prisma.business.findFirst({
      where: { name: place.name }
    });

    if (exists) {
      await prisma.business.update({
        where: { id: exists.id },
        data: {
          imageUrl: imageUrl,
          heroImages: JSON.stringify([imageUrl]),
          category: "Boleto"
        }
      });
      console.log(`✅ Updated: ${place.name}`);
      updated++;
      continue;
    }

    await prisma.business.create({
      data: {
        name: place.name,
        slug,
        category: "Boleto", // Special Boleto category
        lat: place.lat,
        lng: place.lng,
        rating: 4.8, // Arbitrary high rating for official sites
        reviewsCount: 500,
        imageUrl: imageUrl,
        heroImages: JSON.stringify([imageUrl]),
        whatsapp: null,
        isClaimed: true, // Official government sites
        reviews: {
          create: [
             { author: "UnlockCusco", rating: 5, text: "Official site included in the Boleto Turístico." }
          ]
        }
      }
    });

    console.log(`✅ Added: ${place.name}`);
    added++;
  }

  console.log(`\n✨ Done. Added: ${added} | Updated: ${updated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());