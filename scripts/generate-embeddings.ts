import { PrismaClient } from '@prisma/client'
import { embed } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const prisma = new PrismaClient()
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

async function main() {
  console.log('Generating embeddings for businesses...')
  const businesses = await prisma.business.findMany()

  console.log(`Found ${businesses.length} businesses to process.`)

  let count = 0;
  for (const business of businesses) {
    const textToEmbed = `${business.name}. ${business.category}. ${business.tagline} ${business.description} ${business.specialties || ''}`.trim()
    
    if (!textToEmbed) {
      console.log(`Skipping business ${business.id} due to empty content.`)
      continue
    }

    try {
      const { embedding } = await embed({
        model: google.textEmbeddingModel('gemini-embedding-2'),
        value: textToEmbed,
      })

      // Prisma requires raw query for unsupported types
      await prisma.$executeRaw`
        UPDATE "Business" 
        SET embedding = ${embedding}::vector 
        WHERE id = ${business.id}
      `
      count++;
      if (count % 10 === 0) console.log(`Processed ${count}/${businesses.length}`);
    } catch (e) {
      console.error(`Failed to embed business ${business.id}:`, e)
    }
  }
  console.log(`Finished processing ${count} businesses.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
