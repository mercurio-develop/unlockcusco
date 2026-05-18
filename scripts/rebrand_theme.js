const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace hardcoded Tailwind classes with semantic ones
  // We use regex to ensure we only replace color classes and not random words
  
  // Rose -> Brand
  content = content.replace(/text-rose/g, 'text-brand');
  content = content.replace(/bg-rose/g, 'bg-brand');
  content = content.replace(/border-rose/g, 'border-brand');
  content = content.replace(/fill-rose/g, 'fill-brand');
  content = content.replace(/stroke-rose/g, 'stroke-brand');
  content = content.replace(/ring-rose/g, 'ring-brand');
  content = content.replace(/decoration-rose/g, 'decoration-brand');

  // Amber -> Accent
  content = content.replace(/text-amber/g, 'text-accent');
  content = content.replace(/bg-amber/g, 'bg-accent');
  content = content.replace(/border-amber/g, 'border-accent');
  content = content.replace(/fill-amber/g, 'fill-accent');
  content = content.replace(/stroke-amber/g, 'stroke-accent');
  content = content.replace(/ring-amber/g, 'ring-accent');
  content = content.replace(/decoration-amber/g, 'decoration-accent');

  // Slate -> Neutral
  content = content.replace(/text-slate/g, 'text-neutral');
  content = content.replace(/bg-slate/g, 'bg-neutral');
  content = content.replace(/border-slate/g, 'border-neutral');
  content = content.replace(/fill-slate/g, 'fill-neutral');
  content = content.replace(/stroke-slate/g, 'stroke-neutral');
  content = content.replace(/ring-slate/g, 'ring-neutral');
  content = content.replace(/decoration-slate/g, 'decoration-neutral');

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
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      replaceInFile(filePath);
    }
  }
}

console.log('Starting global theme refactor...');
walkDir(path.join(__dirname, '../src'));
walkDir(path.join(__dirname, '../scripts'));
console.log('Semantic theming applied successfully!');
