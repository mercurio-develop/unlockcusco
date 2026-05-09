/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const moves = [
  { from: 'src/components/agencies', to: 'src/features/agencies/components' },
  { from: 'src/components/cards/business-card.tsx', to: 'src/features/business/components/business-card.tsx' },
  { from: 'src/components/cards/entity-card.tsx', to: 'src/features/business/components/entity-card.tsx' },
  { from: 'src/components/cards/service-card.tsx', to: 'src/features/services/components/service-card.tsx' },
  { from: 'src/components/checkout', to: 'src/features/checkout/components' },
  { from: 'src/components/claim', to: 'src/features/business/components/claim' },
  { from: 'src/components/concierge', to: 'src/features/concierge/components' },
  { from: 'src/components/dashboard', to: 'src/features/business/components/dashboard' },
  { from: 'src/components/filters', to: 'src/features/explore/components/filters' },
  { from: 'src/components/trip', to: 'src/features/explore/components/trip' }
];

// Ensure target directories exist
moves.forEach(move => {
  const targetDir = move.to.endsWith('.tsx') ? path.dirname(move.to) : move.to;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
});

// Move files/directories
moves.forEach(move => {
  if (fs.existsSync(move.from)) {
    if (fs.statSync(move.from).isDirectory()) {
      // Move contents of directory to target
      const items = fs.readdirSync(move.from);
      items.forEach(item => {
        fs.renameSync(path.join(move.from, item), path.join(move.to, item));
      });
      fs.rmdirSync(move.from);
    } else {
      fs.renameSync(move.from, move.to);
    }
  }
});
// Remove empty cards dir
if (fs.existsSync('src/components/cards')) {
  try { fs.rmdirSync('src/components/cards'); } catch(e) {}
}

const importReplacements = [
  { pattern: /@\/components\/agencies/g, replacement: '@/features/agencies/components' },
  { pattern: /@\/components\/cards\/business-card/g, replacement: '@/features/business/components/business-card' },
  { pattern: /@\/components\/cards\/entity-card/g, replacement: '@/features/business/components/entity-card' },
  { pattern: /@\/components\/cards\/service-card/g, replacement: '@/features/services/components/service-card' },
  { pattern: /@\/components\/checkout/g, replacement: '@/features/checkout/components' },
  { pattern: /@\/components\/claim/g, replacement: '@/features/business/components/claim' },
  { pattern: /@\/components\/concierge/g, replacement: '@/features/concierge/components' },
  { pattern: /@\/components\/dashboard/g, replacement: '@/features/business/components/dashboard' },
  { pattern: /@\/components\/filters/g, replacement: '@/features/explore/components/filters' },
  { pattern: /@\/components\/trip/g, replacement: '@/features/explore/components/trip' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      for (const { pattern, replacement } of importReplacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated imports in: ${fullPath}`);
      }
    }
  }
}

processDirectory('src');
console.log('FSA migration complete!');
