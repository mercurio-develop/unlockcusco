import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to convert ALL CAPS to Title Case
function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

function normalizeName(originalName: string): string {
  let name = originalName;

  // 1. Convert ALL CAPS to Title Case (if it has uppercase but no lowercase)
  if (!/[a-z]/.test(name) && /[A-Z]/.test(name)) {
    name = toTitleCase(name);
  }

  // 2. Remove trailing parentheses
  name = name.replace(/\s*\([^)]*\)\s*$/, '');

  // 3. Smart splitting for dashes (-) and pipes (|)
  // If the string is something like "Name | Tours in Cusco" or "Name - Best Massage"
  // We split by these separators, and if the last chunk contains SEO fluff, we drop it.
  const separators = /\s+[-|/]\s+/;
  let parts = name.split(separators);
  
  // We check up to 2 times in case there's "Name - Restaurant - Cusco"
  for (let i = 0; i < 2; i++) {
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].toLowerCase();
      const fluffRegex = /(cusco|urubamba|pisac|calca|ollantaytambo|chinchero|machu picchu|aguas calientes|sacred valley|valle sagrado|peru|perú|massage|masajes|restaurant|restaurante|hotel|hostel|boutique|spa|tours|tour|travel|agency|agencia|cafe|cafeteria|food)/;
      
      if (fluffRegex.test(lastPart)) {
        parts.pop(); // Remove the offending suffix chunk
      }
    }
  }
  // Rejoin whatever is left (using space if we had to rejoin multiple valid parts)
  name = parts.join(' - ');

  // 4. Remove any remaining trailing SEO fluff (if they didn't use a clean separator)
  const locationRegex = /\s*[-|,]*\s*(cusco|urubamba|pisac|calca|ollantaytambo|chinchero|machu picchu|aguas calientes|sacred valley|valle sagrado|peru|perú)\s*$/i;
  name = name.replace(locationRegex, '');
  name = name.replace(locationRegex, ''); // Run twice for stacked locations

  const genericRegex = /\s*[-|,]+\s*(massage|masajes|restaurant|restaurante|hotel|hostel|boutique|spa|tours|tour|travel|agency|agencia|cafe|cafeteria|food)\s*$/i;
  name = name.replace(genericRegex, '');

  // 5. Clean up any remaining trailing punctuation
  name = name.replace(/\s*[-|,|\||\/]\s*$/, '');

  // 6. Clean up multiple spaces
  name = name.replace(/\s+/g, ' ').trim();

  return name.length > 0 ? name : originalName;
}

async function main() {
  console.log('🧹 Starting advanced business name normalization...')
  
  const businesses = await prisma.business.findMany()
  let updatedCount = 0

  for (const b of businesses) {
    const originalName = b.name;
    const cleanName = normalizeName(originalName);
      
    if (cleanName !== originalName) {
      console.log(`\nOriginal: "${originalName}"`);
      console.log(`Cleaned:  "${cleanName}"`);
      
      await prisma.business.update({
        where: { id: b.id },
        data: { name: cleanName }
      });
      updatedCount++;
    }
  }

  console.log(`\n✨ Cleanup complete! Normalized ${updatedCount} business names.`);
}

main()
  .catch(e => {
    console.error("❌ Error during cleanup:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
