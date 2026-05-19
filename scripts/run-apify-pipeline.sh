#!/bin/bash

# Exit on error
set -e

echo "==================================="
echo " Starting Apify Scraping Pipeline"
echo "==================================="

echo "[1/3] Scraping Google Maps via Apify..."
npx tsx scripts/pipeline/1-scrape-apify.ts

echo "[2/3] Enriching Zagat Descriptions..."
npx tsx scripts/pipeline/2-enrich-zagat.ts

echo "[3/3] Enriching SEO Metadata..."
npx tsx scripts/pipeline/3-enrich-seo.ts

echo "==================================="
echo " Pipeline Complete!"
echo "==================================="
