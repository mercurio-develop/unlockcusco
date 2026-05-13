import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, "1m"), // 100 reads per minute
      analytics: true,
      prefix: "@upstash/ratelimit/itineraries-read",
    })
  : null;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Rate Limiting
    if (ratelimit) {
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
      }
    }

    const resolvedParams = await params;
    const shortId = resolvedParams.id;
    
    if (!shortId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const saved = await prisma.savedItinerary.findUnique({
      where: { shortId }
    });

    if (!saved) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, state: saved.state });
  } catch (error) {
    console.error('Failed to load itinerary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
