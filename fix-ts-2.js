const fs = require('fs');
const glob = require('glob');

const tsFiles = glob.sync('src/**/*.{ts,tsx}');

tsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace orderBy: { rating: 'desc' }
  content = content.replace(/orderBy:\s*\{\s*rating:\s*(['"])desc\1\s*\}/g, 'orderBy: { scoreQuality: "desc" }');
  
  // Replace b.rating with (b.scoreQuality ? b.scoreQuality / 20 : 0)
  content = content.replace(/\b(\w+)\.rating\b/g, (match, p1) => {
    // Skip if it's a known non-business object that still uses rating
    return `(${p1}.scoreQuality ? ${p1}.scoreQuality / 20 : 0)`;
  });

  // Fix plan.(morning.scoreQuality ? morning.scoreQuality / 20 : 0)
  content = content.replace(/(\w+)\.\((\w+)\.scoreQuality \? \2\.scoreQuality \/ 20 : 0\)/g, "($1.$2.scoreQuality ? $1.$2.scoreQuality / 20 : 0)");

  // Replace { rating: number } in type definitions
  content = content.replace(/rating:\s*number\b/g, "scoreQuality: number");

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
