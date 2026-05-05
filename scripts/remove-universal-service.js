const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const importReplacements = [
  { pattern: /import\s+(type\s+)?\{\s*UniversalService(\s*,\s*[^}]+)?\s*\}\s*from\s*["']@\/lib\/types\/trip["']/g, replacement: 'import type { Business } from "@prisma/client"\nimport type { $2 } from "@/lib/types/trip"' },
  { pattern: /import\s+(type\s+)?\{\s*([^,]+,\s*)?UniversalService\s*\}\s*from\s*["']@\/lib\/types\/trip["']/g, replacement: 'import type { Business } from "@prisma/client"\nimport type { $2 } from "@/lib/types/trip"' },
  { pattern: /UniversalService/g, replacement: 'Business' },
  // Clean up any empty imports left behind
  { pattern: /import\s+type\s*\{\s*undefined\s*\}\s*from\s*["']@\/lib\/types\/trip["']/g, replacement: '' },
  { pattern: /import\s+type\s*\{\s*,\s*[^}]+\s*\}\s*from\s*["']@\/lib\/types\/trip["']/g, replacement: (match) => match.replace(/,\s*/, '') },
  { pattern: /import\s+type\s*\{\s*\}\s*from\s*["']@\/lib\/types\/trip["']/g, replacement: '' },
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
          if (typeof replacement === 'function') {
            content = content.replace(pattern, replacement);
          } else {
             // Handle the specific captures for the first two rules
            content = content.replace(pattern, (match, p1, p2) => {
                if (replacement.includes('$2')) {
                    if (p2 && p2.trim() !== '' && p2.trim() !== ',') {
                       return `import type { Business } from "@prisma/client"\nimport type { ${p2.replace(/,\s*$/, '').trim()} } from "@/lib/types/trip"`;
                    }
                    return 'import type { Business } from "@prisma/client"';
                }
                return replacement;
            });
          }
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

// Remove entity mappers file entirely
if (fs.existsSync('src/lib/utils/entity-mappers.ts')) {
  fs.unlinkSync('src/lib/utils/entity-mappers.ts');
  console.log('Deleted src/lib/utils/entity-mappers.ts');
}

// Remove the entity mappers imports from files that used them
const mapperReplacements = [
  { pattern: /import\s*\{\s*mapBusinessToUniversal\s*,?\s*[^}]*\}\s*from\s*["']@\/lib\/utils\/entity-mappers["']/g, replacement: '' },
  { pattern: /import\s*\{\s*mapTransportToUniversal\s*,?\s*[^}]*\}\s*from\s*["']@\/lib\/utils\/entity-mappers["']/g, replacement: '' },
  { pattern: /import\s*\{\s*mapTherapistToUniversal\s*,?\s*[^}]*\}\s*from\s*["']@\/lib\/utils\/entity-mappers["']/g, replacement: '' },
  { pattern: /import\s*\{\s*[^}]*mapBusinessToUniversal\s*\}\s*from\s*["']@\/lib\/utils\/entity-mappers["']/g, replacement: '' },
  { pattern: /import\s*\{\s*map[A-Za-z]+ToUniversal\s*\}\s*from\s*["']@\/lib\/utils\/entity-mappers["']/g, replacement: '' },
  { pattern: /\.map\(map[A-Za-z]+ToUniversal\)/g, replacement: '' },
];

function removeMappers(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeMappers(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      for (const { pattern, replacement } of mapperReplacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Removed mappers in: ${fullPath}`);
      }
    }
  }
}

processDirectory('src');
removeMappers('src');
console.log('Removal complete!');
