import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const BOLETO_DIR = path.join(process.cwd(), 'public/images/boleto');
const boletoImages = fs.readdirSync(BOLETO_DIR).filter(f => f.endsWith('.jpg'));

async function main() {
  const packages = await prisma.tourPackage.findMany({ where: { agency: { slug: 'jaguar-llaqta' } }});
  
  let copied = 0;
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const gallery = JSON.parse(pkg.galleryJson || '[]');
    
    // Also add the hero image
    const heroImage = `/images/${pkg.id}/${pkg.id}-hero.jpg`;
    gallery.push({ url: heroImage });

    for (let j = 0; j < gallery.length; j++) {
      const item = gallery[j];
      if (item.url) {
        const destPath = path.join(process.cwd(), 'public', item.url);
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        if (!fs.existsSync(destPath)) {
          const srcImage = boletoImages[(i + j) % boletoImages.length];
          const srcPath = path.join(BOLETO_DIR, srcImage);
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied ${srcImage} to ${item.url}`);
          copied++;
        }
      }
    }
  }
  
  // also the agency cover
  const coverDestPath = path.join(process.cwd(), 'public/images/jaguar-llaqta-cover.jpg');
  if (!fs.existsSync(coverDestPath)) {
    fs.copyFileSync(path.join(BOLETO_DIR, boletoImages[0]), coverDestPath);
    console.log(`Copied cover to /images/jaguar-llaqta-cover.jpg`);
    copied++;
  }

  console.log(`Copied ${copied} missing images.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
