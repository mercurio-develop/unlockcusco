import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('📖 Generating AI Concierge Knowledge Base...');

  const dataPath = path.join(process.cwd(), 'research', 'sacred-valley-expats.json');
  const fileContent = await fs.readFile(dataPath, 'utf-8');
  const articles = JSON.parse(fileContent);

  const targetKeywords = [
    'warnings', 'carnet', 'overdevelopment', 'all about', 'rainbow mountain', 'sound therapy', 'palo santo', 'skylodge'
  ];

  const relevantArticles = articles.filter((article: any) => 
    targetKeywords.some(keyword => article.title.toLowerCase().includes(keyword))
  );

  console.log(`Found ${relevantArticles.length} lifestyle/knowledge articles.`);

  let markdownContent = `# Sacred Valley Expats - Knowledge Base\n\nThis document contains essential lifestyle, legal, and cultural knowledge about the Sacred Valley. Use this to inform the user when they ask about living, renting, buying land, or general cultural advice.\n\n`;

  for (const article of relevantArticles) {
    markdownContent += `## ${article.title}\n\n`;
    markdownContent += `${article.content}\n\n`;
    markdownContent += `---\n\n`;
  }

  const outputDir = path.join(process.cwd(), 'src', 'lib', 'ai', 'knowledge');
  await fs.mkdir(outputDir, { recursive: true });

  const tsFilePath = path.join(outputDir, 'expats-guide.ts');
  
  const tsContent = `export const EXPATS_KNOWLEDGE_BASE = \`\n${markdownContent.replace(/`/g, '\\`')}\`;\n`;
  
  await fs.writeFile(tsFilePath, tsContent, 'utf-8');

  console.log(`✅ Saved knowledge base to ${tsFilePath}`);
}

main().catch(console.error);
