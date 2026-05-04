const fs = require('fs');
const glob = require('glob');

const tsFiles = glob.sync('src/**/*.{ts,tsx}');
tsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Prisma queries
  if (content.includes("orderBy: { rating: 'desc' }")) {
    content = content.replace(/orderBy:\s*\{\s*rating:\s*'desc'\s*\}/g, "orderBy: { scoreQuality: 'desc' }");
    changed = true;
  }
  if (content.includes('orderBy: { rating: "desc" }')) {
    content = content.replace(/orderBy:\s*\{\s*rating:\s*"desc"\s*\}/g, 'orderBy: { scoreQuality: "desc" }');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
