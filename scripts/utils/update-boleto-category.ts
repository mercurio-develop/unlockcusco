import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BOLETO_PLACES = [
  { name: "Sacsayhuaman" },
  { name: "Q'enqo" },
  { name: "Puka Pukara" },
  { name: "Tambomachay" },
  { name: "Pisac Ruins" },
  { name: "Ollantaytambo Ruins" },
  { name: "Chinchero Ruins" },
  { name: "Moray" },
  { name: "Tipon" },
  { name: "Pikillaqta" },
  { name: "Monumento a Pachacutec" },
  { name: "Centro Qosqo de Arte Nativo" },
  { name: "Museo Historico Regional" },
  { name: "Museo de Arte Contemporaneo" },
  { name: "Museo de Arte Popular" },
  { name: "Museo de Sitio de Qorikancha" },
  { name: "COSITUC Ticket Office (Av. El Sol)" }
];

async function main() {
  console.log("🎟️ Updating existing Boleto places to new category...");
  
  let updated = 0;

  for (const place of BOLETO_PLACES) {
    const res = await prisma.business.updateMany({
      where: { name: place.name },
      data: { category: "Boleto" }
    });
    if (res.count > 0) {
      updated += res.count;
    }
  }

  console.log(`\n✨ Done. Updated: ${updated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
