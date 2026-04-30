import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const CATEGORY_IMAGES: Record<string, string[]> = {
  Gastronomía: [
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=1000&auto=format&fit=crop',
  ],
  Bienestar: [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1000&auto=format&fit=crop',
  ],
  Aventura: [
    'https://images.unsplash.com/photo-1522345678432-8dfc0a273dd9?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1000&auto=format&fit=crop',
  ],
  Descanso: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551918120-9739cb430c6d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop',
  ],
  Cultura: [
    'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526392060635-9d60198d3fe3?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531761535209-180857e963b9?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop',
  ],
}

function isBroken(url: string): boolean {
  // Google signed URLs expire fast
  if (url.includes('gps-cs-s')) return true
  if (url.includes('lh3.googleusercontent.com')) return true
  if (url.includes('lh5.googleusercontent.com')) return true
  // TripAdvisor dynamic URLs also expire
  if (url.includes('dynamic-media-cdn.tripadvisor.com')) return true
  return false
}

// Deterministic pick so the same business always gets the same image
function pickImage(category: string, id: string): string {
  const pool = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES['Cultura']
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return pool[hash % pool.length]
}

async function main() {
  const all = await prisma.business.findMany({ select: { id: true, category: true, imageUrl: true } })
  const broken = all.filter(b => isBroken(b.imageUrl))

  console.log(`Found ${broken.length} broken image URLs out of ${all.length} total`)

  let fixed = 0
  for (const b of broken) {
    await prisma.business.update({
      where: { id: b.id },
      data: { imageUrl: pickImage(b.category, b.id) },
    })
    fixed++
  }

  console.log(`✅ Fixed ${fixed} image URLs`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
