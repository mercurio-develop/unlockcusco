const fs = require('fs');
const glob = require('glob');

const tsFiles = glob.sync('src/**/*.{ts,tsx}');

tsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Revert Transport orderBy scoreQuality back to rating
  if (file.includes('taxi-estimator.ts')) {
    content = content.replace(/orderBy:\s*\{\s*scoreQuality:\s*"desc"\s*\}/g, 'orderBy: { rating: "desc" }');
    content = content.replace(/orderBy:\s*\{\s*scoreQuality:\s*'desc'\s*\}/g, "orderBy: { rating: 'desc' }");
  }

  if (file.includes('chrono-relay.ts')) {
    // Revert the transport orderBy specifically
    content = content.replace(/prisma\.transport\.findFirst\(\{\s*where:\s*\{\s*category:\s*\{\s*contains:\s*'taxi'\s*\}\s*\},\s*orderBy:\s*\{\s*scoreQuality:\s*'desc'\s*\}\s*\}/g, "prisma.transport.findFirst({ where: { category: { contains: 'taxi' } }, orderBy: { rating: 'desc' } })");
    // Or just a general hack:
    content = content.replace(/orderBy:\s*\{\s*scoreQuality:\s*'desc'\s*\}/g, (match, offset, str) => {
      const prevText = str.substring(Math.max(0, offset - 100), offset);
      if (prevText.includes('transport')) {
        return "orderBy: { rating: 'desc' }";
      }
      return match;
    });

    content = content.replace(/food\.rating\s*\|\|/g, "(food.scoreQuality ? food.scoreQuality / 20 : 4.8) ||");
    content = content.replace(/stay\.rating\s*\|\|/g, "(stay.scoreQuality ? stay.scoreQuality / 20 : 4.9) ||");
    content = content.replace(/rating:\s*4\.9/g, "scoreQuality: 98");
  }

  // Generic .rating replacements for Business type
  content = content.replace(/(\w+)\.rating/g, (match, p1) => {
    // Avoid changing if p1 is 'taxi', 'transport', 'alt', 'selected', unless we know what alt/selected is
    if (['taxi', 'transport'].includes(p1)) return match;
    return `(${p1}.scoreQuality ? ${p1}.scoreQuality / 20 : 0)`;
  });

  // There are some explicit definitions of rating: number in components
  content = content.replace(/rating:\s*number/g, "scoreQuality: number");

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
