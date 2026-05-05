import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mergeGroups = [
  {
    name: 'Tunupa',
    primaryId: 'c65e78e1-01d4-4371-a901-cde484799fd2',
    duplicateIds: [
      'b42a6970-c8b0-4a10-9231-e5893d26d151',
      '44401bb3-acb3-47a1-8994-05182925be27'
    ]
  },
  {
    name: 'El Albergue',
    primaryId: '7a983080-456c-4507-88e2-bf6c547613e5',
    duplicateIds: [
      'ed81e872-23e1-450b-af06-c8d3a26bd47d'
    ]
  },
  {
    name: 'Trexperience',
    primaryId: 'cmol2c9xb0003mluvpw3qk4pu',
    duplicateIds: [
      '4ba3bd71-4440-4154-ab97-2cade9d6213b'
    ]
  },
  {
    name: 'Servicio de taxi urubamba',
    primaryId: 'dabaec53-4738-4fe0-9e59-d37033492675',
    duplicateIds: [
      '9c446081-7fea-44e7-89ce-44295c10336f'
    ]
  }
];

async function main() {
  for (const group of mergeGroups) {
    console.log(`\nMerging group: ${group.name}`);
    for (const dupId of group.duplicateIds) {
      console.log(`  -> Migrating from ${dupId} to ${group.primaryId}`);
      
      // Fetch dup count just to log
      const dup = await prisma.business.findUnique({
        where: { id: dupId },
        include: {
          _count: { select: { tourPackages: true, services: true, reviews: true, leads: true, trips: true } }
        }
      });

      if (!dup) {
        console.log(`    - Duplicate not found (already deleted?)`);
        continue;
      }

      await prisma.$transaction(async (tx) => {
        if (dup._count.tourPackages > 0) {
          await tx.tourPackage.updateMany({ where: { businessId: dupId }, data: { businessId: group.primaryId } });
          console.log(`    - Migrated ${dup._count.tourPackages} TourPackages`);
        }
        if (dup._count.services > 0) {
          await tx.businessService.updateMany({ where: { businessId: dupId }, data: { businessId: group.primaryId } });
          console.log(`    - Migrated ${dup._count.services} Services`);
        }
        if (dup._count.reviews > 0) {
          await tx.review.updateMany({ where: { businessId: dupId }, data: { businessId: group.primaryId } });
          console.log(`    - Migrated ${dup._count.reviews} Reviews`);
        }
        if (dup._count.leads > 0) {
          await tx.lead.updateMany({ where: { businessId: dupId }, data: { businessId: group.primaryId } });
          console.log(`    - Migrated ${dup._count.leads} Leads`);
        }
        if (dup._count.trips > 0) {
          await tx.trip.updateMany({ where: { businessId: dupId }, data: { businessId: group.primaryId } });
          console.log(`    - Migrated ${dup._count.trips} Trips`);
        }
        
        await tx.business.delete({ where: { id: dupId } });
        console.log(`    - Deleted duplicate ${dupId}`);
      });
    }
  }
  console.log('\nDone specific merges.');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
