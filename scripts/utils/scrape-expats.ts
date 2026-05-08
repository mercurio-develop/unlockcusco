import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🚀 Starting Sacred Valley Expats Scraper...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'https://sacredvalleyexpats.com/';
  console.log(`\n🌐 Visiting homepage: ${baseUrl}`);
  
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Find all internal article links
  const links = await page.evaluate((baseUrl) => {
    const anchorTags = Array.from(document.querySelectorAll('a'));
    const uniqueLinks = new Set<string>();
    
    anchorTags.forEach(a => {
      const href = a.href.split('#')[0]; // Remove hash fragments
      // Filter out links that aren't articles on the same domain
      if (
        href.startsWith(baseUrl) &&
        !href.includes('/category/') &&
        !href.includes('/tag/') &&
        !href.includes('/author/') &&
        !href.includes('/contact') &&
        !href.includes('/about') &&
        href !== baseUrl &&
        href !== baseUrl + 'es' &&
        href !== baseUrl + 'es/'
      ) {
        uniqueLinks.add(href);
      }
    });
    
    return Array.from(uniqueLinks);
  }, baseUrl);

  console.log(`✅ Found ${links.length} potential article links.`);

  const scrapedData = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`[${i + 1}/${links.length}] Scraping: ${link}`);
    
    try {
      const articlePage = await context.newPage();
      await articlePage.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      const articleData = await articlePage.evaluate(() => {
        // Extract title before removing anything
        const titleEl = document.querySelector('h1.entry-title') || document.querySelector('h1') || document.querySelector('.post-title');
        const title = titleEl?.textContent?.trim() || '';

        // Remove noise
        document.querySelectorAll('script, style, nav, footer, iframe, svg, .sidebar, .comments, #comments, .widget').forEach(el => el.remove());

        // Try common WordPress content classes
        const contentBody = document.querySelector('.entry-content') || document.querySelector('.post-content') || document.querySelector('article') || document.querySelector('main') || document.body;

        // Extract text
        const text = contentBody?.textContent?.trim() || '';

        return { title, text };
      });
      if (articleData.title && articleData.text) {
        scrapedData.push({
          url: link,
          title: articleData.title,
          content: articleData.text
        });
        console.log(`   -> Extracted: ${articleData.title.substring(0, 40)}...`);
      } else {
        console.log(`   -> ⚠️ No title/content found, skipping.`);
      }
      
      await articlePage.close();
      
      // Be polite to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err: any) {
      console.error(`❌ Failed to scrape ${link}:`, err.message);
    }
  }

  await browser.close();

  const outputPath = path.join(process.cwd(), 'research', 'sacred-valley-expats.json');
  await fs.writeFile(outputPath, JSON.stringify(scrapedData, null, 2), 'utf-8');
  
  console.log(`\n🎉 Done! Saved ${scrapedData.length} articles to ${outputPath}`);
}

main().catch(console.error);
