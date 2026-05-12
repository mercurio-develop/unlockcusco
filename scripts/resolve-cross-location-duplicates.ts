import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("=== Resolving Cross-Location and Remaining Fuzzy Duplicates ===")

  const idsToDelete = [
    'cmp1s5dx8006iml2ikvr7dz9w', // Muju Café
    '41d4bb36-0f2c-4c36-bc77-5763d6958368', // Sananda
    'cmp1spfrs008rml2ip0521sxh', // Sacred Valley ATV Adventures
    
    // Ayahuasca Cusco
    'cmp2077u1000kmlpo89f2uneh',
    'cmp20gj5j0013mlpoedn0m65r',
    
    // Travel and Healing
    'cmp204zem000hmlpowdomzpzk',
    'cmp1q52tn0021ml2iul2hbzy9',
    'cmp208ysy000omlpokhfg10ba',
    'cmp20dwbb000zmlpojo8j7ict',
    
    // Cusco Andean Hike
    '5b9b389a-f4a6-4feb-85e1-e33f9b4a914b',
    
    // Cusco Peru Quad Bike Adventures
    'cmp1tbpi400a0ml2ivq0wcoem',
    
    // Sacred Rocks SPA
    'cmp1r12gf003iml2i32tpo0x4',
    
    // River Explorers
    'b883abce-41e3-45c3-a92a-374d9f82404d',
    
    // Cusco ATVs
    'cmp1qx76z001yml5xixb9rga4',
    'cmp1u0wfc00buml2iq0xgozrr',
    
    // Hotel Inka
    'b65eacad-6aa7-445e-83c8-92e871876f1f',
    
    // Sierra
    'dbd19f6f-d04d-411a-8d3b-2ca139b9eaa8',
    
    // Tumi Del Inka
    '416c0930-a6ea-4b1e-8128-4c21a7850c47',
    
    // Arkana Spiritual Center
    'cmp1zymj10001mlpo09pfjo97', // cusco
    'cmp20d7pe000wmlpooofjd9vq', // calca
    
    // Dolci Dolci
    'cmp1omvwp000lmllqao0e508w',
    
    // SolSeed
    'a4f79624-f562-48e5-a9a3-7fd2948638fd',
    
    // Paramatma
    'cmp1pu05v0018ml2if4w3fbgz',
    
    // Antica Osteria
    '5a245695-b44e-492c-b6a2-815bf9b24a63',
    
    // Peru Moto Tours
    '25dc614f-bdfa-47a6-8d84-07b0a4519ae8',
    
    // Native Peruvian Restaurant
    'cmp1s7n94006pml2i6qafj7sw',
    
    // Rumi Ancestral Spa
    'cmp1pz3hx001rml2il7hii19p',
    
    // ATV Cusco Adventures on wheels
    '8fdd146e-1927-482d-afc0-c3535ada6bfa'
  ]

  const result = await prisma.business.deleteMany({
    where: {
      id: { in: idsToDelete }
    }
  })

  console.log(`\n=== Done. Purged ${result.count} cross-location duplicates. ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
