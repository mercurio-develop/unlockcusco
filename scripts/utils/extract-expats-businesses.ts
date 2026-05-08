import fs from 'fs/promises';
import path from 'path';
import { generateText, Output } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import 'dotenv/config';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

const businessSchema = z.object({
  businesses: z.array(z.object({
    name: z.string().describe("The name of the business"),
    category: z.enum(["DINING", "MEDICAL", "SERVICES"]).describe("The broad category of the business"),
    location: z.string().describe("The town or specific location mentioned (e.g., Pisac, Urubamba, Cusco)"),
    description: z.string().describe("A brief 1-2 sentence description of the business and what they offer"),
    contact: z.string().optional().describe("Any phone number, email, or physical address provided")
  }))
});

async function main() {
  console.log('🚀 Extracting businesses from Sacred Valley Expats data...');

  const dataPath = path.join(process.cwd(), 'research', 'sacred-valley-expats.json');
  const fileContent = await fs.readFile(dataPath, 'utf-8');
  const articles = JSON.parse(fileContent);

  // Filter articles that likely contain businesses
  const targetKeywords = ['eat', 'cafes', 'dentists', 'vets'];
  const relevantArticles = articles.filter((article: any) => 
    targetKeywords.some(keyword => article.title.toLowerCase().includes(keyword))
  );

  console.log(`Found ${relevantArticles.length} relevant articles for business extraction.`);

  let allBusinesses: any[] = [];

  for (const article of relevantArticles) {
    console.log(`Analyzing: ${article.title}...`);
    try {
      const { output } = await generateText({
        model: google('gemini-2.5-pro'),
        output: Output.object({ schema: businessSchema }),
        prompt: `You are extracting local business listings from an expat blog article.
Extract all the specific businesses (restaurants, cafes, dentists, vets, etc.) mentioned in the following text.

Article Title: ${article.title}

Text:
${article.content}`
      });

      if (output && output.businesses) {
        allBusinesses = [...allBusinesses, ...output.businesses];
      }
    } catch (err) {
      console.error(`Failed to parse businesses from ${article.title}:`, err);
    }
  }

  console.log('\n--- EXTRACTED BUSINESSES TABLE ---\n');
  console.log('| Business Name | Category | Location | Description | Contact |');
  console.log('|---|---|---|---|---|');
  
  for (const b of allBusinesses) {
    // Sanitize for markdown table
    const safeDesc = b.description.replace(/\|/g, '-').replace(/\n/g, ' ');
    const safeContact = (b.contact || '').replace(/\|/g, '-').replace(/\n/g, ' ');
    console.log(`| **${b.name}** | ${b.category} | ${b.location} | ${safeDesc} | ${safeContact} |`);
  }
}

main().catch(console.error);