import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
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
    'SET_TRANSPORT_PROFILE'
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
    let resolvedBusiness = null;
    
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
        }
      });
    }

    // Auto-resolve coords from COORDS_MAP when Gemini omits them for generic towns
    let resolvedLocation = payload.resolvedLocation;
    if (payload.businessId && !resolvedBusiness && !resolvedLocation) {
        // Fallback: If Gemini used businessId for a place not in the DB and omitted resolvedLocation
        resolvedLocation = payload.businessId;
    }

    let resolvedCoords = payload.coords;
    if (!resolvedCoords && resolvedLocation) {
      resolvedCoords = lookupCoords(resolvedLocation) ?? undefined;
    }

    return {
      success: true,
      ...payload,
      coords: resolvedCoords,
      resolvedBusiness,
      resolvedLocation
    };
  }
} as any);
