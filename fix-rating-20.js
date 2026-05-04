const fs = require('fs');
const glob = require('glob');

const tsFiles = glob.sync('src/**/*.{ts,tsx}');

tsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace (X.rating ? X.rating / 20 : 0) with X.rating
  content = content.replace(/\(([^.\s]+(\.[^.\s]+)*)\.rating\s*\?\s*\1\.rating\s*\/\s*20\s*:\s*0\)/g, '$1.rating');
  // Also (X.rating ? X.rating / 20 : 0) could be without parenthesis if it was inserted directly
  content = content.replace(/([^.\s]+(\.[^.\s]+)*)\.rating\s*\?\s*\1\.rating\s*\/\s*20\s*:\s*0/g, '$1.rating');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Reverted / 20 in ${file}`);
  }
});