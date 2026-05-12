import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Calculate Levenshtein distance
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculate similarity ratio (0 to 1)
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

// Tokenize and compare
function tokenSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.split(' ').filter(t => t.length > 2));
  const tokensB = new Set(b.split(' ').filter(t => t.length > 2));
  
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of Array.from(tokensA)) {
    if (tokensB.has(token)) intersection++;
  }

  const union = tokensA.size + tokensB.size - intersection;
  return intersection / union; // Jaccard similarity
}

async function main() {
  console.log("=== Fuzzy Finding Duplicates by Location ===")

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, locationSlug: true, category: true, reviewsCount: true }
  })

  // Group by location
  const byLocation: Record<string, any[]> = {}
  businesses.forEach(b => {
    if (!b.locationSlug) return
    if (!byLocation[b.locationSlug]) byLocation[b.locationSlug] = []
    byLocation[b.locationSlug].push(b)
  })

  const normalize = (name: string) => {
    return name.toLowerCase()
      .replace(/restaurant|cafe|bar|hotel|hostel|hostal|lodge|boutique|spa|massage|tour|tours|agency|travel|trekking|peru|cusco|sacred|valley/gi, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  let suspiciousPairs = 0;

  for (const [loc, items] of Object.entries(byLocation)) {
    console.log(`\nChecking location: ${loc.toUpperCase()} (${items.length} items)`)
    
    // Compare every pair
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const b1 = items[i];
        const b2 = items[j];

        const norm1 = normalize(b1.name);
        const norm2 = normalize(b2.name);

        if (norm1.length < 3 || norm2.length < 3) continue;

        const sim = similarity(norm1, norm2);
        const tokSim = tokenSimilarity(norm1, norm2);

        // If very similar string or very similar words
        if (sim > 0.82 || tokSim > 0.70) {
          console.log(`\n  ⚠️ Potential Match (Sim: ${(sim*100).toFixed(0)}%, Tok: ${(tokSim*100).toFixed(0)}%):`)
          console.log(`     - [${b1.category}] ${b1.name} (ID: ${b1.id}, Reviews: ${b1.reviewsCount})`)
          console.log(`     - [${b2.category}] ${b2.name} (ID: ${b2.id}, Reviews: ${b2.reviewsCount})`)
          suspiciousPairs++;
        }
      }
    }
  }

  console.log(`\n=== Found ${suspiciousPairs} highly suspicious pairs ===`)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
