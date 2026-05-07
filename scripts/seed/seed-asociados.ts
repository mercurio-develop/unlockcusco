import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Asociado partners and detailed content...");

  // 1. Tunupa Restaurant (DINING) - Asociado
  const tunupa = await prisma.business.findFirst({ where: { name: "Tunupa Restaurant Valle Sagrado" } });
  if (tunupa) {
    await prisma.business.update({
      where: { id: tunupa.id },
      data: {
        category: "DINING",
        isAsociado: true,
        isClaimed: true,
        tagline: "El mejor buffet frente al río Urubamba",
        description: "Disfruta de una experiencia gastronómica única con los mejores sabores del Valle Sagrado. Nuestro buffet ofrece una amplia variedad de platos típicos e internacionales.",
        services: {
          create: [
            {
              title: "Buffet Almuerzo Tradicional",
              description: "Incluye entradas, fondos criollos, ensaladas y postres regionales.",
              priceUsd: 25,
              durationMins: 90,
            },
            {
              title: "Cena a la Carta",
              description: "Selección de cortes de carne y trucha fresca del valle.",
              priceUsd: 35,
              durationMins: 120,
            },
            {
              title: "Degustación de Pisco Sour",
              description: "Taller interactivo y degustación de 3 variedades de pisco.",
              priceUsd: 15,
              durationMins: 45,
            }
          ]
        }
      }
    });
    console.log("✅ Updated Tunupa as Asociado with Menu items.");
  }

  // 2. Inka Trekking Adventures (AGENCY) - Asociado
  const inkaTrek = await prisma.business.findFirst({ where: { name: "Inka Trekking Adventures" } });
  if (inkaTrek) {
    await prisma.business.update({
      where: { id: inkaTrek.id },
      data: {
        category: "AGENCY",
        isAsociado: true,
        isClaimed: true,
        tagline: "Expertos en rutas ancestrales y aventura segura",
        description: "Somos una agencia local dedicada a mostrar la magia de los Andes a través de rutas menos transitadas y experiencias culturales auténticas.",
        tourPackages: {
          create: [
            {
              title: "Choquequirao Trek: La Hermana de Machu Picchu",
              tagline: "4 días de aventura pura",
              sector: "Aventura",
              description: "Una de las rutas más desafiantes y hermosas del Cusco, visitando la ciudad perdida de los Incas.",
              basePriceUsd: 450,
              difficulty: "DIFFICULT",
              durationDays: 4,
              included: JSON.stringify(["Guía", "Mulas", "Equipo de camping", "Alimentación"]),
              highlights: JSON.stringify(["Cañón del Apurímac", "Ruinas de Choquequirao", "Vuelo de cóndores"]),
            },
            {
              title: "Valle Sagrado VIP: Maras & Moray",
              tagline: "Cultura y paisajes",
              sector: "Cultura",
              description: "Visita las salineras de Maras y el centro de experimentación agrícola de Moray en un tour privado.",
              basePriceUsd: 85,
              difficulty: "EASY",
              durationDays: 1,
              included: JSON.stringify(["Transporte privado", "Guía bilingüe", "Box lunch"]),
            }
          ]
        }
      }
    });
    console.log("✅ Updated Inka Trekking as Asociado with Tour Packages.");
  }

  // 3. Kawsay Spa & Yoga (WELLNESS) - Asociado
  const kawsay = await prisma.business.findFirst({ where: { name: "Kawsay Spa & Yoga" } });
  if (kawsay) {
    await prisma.business.update({
      where: { id: kawsay.id },
      data: {
        category: "WELLNESS",
        isAsociado: true,
        isClaimed: true,
        tagline: "Sanación y equilibrio en el corazón de Písac",
        description: "Un espacio dedicado al bienestar integral, utilizando técnicas ancestrales y medicina natural de la zona.",
        services: {
          create: [
            {
              title: "Masaje de Piedras Calientes Andinas",
              description: "Uso de piedras del río Urubamba para liberar tensión profunda.",
              priceUsd: 50,
              durationMins: 60,
            },
            {
              title: "Ceremonia de Limpieza con Humo (Sahumado)",
              description: "Ritual ancestral para limpiar energías con plantas sagradas.",
              priceUsd: 40,
              durationMins: 45,
            },
            {
              title: "Sesión Privada de Hatha Yoga",
              description: "Frente a las montañas de Písac.",
              priceUsd: 30,
              durationMins: 75,
            }
          ]
        }
      }
    });
    console.log("✅ Updated Kawsay Spa as Asociado with Wellness services.");
  }

  console.log("✨ Seed finished.");
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
