import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow more time for scraping

// Basic in-memory rate limiter
const rateLimit = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // per minute

export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (record) {
    if (now - record.timestamp < RATE_LIMIT_WINDOW_MS) {
      if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a minute before checking live availability again.' },
          { status: 429 }
        );
      }
      record.count++;
    } else {
      rateLimit.set(ip, { count: 1, timestamp: now });
    }
  } else {
    rateLimit.set(ip, { count: 1, timestamp: now });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
  }

  try {
    // Create a mock dataset as our "scraped" result because real live scraping tuboleto.cultura.pe
    // usually requires solving captchas that a headless browser alone cannot bypass easily without extra services.
    const simulateScraping = async () => {
      // We simulate a 2-second scraping delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        date,
        tickets: [
          { type: 'Machu Picchu (Llaqta)', circuit: 'Circuit 1 or 2', available: Math.floor(Math.random() * 50), price: 'S/ 152.00', time: '06:00 - 07:00' },
          { type: 'Machu Picchu (Llaqta)', circuit: 'Circuit 1 or 2', available: Math.floor(Math.random() * 50), price: 'S/ 152.00', time: '07:00 - 08:00' },
          { type: 'Machu Picchu (Llaqta)', circuit: 'Circuit 1 or 2', available: 0, price: 'S/ 152.00', time: '08:00 - 09:00' },
          { type: 'Machu Picchu (Llaqta) + Huayna Picchu', circuit: 'Circuit 4', available: Math.floor(Math.random() * 10), price: 'S/ 200.00', time: '07:00 - 08:00' },
        ],
        trains: [
          { company: 'PeruRail', type: 'Expedition', route: 'Ollantaytambo -> Aguas Calientes', departure: '05:05', arrival: '06:35', available: true, price: '$65' },
          { company: 'IncaRail', type: 'The Voyager', route: 'Ollantaytambo -> Aguas Calientes', departure: '06:40', arrival: '08:01', available: true, price: '$70' },
          { company: 'PeruRail', type: 'Vistadome', route: 'Ollantaytambo -> Aguas Calientes', departure: '07:05', arrival: '08:27', available: false, price: '$95' },
        ],
        source: "simulated (live scraping blocked by Cloudflare)"
      };
    };

    const data = await simulateScraping();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: "Failed to scrape availability." }, { status: 500 });
  }
}
