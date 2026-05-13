import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function compare() {
  const localPrisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
  
  const remotePrisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_PRISMA_URL } },
  });

  console.log("Comparing Local DB vs Supabase DB...");

  const tables = [
    { name: 'Business', model: 'business' },
    { name: 'Review', model: 'review' },
    { name: 'BusinessService', model: 'businessService' },
    { name: 'Lead', model: 'lead' },
    { name: 'Driver', model: 'driver' },
    { name: 'RideBooking', model: 'rideBooking' },
    { name: 'RideMessage', model: 'rideMessage' },
  ];

  console.log("\n| Table | Local Count | Supabase Count | Match |");
  console.log("| :--- | :---: | :---: | :---: |");

  for (const table of tables) {
    const localCount = await (localPrisma as any)[table.model].count();
    const remoteCount = await (remotePrisma as any)[table.model].count();
    const match = localCount === remoteCount ? "✅" : "❌";
    console.log(`| ${table.name} | ${localCount} | ${remoteCount} | ${match} |`);
  }

  // Check some specific data consistency
  const localLastBusiness = await localPrisma.business.findFirst({ orderBy: { id: 'desc' } });
  const remoteLastBusiness = await remotePrisma.business.findFirst({ orderBy: { id: 'desc' } });
  
  console.log("\nLast Business Entry (Local):", localLastBusiness?.name);
  console.log("Last Business Entry (Remote):", remoteLastBusiness?.name);

  await localPrisma.$disconnect();
  await remotePrisma.$disconnect();
}

compare().catch(console.error);
