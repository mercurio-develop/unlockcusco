import { PrismaClient } from '@prisma/client';
// @ts-ignore
import { packages } from './jaguar-packages-source';

const prisma = new PrismaClient();

const JAGUAR_THEME = {
  primary: "#0E0E0E",
  primaryAlt: "#121212",
  accent: "#C9A24D",
  accentAlt: "#D4AF37",
  accentHover: "#B8923D",
  support: "#2A2A2A",
  muted: "#9CA3AF",
  fontDisplay: "Playfair Display",
  fontBody: "Inter"
};

async function main() {
  console.log("🐆 Seeding Jaguar Llaqta Agency...");

  const agency = await prisma.agency.upsert({
    where: { slug: "jaguar-llaqta" },
    update: {
      tagline: "Sacred Valley's Premier Off-Path Expedition Guide",
      description: "Founded by Álvaro Mauricio Ugarte Forno, Jaguar Llaqta specialises in off-the-beaten-path trekking, Andean spiritual experiences, and deep community encounters. Every route is chosen for its raw authenticity — the kind that disappears when the masses arrive.",
      guideName: "Álvaro Mauricio Ugarte Forno",
      contactPhone: "51984004507",
      contactEmail: "reservas@jaguarllaqta.com",
      imageUrl: "/images/jaguar-llaqta-cover.jpg",
      themeConfig: JSON.stringify(JAGUAR_THEME),
      specialties: JSON.stringify(["Off-path trekking", "Spiritual ceremonies", "Community tourism", "Amazon expeditions"]),
    },
    create: {
      slug: "jaguar-llaqta",
      name: "Jaguar Llaqta",
      tagline: "Sacred Valley's Premier Off-Path Expedition Guide",
      description: "Founded by Álvaro Mauricio Ugarte Forno, Jaguar Llaqta specialises in off-the-beaten-path trekking, Andean spiritual experiences, and deep community encounters. Every route is chosen for its raw authenticity — the kind that disappears when the masses arrive.",
      guideName: "Álvaro Mauricio Ugarte Forno",
      location: "Sacred Valley, Cusco Region",
      contactPhone: "51984004507",
      contactEmail: "reservas@jaguarllaqta.com",
      imageUrl: "/images/jaguar-llaqta-cover.jpg",
      themeConfig: JSON.stringify(JAGUAR_THEME),
      specialties: JSON.stringify(["Off-path trekking", "Spiritual ceremonies", "Community tourism", "Amazon expeditions"]),
    }
  });

  console.log(`✅ Agency ${agency.name} created/updated.`);

  console.log(`📦 Seeding ${packages.length} packages...`);

  for (const pkg of packages) {
    const isMultiDay = pkg.duration.toLowerCase().includes("días") || pkg.duration.toLowerCase().includes("days");
    const durationDays = isMultiDay ? parseInt(pkg.duration) || 2 : 1;

    await prisma.tourPackage.upsert({
      where: { id: pkg.id },
      update: {
        agencyId: agency.id,
        title: pkg.name,
        tagline: pkg.tagline,
        sector: pkg.categories.includes("rutas") ? "URUBAMBA" : "VALLE_SAGRADO",
        description: pkg.description,
        basePriceUsd: pkg.price,
        difficulty: pkg.difficulty || "MODERATE",
        elevation: pkg.elevation || "",
        durationDays: durationDays,
        durationStr: pkg.duration,
        bestSeason: pkg.bestSeason || "",
        included: JSON.stringify(pkg.includes),
        notIncluded: JSON.stringify(pkg.notIncludes),
        highlights: JSON.stringify(pkg.highlights),
        requirements: JSON.stringify(pkg.requirements),
        itineraryJson: JSON.stringify(pkg.itinerary),
        galleryJson: JSON.stringify(pkg.gallery),
      },
      create: {
        id: pkg.id,
        agencyId: agency.id,
        title: pkg.name,
        tagline: pkg.tagline,
        sector: pkg.categories.includes("rutas") ? "URUBAMBA" : "VALLE_SAGRADO",
        description: pkg.description,
        basePriceUsd: pkg.price,
        difficulty: pkg.difficulty || "MODERATE",
        elevation: pkg.elevation || "",
        durationDays: durationDays,
        durationStr: pkg.duration,
        bestSeason: pkg.bestSeason || "",
        included: JSON.stringify(pkg.includes),
        notIncluded: JSON.stringify(pkg.notIncludes),
        highlights: JSON.stringify(pkg.highlights),
        requirements: JSON.stringify(pkg.requirements),
        itineraryJson: JSON.stringify(pkg.itinerary),
        galleryJson: JSON.stringify(pkg.gallery),
      }
    });
  }

  console.log("🏁 Jaguar Llaqta seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
