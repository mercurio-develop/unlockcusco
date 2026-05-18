const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', '.vercel', 'build', 'dist', 
  '.idea', 'playwright-report', 'test-results', '.gemini', '.agent', '.claude',
  '.gemini_security'
]);

const IGNORE_EXTS = new Set([
  '.jpg', '.png', '.svg', '.jpeg', '.gif', '.ico', '.webp', '.mp4', '.webm', '.pdf', '.zip'
]);

function replaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    newContent = newContent.replace(/UnlockCusco/g, 'UnlockCusco');
    newContent = newContent.replace(/unlockcusco/g, 'unlockcusco');
    newContent = newContent.replace(/UNLOCKCUSCO/g, 'UNLOCKCUSCO');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    // Might fail on binary files not filtered out, ignore gracefully
  }
}

function traverseDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (IGNORE_DIRS.has(file)) continue;
      
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverseDir(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (!IGNORE_EXTS.has(ext)) {
          replaceInFile(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error traversing ${dir}:`, err.message);
  }
}

console.log('Starting rebranding replacement...');
traverseDir(__dirname);
console.log('Done.');