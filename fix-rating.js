const fs = require('fs');
const glob = require('glob');

const files = glob.sync('scripts/seed/**/*.ts');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Review creation needs rating: 5
  content = content.replace(/author:([^,]+),\s*text:\s*([^,}]+)\s*}/g, 'author:$1, text: $2, rating: 5 }');
  fs.writeFileSync(file, content);
});