/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const BOLETO_PLACES = [
  "Tambomachay",
  "Ollantaytambo Ruins",
  "Moray",
  "Pikillaqta",
  "Monumento a Pachacutec",
  "Centro Qosqo de Arte Nativo",
  "Museo Historico Regional",
  "Sacsayhuaman",
  "Q'enqo",
  "Puka Pukara",
  "Chinchero Ruins",
  "Tipon",
  "Museo de Arte Contemporaneo",
  "Museo de Arte Popular",
  "COSITUC Ticket Office",
  "Museo de Sitio de Qorikancha"
];

const SEARCH_MAPPING = {
  "Ollantaytambo Ruins": "Ollantaytambo",
  "Moray": "Moray Peru",
  "Pikillaqta": "Pikillaqta",
  "Centro Qosqo de Arte Nativo": "Cusco native dance",
  "Museo Historico Regional": "Casa Garcilaso Cusco",
  "Q'enqo": "Qenko",
  "Chinchero Ruins": "Chinchero Cusco",
  "Tipon": "Tipon Peru",
  "Museo de Arte Contemporaneo": "Plaza Regocijo",
  "Museo de Arte Popular": "Cusco crafts",
  "COSITUC Ticket Office": "Avenida El Sol Cusco",
  "Museo de Sitio de Qorikancha": "Coricancha"
};

async function fetchCommonsImage(query) {
  const search = SEARCH_MAPPING[query] || query;
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(search)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
  
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'InkaPortalApp/1.0 (contact@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.query && json.query.pages) {
            const pageId = Object.keys(json.query.pages)[0];
            const imageInfo = json.query.pages[pageId].imageinfo;
            if (imageInfo && imageInfo.length > 0) {
              resolve(imageInfo[0].thumburl || imageInfo[0].url);
              return;
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const dir = path.join(process.cwd(), 'public', 'images', 'boleto');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let updated = 0;
  for (const place of BOLETO_PLACES) {
    const slug = place.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = slug + '.jpg';
    const targetPath = path.join(dir, filename);
    const localUrl = '/images/boleto/' + filename;
    
    // We already have dummy generic.jpg in these, let's fetch the REAL ones.
    console.log(`Fetching image URL for ${place}...`);
    const imgUrl = await fetchCommonsImage(place);
    
    if (imgUrl) {
      console.log(`Found: ${imgUrl}`);
      try {
        await wait(3000); // Polite delay
        
        let res = await fetch(imgUrl, { headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9'
        }});

        if (res.status === 429) {
           console.log("Got 429, waiting 5 seconds and retrying...");
           await wait(5000);
           res = await fetch(imgUrl, { headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
           }});
        }

        if (!res.ok) throw new Error('Bad status ' + res.status);
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        
        console.log(`Saved to ${localUrl}`);

        await prisma.business.updateMany({
          where: { name: { startsWith: place.replace(' Ruins', '') } }, // Match broadly
          data: { imageUrl: localUrl, heroImages: JSON.stringify([localUrl]) }
        });
        updated++;
      } catch (e) {
        console.error(`Failed downloading ${place}: ${e.message}`);
      }
    } else {
      console.log(`No image found for ${place}`);
    }
    
    await wait(1000);
  }
  
  console.log(`Completed. Updated ${updated} images.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
