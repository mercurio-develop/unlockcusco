import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BOLETO_PLACES = [
  { "name": "Tambomachay", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Tambomachay%2C_Cuzco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_89.JPG/1280px-Tambomachay%2C_Cuzco%2C_Per%C3%BA%2C_2015-07-31%2C_DD_89.JPG" },
  { "name": "Ollantaytambo Ruins", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ollantaytambo_-_Heiliges_Tal.jpg/1280px-Ollantaytambo_-_Heiliges_Tal.jpg" },
  { "name": "Moray", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Peru_-_Sacred_Valley_%26_Incan_Ruins_279_-_Moray_%288118174960%29.jpg/1280px-Peru_-_Sacred_Valley_%26_Incan_Ruins_279_-_Moray_%288118174960%29.jpg" },
  { "name": "Pikillaqta", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Piquillacta_Archaeological_site_-_street.jpg/1280px-Piquillacta_Archaeological_site_-_street.jpg" },
  { "name": "Monumento a Pachacutec", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/1280px-Machu_Picchu%2C_2023_%28012%29.jpg" },
  { "name": "Centro Qosqo de Arte Nativo", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Centro_Qosqo_3.jpg/1280px-Centro_Qosqo_3.jpg" },
  { "name": "Museo Historico Regional", "imageUrl": "https://images.unsplash.com/photo-1549429215-6235b2eef014?q=80&w=1000" },
  { "name": "Sacsayhuaman", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sacsayhuam%C3%A1n_-_Cuzco%2C_Per%C3%BA.jpg/1280px-Sacsayhuam%C3%A1n_-_Cuzco%2C_Per%C3%BA.jpg" },
  { "name": "Q'enqo", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Qenqo%2C_Cuzco.jpg/1280px-Qenqo%2C_Cuzco.jpg" },
  { "name": "Puka Pukara", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Puka_Pukara_02.jpg/1280px-Puka_Pukara_02.jpg" },
  { "name": "Chinchero Ruins", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chinchero_church_and_ruins.jpg/1280px-Chinchero_church_and_ruins.jpg" },
  { "name": "Tipon", "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tip%C3%B3n_01.jpg/1280px-Tip%C3%B3n_01.jpg" },
  { "name": "Museo de Arte Contemporaneo", "imageUrl": "https://images.unsplash.com/photo-1549429215-6235b2eef014?q=80&w=1000" },
  { "name": "Museo de Arte Popular", "imageUrl": "https://images.unsplash.com/photo-1549429215-6235b2eef014?q=80&w=1000" },
  { "name": "COSITUC Ticket Office (Av. el Sol)", "imageUrl": "https://images.unsplash.com/photo-1549429215-6235b2eef014?q=80&w=1000" },
  { "name": "Museo de Sitio de Qorikancha", "imageUrl": "https://images.unsplash.com/photo-1549429215-6235b2eef014?q=80&w=1000" }
];

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const dir = path.join(process.cwd(), 'public', 'images', 'boleto');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const place of BOLETO_PLACES) {
    const slug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = slug + '.jpg';
    const targetPath = path.join(dir, filename);
    const localUrl = '/images/boleto/' + filename;

    try {
      console.log('Downloading ' + place.name + '...');
      await wait(1500); // polite delay for wikimedia 429
      
      const res = await fetch(place.imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }});
      if (!res.ok) throw new Error('Bad status ' + res.status);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(buffer));
      
      console.log('Saved to ' + localUrl);

      await prisma.business.updateMany({
        where: { name: place.name },
        data: { imageUrl: localUrl, heroImages: JSON.stringify([localUrl]) }
      });
      console.log('DB updated for ' + place.name);
    } catch (e) {
      console.error('Failed ' + place.name + ': ', (e as Error).message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
