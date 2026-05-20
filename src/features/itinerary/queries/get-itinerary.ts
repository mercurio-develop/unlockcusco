"use server";

import { prisma } from '@/lib/prisma';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, "1m"), // 100 reads per minute
      analytics: true,
      prefix: "@upstash/ratelimit/itineraries-read",
    })
  : null;

export async function getItinerary(id: string) {
  try {
    // 1. Rate Limiting
    if (ratelimit) {
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return { error: "Too many requests. Please try again in a minute." };
      }
    }

    if (!id) {
      return { error: 'Missing id' };
    }

    const saved = await prisma.savedItinerary.findUnique({
      where: { shortId: id }
    });

    if (!saved) {
      return { error: 'Not found' };
    }

    return { success: true, state: saved.state };
  } catch (error) {
    console.error('Failed to load itinerary:', error);
    return { error: 'Internal server error' };
  }
}
