import { tool } from 'ai';
import { microDaySchema } from '../schemas/planner-schema';
import { COORDS_MAP } from '@/lib/constants';

function lookupCoords(name: string): { lat: number; lng: number } | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  const entries = Object.entries(COORDS_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [key, coords] of entries) {
    if (lower.includes(key.replace(/-/g, ' ')) || lower.includes(key)) return coords;
  }
  return null;
}

function normalizeAnchor(anchor: any): any {
  if (!anchor) return anchor;
  // Fill missing coords
  let result = anchor;
  if (!result.lat || !result.lng) {
    const c = lookupCoords(result.locationStr || result.title);
    if (c) result = { ...result, ...c };
  }
  // Fill empty title from locationStr (Gemini sometimes returns title:"")
  if (!result.title?.trim() && result.locationStr?.trim()) {
    result = { ...result, title: result.locationStr };
  }
  return result;
}

export const buildItinerary = tool({
  description: `Generates a full daily itinerary using the Journey Skeleton. Use this to plan a specific day with start/end anchors, waypoints, and transit.
CRITICAL: You MUST include realistic transit edges between every location. Do not invent fake businesses, use places from your searchDatabase results.
You can include 'pax' (number of passengers) to estimate per-person costs. Ensure totalCost is correctly calculated.`,
  parameters: microDaySchema,
  // @ts-ignore
  execute: async (payload: any) => {
    payload.startAnchor = normalizeAnchor(payload.startAnchor);
    payload.endAnchor = normalizeAnchor(payload.endAnchor);
    payload.waypoints = (payload.waypoints ?? []).map((wp: any) => {
      if (wp.lat && wp.lng) return wp;
      const c = lookupCoords(wp.locationStr || wp.title);
      return c ? { ...wp, ...c } : wp;
    });
    // Derive itinerary title if Gemini omitted it
    if (!payload.title?.trim()) {
      const s = payload.startAnchor?.title;
      const e = payload.endAnchor?.title;
      if (s && e) payload.title = `${s} → ${e}`;
    }
    return payload;
  }
});
