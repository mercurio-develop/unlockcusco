const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/unlockcusco\.app/g, 'unlockcusco.com');
  content = content.replace(/UnlockCusco\.app/g, 'UnlockCusco.com');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.next', '.gemini', '.claude'].includes(file)) {
        walkDir(filePath);
      }
    } else if (
      filePath.endsWith('.tsx') || 
      filePath.endsWith('.ts') || 
      filePath.endsWith('.jsx') || 
      filePath.endsWith('.js') || 
      filePath.endsWith('.md')
    ) {
      replaceInFile(filePath);
    }
  }
}

console.log('Starting domain replacement...');
walkDir(path.join(__dirname, '../'));
console.log('Domain replacement complete!');
