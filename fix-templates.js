const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src/features/discovery/components');
const templates = [
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

  // Fix syntax error by re-writing the interface properly
  content = content.replace(/interface [a-zA-Z]+Props \{[\s\S]*?\n\}\n  dict\?: any\n\}/g, (match) => {
    // Just grab the inside and format it cleanly
    const nameMatch = match.match(/interface ([a-zA-Z]+Props) \{/);
    if (!nameMatch) return match;
    const name = nameMatch[1];
    
    if (name === 'ExpeditionTemplateProps') {
      return `interface ExpeditionTemplateProps {\n  business: Business & { tourPackages?: any[] }\n  dict?: any\n  lang: string\n}`;
    } else {
      return `interface ${name} {\n  business: Business & { services: BusinessService[] }\n  dict?: any\n  lang: string\n}`;
    }
  });

  fs.writeFileSync(filePath, content);
});

console.log("Templates fixed properly");
