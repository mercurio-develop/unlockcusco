import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";

async function exportData() {
  const backupDir = path.join(process.cwd(), "prisma", "backups", new Date().toISOString().split('T')[0]);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = [
    { name: "Business", model: prisma.business },
    { name: "BusinessService", model: prisma.businessService },
    { name: "Lead", model: prisma.lead },
    { name: "Review", model: prisma.review },
    { name: "TourPackage", model: prisma.tourPackage },
    { name: "Trip", model: prisma.trip },
    { name: "TripDay", model: prisma.tripDay },
    { name: "Traveler", model: prisma.traveler },
  ];

  console.log(`🚀 Starting backup to ${backupDir}...`);

  for (const table of tables) {
    try {
      console.log(`📦 Exporting ${table.name}...`);
      const data = await (table.model as any).findMany();
      const filePath = path.join(backupDir, `${table.name.toLowerCase()}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Exported ${data.length} rows to ${filePath}`);
    } catch (e: any) {
      console.error(`❌ Failed to export ${table.name}:`, e.message);
    }
  }

  console.log("\n✨ Backup complete!");
}

exportData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
