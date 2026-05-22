/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { COORDS_MAP } from '@/lib/constants';
import { universalSearch } from '@/features/discovery/queries/universal-search';
import { sanitizeToolOutput } from '@/lib/ai/utils/sanitize-tool-output';

function lookupCoords(name: string): { lat: number; lng: number } | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  const entries = Object.entries(COORDS_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [key, coords] of entries) {
    if (lower.includes(key.replace(/-/g, ' ')) || lower.includes(key)) return coords;
  }
  return null;
}

const payloadSchema = z.object({
  action: z.enum([
    'SWAP_STOP', 
    'SET_START', 
    'SET_END', 
    'UPDATE_TIME', 
    'ADD_WAYPOINT', 
    'REMOVE_WAYPOINT',
    'MOVE_WAYPOINT',
    'CLEAR_START',
    'CLEAR_END',
    'SET_TRANSPORT_PROFILE',
    'UNDO',
    'REDO'
  ]),
  targetId: z.string().optional().describe('The ID of the waypoint to modify (e.g. itin-start, itin-arrival, or an existing waypoint ID)'),
  businessId: z.string().optional().describe('The ID of the business to insert/swap (must be an exact ID from searchDatabase)'),
  resolvedLocation: z.string().optional().describe('The name of a generic location if not a specific business'),
  coords: z.object({ lat: z.number(), lng: z.number() }).optional().describe('Coordinates for the generic location'),
  time: z.string().optional().describe('The new time (HH:MM)'),
  direction: z.enum(['up', 'down']).optional().describe('Direction to move a waypoint'),
  transportProfile: z.enum(['driving', 'walking']).optional().describe('New transport mode for a leg'),
  legIndex: z.number().optional().describe('The 0-based index of the route leg to modify transport for')
});

type Payload = z.infer<typeof payloadSchema>;

export const mutateItinerary = tool({
  description: 'Surgically edits the user\'s current day plan (activeItinerary). Use this when the user asks to add/remove stops, reorder waypoints, clear start/end locations, or change transport modes (driving/walking) for specific legs.',
  parameters: payloadSchema,
  execute: async (payload: Payload) => {
    let resolvedBusiness: {
      id: string;
      name: string;
      category: string | null;
      lat: number | null;
      lng: number | null;
      rating: number | null;
      slug: string;
      imageUrl: string | null;
      tagline: string | null;
      description: string | null;
      priceTier: string | null;
      reviewsCount: number | null;
    } | null = null;
    
    if (payload.businessId) {
      resolvedBusiness = await prisma.business.findUnique({
        where: { id: payload.businessId },
        select: {
          id: true,
          name: true,
          category: true,
          lat: true,
          lng: true,
          rating: true,
          slug: true,
          imageUrl: true,
          tagline: true,
          description: true,
          priceTier: true,
          reviewsCount: true
        }
      });
    }

    let resolvedLocation = payload.resolvedLocation;
    let resolvedCoords = payload.coords;

    if (!resolvedCoords && resolvedLocation) {
      resolvedCoords = lookupCoords(resolvedLocation) ?? undefined;
    }

    if (!resolvedBusiness && resolvedLocation && !resolvedCoords) {
      try {
        const results = await universalSearch({ 
          query: resolvedLocation,
          limit: 1
        });
        if (results && results.length > 0) {
          const r = results[0];
          resolvedBusiness = {
            id: r.id,
            name: r.name,
            category: r.category,
            lat: r.lat,
            lng: r.lng,
            rating: r.rating,
            slug: r.slug,
            imageUrl: r.imageUrl,
            tagline: r.tagline,
            description: r.description,
            priceTier: r.priceTier,
            reviewsCount: r.reviewsCount
          };
          if (resolvedBusiness.lat && resolvedBusiness.lng) {
            resolvedCoords = { lat: resolvedBusiness.lat, lng: resolvedBusiness.lng };
          }
        }
      } catch (e) {
        console.error("universalSearch failed in mutateItinerary:", e);
      }
    }

    if (payload.businessId && !resolvedBusiness && !resolvedLocation) {
        resolvedLocation = payload.businessId;
    }

    return sanitizeToolOutput({
      success: true,
      ...payload,
      coords: resolvedCoords || undefined,
      resolvedBusiness,
      resolvedLocation
    });
  }
     
} as any);
