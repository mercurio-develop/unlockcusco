import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🚀 Starting categorization cleanup...");

  // 1. Identify businesses that should be AGENCY
  // Matches: Tour, Trek, Expedition, Travel, Agency, Agencia
  const agencyKeywords = ['Tour', 'Tours', 'Trek', 'Expedition', 'Travel', 'Agency', 'Agencia'];
  
  let agencyUpdated = 0;
  for (const keyword of agencyKeywords) {
    const result = await prisma.business.updateMany({
      where: {
        name: { contains: keyword },
        // Only update if not already AGENCY
        NOT: { category: 'AGENCY' }
      },
      data: {
        category: 'AGENCY'
      }
    });
    agencyUpdated += result.count;
  }

  // 2. Identify businesses that should be TRANSPORT
  // Matches: Taxi, Transporte, Transport, Transfers, Shuttle
  // These keywords TAKE PRECEDENCE over Agency keywords
  const transportKeywords = ['Taxi', 'Transporte', 'Transport', 'Transfers', 'Shuttle', 'Colectivo', 'Terminal', 'Omnibus', 'Airport', 'Paradero'];
  
  let transportUpdated = 0;
  for (const keyword of transportKeywords) {
    const result = await prisma.business.updateMany({
      where: {
        name: { contains: keyword },
        NOT: { category: 'TRANSPORT' }
      },
      data: {
        category: 'TRANSPORT'
      }
    });
    transportUpdated += result.count;
  }

  // 3. Identify businesses that should be TEXTILES
  // Matches: Textile, Textil, Tejido, Weaving, Artesanía, Artisan, Tejedoras
  const textileKeywords = ['Textile', 'Textil', 'Tejido', 'Weaving', 'Artesanía', 'Artisan', 'Tejedoras'];
  
  let textileUpdated = 0;
  for (const keyword of textileKeywords) {
    const result = await prisma.business.updateMany({
      where: {
        name: { contains: keyword },
        NOT: { category: 'TEXTILES' }
      },
      data: {
        category: 'TEXTILES'
      }
    });
    textileUpdated += result.count;
  }

  // 4. Normalize "Culture" to "CULTURE" just in case
  const cultureResult = await prisma.business.updateMany({
    where: { category: 'Culture' },
    data: { category: 'CULTURE' }
  });
  if (cultureResult.count > 0) {
    console.log(`✅ Normalized ${cultureResult.count} businesses from "Culture" to "CULTURE"`);
  }

  console.log(`\n✨ Cleanup complete!`);
  console.log(`Total AGENCY updates: ${agencyUpdated}`);
  console.log(`Total TRANSPORT updates: ${transportUpdated}`);
  console.log(`Total TEXTILES updates: ${textileUpdated}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
