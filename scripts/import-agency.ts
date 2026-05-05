import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("Usage: npx tsx scripts/import-agency.ts <path-to-agency.json>");
    process.exit(1);
  }

  const jsonPath = path.resolve(process.cwd(), args[0]);
  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading agency data from ${jsonPath}...`);
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // 1. Prepare Theme Config
  const themeConfig = {
    primary: data.theme.primary,
    accent: data.theme.accent,
    fontDisplay: data.theme.fontDisplay,
    fontBody: data.theme.fontBody,
  };

  // 2. Prepare Features JSON (Why Choose Us?)
  const featuresJson = JSON.stringify(data.features || []);
  
  // 3. Prepare Social Links
  const socialLinks = JSON.stringify(data.socialLinks || {});

  // 4. Upsert Business
  console.log(`🚀 Upserting business: ${data.name}...`);
  const agency = await prisma.business.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      category: data.category || "agency",
      tagline: data.tagline || "",
      description: data.description || "",
      locationSlug: data.location || "Sacred Valley",
      imageUrl: data.imageUrl || "",
      whatsapp: data.contactPhone,
      contactEmail: data.contactEmail || "",
      themeConfig: JSON.stringify(themeConfig),
    },
    create: {
      slug: data.slug,
      name: data.name,
      category: data.category || "agency",
      tagline: data.tagline || "",
      description: data.description || "",
      locationSlug: data.location || "Sacred Valley",
      imageUrl: data.imageUrl || "",
      whatsapp: data.contactPhone,
      contactEmail: data.contactEmail || "",
      themeConfig: JSON.stringify(themeConfig),
    }
  });

  console.log(`✅ Business ${agency.name} created/updated with ID: ${agency.id}`);

  // 5. Upsert Packages
  if (data.packages && Array.isArray(data.packages)) {
    console.log(`📦 Upserting ${data.packages.length} packages...`);
    
    for (const pkg of data.packages) {
      const packageType = pkg.packageType || (pkg.durationDays > 1 ? "MULTI_DAY" : "SINGLE_DAY");
      
      await prisma.tourPackage.upsert({
        // Assuming package slug/id is provided in JSON, otherwise fallback to title-based pseudo-slug
        where: { id: pkg.id || `${data.slug}-${pkg.title.toLowerCase().replace(/\s+/g, '-')}` },
        update: {
          businessId: agency.id,
          title: pkg.title,
          tagline: pkg.tagline || "",
          sector: pkg.sector || "SACRED_VALLEY",
          pace: pkg.pace || "BALANCED",
          description: pkg.description || "",
          basePriceUsd: pkg.basePriceUsd || 0,
          difficulty: pkg.difficulty || "MODERATE",
          durationDays: pkg.durationDays || 1,
          durationStr: pkg.durationStr || "",
          packageType: packageType,
          included: JSON.stringify(pkg.included || []),
          notIncluded: JSON.stringify(pkg.notIncluded || []),
          requirements: JSON.stringify(pkg.requirements || []),
          highlights: JSON.stringify(pkg.highlights || []),
          itineraryJson: JSON.stringify(pkg.itinerary || []),
          galleryJson: JSON.stringify(pkg.gallery || []),
          heroImage: pkg.heroImage || null,
        },
        create: {
          id: pkg.id || `${data.slug}-${pkg.title.toLowerCase().replace(/\s+/g, '-')}`,
          businessId: agency.id,
          title: pkg.title,
          tagline: pkg.tagline || "",
          sector: pkg.sector || "SACRED_VALLEY",
          pace: pkg.pace || "BALANCED",
          description: pkg.description || "",
          basePriceUsd: pkg.basePriceUsd || 0,
          difficulty: pkg.difficulty || "MODERATE",
          durationDays: pkg.durationDays || 1,
          durationStr: pkg.durationStr || "",
          packageType: packageType,
          included: JSON.stringify(pkg.included || []),
          notIncluded: JSON.stringify(pkg.notIncluded || []),
          requirements: JSON.stringify(pkg.requirements || []),
          highlights: JSON.stringify(pkg.highlights || []),
          itineraryJson: JSON.stringify(pkg.itinerary || []),
          galleryJson: JSON.stringify(pkg.gallery || []),
          heroImage: pkg.heroImage || null,
        }
      });
    }
  }

  console.log(`🎉 Import complete for ${agency.name}!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });