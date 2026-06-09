import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function checkUrl(url: string): Promise<{ isValid: boolean; status: number | string; error?: string }> {
  if (!url) return { isValid: false, status: "MISSING" };
  if (url.startsWith("/")) return { isValid: true, status: "LOCAL" };
  if (!url.startsWith("http")) return { isValid: false, status: "INVALID_PROTOCOL" };

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    
    // Try HEAD request first with User-Agent
    let res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(id);

    // If HEAD is blocked or returns non-200, try a GET request but abort quickly
    if (res.status !== 200) {
      const getController = new AbortController();
      const getId = setTimeout(() => getController.abort(), 4000);
      res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Range": "bytes=0-0" // Just request the first byte to save bandwidth
        },
        signal: getController.signal
      });
      clearTimeout(getId);
    }

    return {
      isValid: res.status === 200 || res.status === 206,
      status: res.status
    };
  } catch (e: any) {
    return {
      isValid: false,
      status: "FETCH_ERROR",
      error: e.message || String(e)
    };
  }
}

async function main() {
  console.log("🔍 Fetching all businesses from Supabase...");
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      googleMapsUrl: true,
      googlePlaceId: true,
      category: true,
      locationSlug: true
    }
  });

  console.log(`Auditing ${businesses.length} businesses for image health...`);

  let totalCount = businesses.length;
  let validCount = 0;
  let missingCount = 0;
  let googleRotatedGpsCount = 0;
  let unsplashCount = 0;
  let otherHttpBrokenCount = 0;

  const brokenList: any[] = [];
  const domainBreakdown: Record<string, number> = {};

  const batchSize = 25;
  for (let i = 0; i < businesses.length; i += batchSize) {
    const batch = businesses.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)}...`);
    
    await Promise.all(
      batch.map(async (b) => {
        const url = b.imageUrl;
        
        if (!url || url.trim() === "") {
          missingCount++;
          brokenList.push({ ...b, reason: "Missing/Empty URL" });
          return;
        }

        if (url.includes("unsplash.com")) {
          unsplashCount++;
          brokenList.push({ ...b, reason: "Unsplash Placeholder" });
          return;
        }

        const check = await checkUrl(url);
        if (check.isValid) {
          validCount++;
        } else {
          let domain = "unknown";
          try {
            domain = new URL(url).hostname;
          } catch {}
          domainBreakdown[domain] = (domainBreakdown[domain] || 0) + 1;
          
          let reason = `HTTP Error/Fetch Error (Status: ${check.status})`;
          if (url.includes("gps-cs-s")) {
            googleRotatedGpsCount++;
            reason = `Expired Google Rotated URL (gps-cs-s) (Status: ${check.status})`;
          } else {
            otherHttpBrokenCount++;
          }

          brokenList.push({
            ...b,
            reason,
            details: check.error || ""
          });
        }
      })
    );
  }

  console.log("\n=================================");
  console.log("📊 IMAGE HEALTH AUDIT REPORT");
  console.log("=================================");
  console.log(`Total Businesses Audited:       ${totalCount}`);
  console.log(`Valid/Working Images:           ${validCount}`);
  console.log(`Total Broken/Missing Images:    ${brokenList.length}`);
  console.log("---------------------------------");
  console.log(`  - Empty/Missing URLs:         ${missingCount}`);
  console.log(`  - Unsplash Placeholders:      ${unsplashCount}`);
  console.log(`  - Google Rotated (gps-cs-s):  ${googleRotatedGpsCount}`);
  console.log(`  - HTTP/Fetch Broken:          ${otherHttpBrokenCount}`);
  console.log("=================================");

  console.log("\n🌐 Domain Breakdown for HTTP/Fetch Broken Images:");
  Object.entries(domainBreakdown)
    .sort(([, a], [, b]) => b - a)
    .forEach(([domain, count]) => {
      console.log(`  - ${domain}: ${count}`);
    });

  const reportPath = "broken-images-detailed-report.json";
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      total: totalCount,
      valid: validCount,
      broken: brokenList.length,
      categories: {
        missing: missingCount,
        unsplash: unsplashCount,
        googleRotatedGps: googleRotatedGpsCount,
        httpBroken: otherHttpBrokenCount
      }
    },
    brokenBusinesses: brokenList
  }, null, 2));

  console.log(`\n💾 Saved detailed report to: ${reportPath}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
