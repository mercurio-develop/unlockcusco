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
  console.log("🐆 Seeding Jaguar Llaqta Business...");

  const agency = await prisma.business.upsert({
    where: { slug: "jaguar-llaqta" },
    update: {
      tagline: "INNER TRAVEL",
      description: "Founded by Álvaro Mauricio Ugarte Forno, Jaguar Llaqta specialises in off-the-beaten-path trekking, Andean spiritual experiences, and deep community encounters. Every route is chosen for its raw authenticity — the kind that disappears when the masses arrive.",
      guideName: "Álvaro Mauricio Ugarte Forno",
      whatsapp: "51984004507",
      contactEmail: "reservas@jaguarllaqta.com",
      imageUrl: "/agencies/jaguarllaqta/hero.jpg",
      themeConfig: JSON.stringify(JAGUAR_THEME),
      specialties: JSON.stringify(["Off-path trekking", "Spiritual ceremonies", "Community tourism", "Amazon expeditions"]),
    },
    create: {
      slug: "jaguar-llaqta",
      name: "Jaguar Llaqta",
      tagline: "INNER TRAVEL",
      description: "Founded by Álvaro Mauricio Ugarte Forno, Jaguar Llaqta specialises in off-the-beaten-path trekking, Andean spiritual experiences, and deep community encounters. Every route is chosen for its raw authenticity — the kind that disappears when the masses arrive.",
      guideName: "Álvaro Mauricio Ugarte Forno",
      locationSlug: "urubamba",
      whatsapp: "51984004507",
      contactEmail: "reservas@jaguarllaqta.com",
      imageUrl: "/images/jaguar-llaqta-cover.jpg",
      themeConfig: JSON.stringify(JAGUAR_THEME),
      specialties: JSON.stringify(["Off-path trekking", "Spiritual ceremonies", "Community tourism", "Amazon expeditions"]),
    }
  });

  console.log(`✅ Business ${agency.name} created/updated.`);

  console.log(`📦 Seeding ${packages.length} packages...`);

  for (const pkg of packages) {
    const isMultiDay = pkg.duration.toLowerCase().includes("días") || pkg.duration.toLowerCase().includes("days");
    const durationDays = isMultiDay ? parseInt(pkg.duration) || 2 : 1;

    await prisma.tourPackage.upsert({
      where: { id: pkg.id },
      update: {
        businessId: agency.id,
        title: pkg.nameEn,
        tagline: pkg.taglineEn,
        sector: pkg.categories.includes("rutas") ? "URUBAMBA" : "VALLE_SAGRADO",
        description: pkg.descriptionEn,
        basePriceUsd: pkg.price,
        difficulty: pkg.difficultyEn || "MODERATE",
        elevation: pkg.elevation || "",
        durationDays: durationDays,
        durationStr: pkg.durationEn || pkg.duration,
        bestSeason: pkg.bestSeasonEn || "",
        included: JSON.stringify(pkg.includesEn),
        notIncluded: JSON.stringify(pkg.notIncludesEn),
        highlights: JSON.stringify(pkg.highlightsEn),
        requirements: JSON.stringify(pkg.requirementsEn),
        itineraryJson: JSON.stringify(pkg.itinerary.map(day => ({
          ...day,
          title: day.titleEn,
          description: day.descriptionEn,
          highlights: day.highlightsEn,
          meals: day.mealsEn,
          accommodation: day.accommodationEn
        }))),
        galleryJson: "[]",
        heroImage: pkg.heroImage || null,
      },
      create: {
        id: pkg.id,
        businessId: agency.id,
        title: pkg.nameEn,
        tagline: pkg.taglineEn,
        sector: pkg.categories.includes("rutas") ? "URUBAMBA" : "VALLE_SAGRADO",
        description: pkg.descriptionEn,
        basePriceUsd: pkg.price,
        difficulty: pkg.difficultyEn || "MODERATE",
        elevation: pkg.elevation || "",
        durationDays: durationDays,
        durationStr: pkg.durationEn || pkg.duration,
        bestSeason: pkg.bestSeasonEn || "",
        included: JSON.stringify(pkg.includesEn),
        notIncluded: JSON.stringify(pkg.notIncludesEn),
        highlights: JSON.stringify(pkg.highlightsEn),
        requirements: JSON.stringify(pkg.requirementsEn),
        itineraryJson: JSON.stringify(pkg.itinerary.map(day => ({
          ...day,
          title: day.titleEn,
          description: day.descriptionEn,
          highlights: day.highlightsEn,
          meals: day.mealsEn,
          accommodation: day.accommodationEn
        }))),
        galleryJson: "[]",
        heroImage: pkg.heroImage || null,
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
