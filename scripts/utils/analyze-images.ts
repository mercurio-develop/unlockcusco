import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER_URL = 'photo-1587595431973-160d0d94add1';

async function main() {
  console.log('📊 Analyzing business images...');

  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
    }
  });

  const stats = {
    total: businesses.length,
    realPhotos: 0,
    streetview: 0,
    placeholders: 0,
    internalBoleto: 0,
    missing: 0,
    other: 0
  };

  const lowQualityList: { name: string; url: string; reason: string }[] = [];

  for (const b of businesses) {
    const url = b.imageUrl || '';

    if (!url || url.trim() === '') {
      stats.missing++;
      continue;
    }

    if (url.includes('streetviewpixels')) {
      stats.streetview++;
      lowQualityList.push({ name: b.name, url, reason: 'Streetview Thumbnail' });
    } else if (url.includes(PLACEHOLDER_URL)) {
      stats.placeholders++;
      lowQualityList.push({ name: b.name, url, reason: 'Unsplash Placeholder' });
    } else if (url.includes('/images/dummy/') || url.includes('default-hero.jpg')) {
      stats.placeholders++;
      lowQualityList.push({ name: b.name, url, reason: 'Dummy/Internal Placeholder' });
    } else if (url.startsWith('/images/boleto/')) {
      stats.internalBoleto++;
    } else if (url.includes('googleusercontent.com') || url.includes('wikimedia.org') || url.includes('squarespace-cdn.com')) {
      stats.realPhotos++;
    } else {
      stats.other++;
    }
  }

  console.log('\n--- IMAGE SUMMARY ---');
  console.log(`Total Businesses:   ${stats.total}`);
  console.log(`Real Photos:        ${stats.realPhotos} (Google/Wiki/Verified)`);
  console.log(`Internal (Boleto):  ${stats.internalBoleto} (Official site photos)`);
  console.log(`Streetview:         ${stats.streetview} (NOT REAL / Low Quality)`);
  console.log(`Placeholders:       ${stats.placeholders} (NOT REAL / Generic)`);
  console.log(`Missing:            ${stats.missing}`);
  console.log(`Other:              ${stats.other}`);
  console.log('---------------------\n');

  if (lowQualityList.length > 0) {
    console.log(`⚠️  Found ${lowQualityList.length} "Not Real" images:`);
    lowQualityList.slice(0, 10).forEach(item => {
      console.log(`- ${item.name} (${item.reason})`);
    });
    if (lowQualityList.length > 10) {
      console.log(`... and ${lowQualityList.length - 10} more.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
