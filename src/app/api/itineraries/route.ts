import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

const ItinerarySchema = z.object({
  state: z.string().min(1)
});

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1m"), // 5 itineraries per minute
      analytics: true,
      prefix: "@upstash/ratelimit/itineraries-save",
    })
  : null;

function generateShortId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    if (ratelimit) {
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
      }
    }

    // 2. Body Parsing & Validation
    const rawData = await request.json();
    const result = ItinerarySchema.safeParse(rawData);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    const { state } = result.data;

    let shortId = generateShortId();
    // Simple collision check loop (in production might want more robust handling)
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.savedItinerary.findUnique({
        where: { shortId }
      });
      if (!existing) break;
      shortId = generateShortId();
    }

    const saved = await prisma.savedItinerary.create({
      data: {
        shortId,
        state: state
      }
    });

    return NextResponse.json({ success: true, shortId: saved.shortId });
  } catch (error) {
    console.error('Failed to save itinerary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
