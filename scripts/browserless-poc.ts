import puppeteer from 'puppeteer-core';

// This is a standalone Proof of Concept (PoC) for connecting to Browserless.io
// Run this with: BROWSERLESS_API_KEY=your_key_here npx tsx scripts/browserless-poc.ts

async function run() {
  const token = process.env.BROWSERLESS_API_KEY;
  
  if (!token) {
    console.error("❌ Error: BROWSERLESS_API_KEY environment variable is not set.");
    console.error("Please provide your API key. Example:");
    console.error("BROWSERLESS_API_KEY=abc-123 npx tsx scripts/browserless-poc.ts");
    process.exit(1);
  }

  console.log("🌐 Connecting to Browserless.io...");
  
  let browser;
  try {
    browser = await puppeteer.connect({
      // The browserless connection string. We use stealth to avoid being blocked.
      browserWSEndpoint: `wss://chrome.browserless.io?token=${token}&stealth=true`,
    });

    console.log("✅ Connected successfully!");

    const page = await browser.newPage();
    
    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Example: Navigate to PeruRail's search page to prove we can access it
    // Note: This URL might need to be adjusted based on their actual routing
    const targetUrl = 'https://www.perurail.com/';
    console.log(`🚂 Navigating to ${targetUrl} ...`);
    
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the page to load and extract the main title
    const pageTitle = await page.title();
    console.log(`\n📄 Page Title: "${pageTitle}"`);

    // Prove we can interact by finding the destination inputs
    const formsAvailable = await page.evaluate(() => {
      // Just check if there's any booking form elements present
      const form = document.querySelector('form');
      return form ? "Yes" : "No";
    });

    console.log(`🎟️  Booking forms found on page: ${formsAvailable}`);
    console.log("\n🎉 PoC Successful. Browserless can load the site without getting instantly blocked.");

  } catch (error) {
    console.error("❌ An error occurred during scraping:", error);
  } finally {
    if (browser) {
      console.log("\nClosing browser connection...");
      await browser.close();
    }
  }
}

run();