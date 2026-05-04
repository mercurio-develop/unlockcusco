const fs = require('fs');
const glob = require('glob');

const tsFiles = glob.sync('src/**/*.{ts,tsx}');

tsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Revert orderBy: { scoreQuality: "desc" }
  content = content.replace(/orderBy:\s*\{\s*scoreQuality:\s*(['"])desc\1\s*\}/g, 'orderBy: { rating: "desc" }');
  
  // Revert (X.scoreQuality ? X.scoreQuality / 20 : 0)
  content = content.replace(/\(\(([^)]+)\s+as\s+any\)\.scoreQuality\s*\?\s*\(\1\s+as\s+any\)\.scoreQuality\s*\/\s*20\s*:\s*0\)/g, '$1.rating');
  content = content.replace(/\(([^.\s]+(\.[^.\s]+)*)\.scoreQuality\s*\?\s*\1\.scoreQuality\s*\/\s*20\s*:\s*0\)/g, '$1.rating');

  // Fix types
  content = content.replace(/scoreQuality:\s*number\b/g, "rating: number");
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Reverted ${file}`);
  }
});
