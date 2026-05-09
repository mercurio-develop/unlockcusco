/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const replacements = [
  // Prisma client calls
  { regex: /prisma\.agency/g, replace: 'prisma.business' },
  { regex: /prisma\.transport/g, replace: 'prisma.business' },
  { regex: /prisma\.therapist/g, replace: 'prisma.business' },
  
  // Relations
  { regex: /include:\s*\{\s*agency:\s*true\s*\}/g, replace: 'include: { business: true }' },
  { regex: /agencyId:/g, replace: 'businessId:' },
  { regex: /agency:/g, replace: 'business:' },
  { regex: /\bAgency\b/g, replace: 'Business' },
  { regex: /\bTransport\b/g, replace: 'Business' },
  { regex: /\bTherapist\b/g, replace: 'Business' },

  // Fields
  { regex: /categorySlug/g, replace: 'category' },
  { regex: /businessType/g, replace: 'category' },
  { regex: /reviewSummary/g, replace: 'description' }, // rough mapping
  { regex: /googleRating/g, replace: 'rating' },
  { regex: /elevationMeters/g, replace: 'capacity' }
];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { regex, replace } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir('src');
processDir('scripts');
