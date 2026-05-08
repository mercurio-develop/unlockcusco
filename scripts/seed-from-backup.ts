import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), 'prisma', 'backups', '2026-05-08');

async function main() {
  console.log("🛠️ Starting Data Restoration from 2026-05-08 Backup...");

  const loadJson = (filename: string) => {
    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return [];
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`✅ Loaded ${data.length} records from ${filename}`);
    return data;
  };

  // 1. Clear existing data in reverse order of relations
  console.log("🗑️ Clearing current database...");
  await prisma.rideMessage.deleteMany();
  await prisma.rideBooking.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.traveler.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.review.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.businessService.deleteMany();
  await prisma.tourPackage.deleteMany();
  await prisma.business.deleteMany();

  // 2. Restore Businesses
  const businesses = loadJson('business.json');
  for (let i = 0; i < businesses.length; i += 50) {
    const chunk = businesses.slice(i, i + 50);
    await prisma.business.createMany({
      data: chunk.map((b: any) => ({
        ...b,
        // Ensure data consistency for date/time if any were missed
      }))
    });
  }

  // 3. Restore BusinessServices
  const services = loadJson('businessservice.json');
  if (services.length > 0) {
    await prisma.businessService.createMany({ data: services });
  }

  // 4. Restore TourPackages
  const packages = loadJson('tourpackage.json');
  if (packages.length > 0) {
    await prisma.tourPackage.createMany({ data: packages });
  }

  // 5. Restore Leads
  const leads = loadJson('lead.json');
  if (leads.length > 0) {
    await prisma.lead.createMany({
      data: leads.map((l: any) => ({
        ...l,
        date: new Date(l.date),
        createdAt: new Date(l.createdAt)
      }))
    });
  }

  // 6. Restore Reviews
  const reviews = loadJson('review.json');
  for (let i = 0; i < reviews.length; i += 50) {
    const chunk = reviews.slice(i, i + 50);
    await prisma.review.createMany({ data: chunk });
  }

  // 7. Restore Trips
  const trips = loadJson('trip.json');
  for (const t of trips) {
    await prisma.trip.create({
      data: {
        ...t,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        createdAt: new Date(t.createdAt)
      }
    });
  }

  // 8. Restore TripDays
  const tripDays = loadJson('tripday.json');
  if (tripDays.length > 0) {
    await prisma.tripDay.createMany({
      data: tripDays.map((d: any) => ({
        ...d,
        date: new Date(d.date)
      }))
    });
  }

  // 9. Restore Travelers
  const travelers = loadJson('traveler.json');
  if (travelers.length > 0) {
    await prisma.traveler.createMany({
      data: travelers.map((t: any) => ({
        ...t,
        dateOfBirth: new Date(t.dateOfBirth),
        createdAt: new Date(t.createdAt)
      }))
    });
  }

  console.log("✨ Restoration Complete!");
}

main()
  .catch(e => {
    console.error("❌ Restoration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
