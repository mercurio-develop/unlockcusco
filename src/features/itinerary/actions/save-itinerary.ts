"use server";

import { prisma } from '@/lib/prisma';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { z } from "zod";

const ItineraryStateSchema = z.any().refine(
  (val) => {
    if (typeof val === 'string') return val.trim().length > 0;
    if (typeof val === 'object' && val !== null) return Object.keys(val).length > 0;
    return false;
  },
  { message: "State must be a non-empty string or object" }
);

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

export async function saveItineraryAction(state: unknown) {
  try {
    if (ratelimit) {
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return { error: "Too many requests. Please try again in a minute." };
      }
    }

    const validationResult = ItineraryStateSchema.safeParse(state);
    if (!validationResult.success) {
      return { error: 'Invalid state' };
    }

    let shortId = generateShortId();
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
        state: validationResult.data
      }
    });

    return { success: true, shortId: saved.shortId };
  } catch (error) {
    console.error('Failed to save itinerary:', error);
    return { error: 'Internal server error' };
  }
}
