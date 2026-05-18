const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src/features/discovery/components');
const templates = [
  'BasicTemplate.tsx',
  'CultureTemplate.tsx',
  'ExpeditionTemplate.tsx',
  'GastronomicTemplate.tsx',
  'SanctuaryTemplate.tsx',
  'StaysTemplate.tsx'
];

templates.forEach(template => {
  const filePath = path.join(templatesDir, template);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import
  if (!content.includes('getLocalizedField')) {
    content = 'import { getLocalizedField } from "@/lib/utils/localization"\n' + content;
  }

  // Add lang to Props
  const interfaceRegex = new RegExp(`interface ${template.replace('.tsx', '')}Props \\{([\\s\\S]*?)\\}`);
  const match = content.match(interfaceRegex);
  if (match && !match[1].includes('lang: string')) {
    content = content.replace(interfaceRegex, `interface ${template.replace('.tsx', '')}Props {${match[1]}  lang: string\n}`);
  }

  // Update component signature
  const funcRegex = new RegExp(`export function ${template.replace('.tsx', '')}\\(\\{([\\s\\S]*?)\\}:`);
  const funcMatch = content.match(funcRegex);
  if (funcMatch && !funcMatch[1].includes('lang')) {
    content = content.replace(funcRegex, `export function ${template.replace('.tsx', '')}({${funcMatch[1]}, lang }:`);
  }

  // Replace business.description with localized
  content = content.replace(/business\.description/g, "getLocalizedField(business, 'description', lang)");
  
  // Replace other potential usages in lists (like items.map)
  // e.g., item.description -> getLocalizedField(item, 'description', lang)
  content = content.replace(/([a-zA-Z0-9_]+)\.description(?!Es| |:|\()/g, "getLocalizedField($1, 'description', lang)");
  
  // Also name, title, tagline etc if they exist
  content = content.replace(/business\.name/g, "getLocalizedField(business, 'name', lang)");
  content = content.replace(/business\.tagline/g, "getLocalizedField(business, 'tagline', lang)");
  content = content.replace(/pkg\.title/g, "getLocalizedField(pkg, 'title', lang)");
  content = content.replace(/pkg\.tagline/g, "getLocalizedField(pkg, 'tagline', lang)");

  fs.writeFileSync(filePath, content);
});

console.log("Templates updated");
