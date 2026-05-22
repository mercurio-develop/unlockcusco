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

    // Hydrate state with fresh business data from the DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = saved.state as any;
    if (state) {
      const businessIds = new Set<string>();

      // Collect IDs from waypoints
      if (Array.isArray(state.waypoints)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        state.waypoints.forEach((wp: any) => {
          if (wp.id) businessIds.add(wp.id);
          else if (wp.service?.id) businessIds.add(wp.service.id);
        });
      }

      // Collect IDs from anchors
      if (state.startAnchor?.service?.id) businessIds.add(state.startAnchor.service.id);
      if (state.endAnchor?.service?.id) businessIds.add(state.endAnchor.service.id);

      if (businessIds.size > 0) {
        const businesses = await prisma.business.findMany({
          where: { id: { in: Array.from(businessIds) } }
        });
        const businessMap = new Map(businesses.map(b => [b.id, b]));

        if (Array.isArray(state.waypoints)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          state.waypoints.forEach((wp: any) => {
            const bId = wp.id || wp.service?.id;
            if (bId && businessMap.has(bId)) {
              const b = businessMap.get(bId);
              wp.service = b;
              wp.category = b?.category || wp.category;
              wp.title = wp.title || b?.name;
              wp.locationStr = wp.locationStr || b?.locationSlug;
            }
          });
        }

        if (state.startAnchor?.service?.id && businessMap.has(state.startAnchor.service.id)) {
          state.startAnchor.service = businessMap.get(state.startAnchor.service.id);
        }
        if (state.endAnchor?.service?.id && businessMap.has(state.endAnchor.service.id)) {
          state.endAnchor.service = businessMap.get(state.endAnchor.service.id);
        }
      }
    }

    return { success: true, state };
  } catch (error) {
    console.error('Failed to load itinerary:', error);
    return { error: 'Internal server error' };
  }
}
