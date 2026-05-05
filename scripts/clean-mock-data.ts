import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up _MOCK_DATA_ businesses...')
  
  const result = await prisma.business.deleteMany({
    where: {
      name: {
        contains: '_MOCK_DATA_'
      }
    }
  })

  console.log(`\nCleanup complete! Deleted ${result.count} mock businesses.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
