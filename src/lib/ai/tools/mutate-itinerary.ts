import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { COORDS_MAP } from '@/lib/constants';

/**
 * Tool for specific, granular modifications to an active itinerary.
 * Supports: 
 * - Swapping an existing stop for a specific business
 * - Updating start or end locations
 * - Changing the time of an event or anchor
 */
export const mutateItinerary = tool({
  description: 'Performs granular mutations on the active itinerary, such as swapping a stop for a new business, updating start/end locations, or changing times.',
  inputSchema: z.object({
    action: z.enum(['SWAP_STOP', 'SET_START', 'SET_END', 'UPDATE_TIME']).describe('The specific mutation to perform'),
    targetId: z.string().optional().describe('The ID of the event to swap or update (required for SWAP_STOP and UPDATE_TIME)'),
    businessId: z.string().optional().describe('The ID of the new business to inject (for SWAP_STOP, SET_START, SET_END)'),
    locationStr: z.string().optional().describe('A free-text location name (for SET_START, SET_END if no businessId)'),
    time: z.string().optional().describe('The new time in HH:MM format'),
  }),
  execute: async ({ action, targetId, businessId, locationStr, time }) => {
    let business = null;
    if (businessId) {
      business = await prisma.business.findUnique({ where: { id: businessId } });
    } else if (locationStr) {
       // Try to find a business by name if a string is provided for anchors
       business = await prisma.business.findFirst({
         where: { name: { contains: locationStr, mode: 'insensitive' } }
       });
    }

    return {
      success: true,
      action,
      targetId,
      time,
      resolvedBusiness: business ? {
        id: business.id,
        name: business.name,
        category: business.category,
        lat: business.lat,
        lng: business.lng,
        imageUrl: business.imageUrl,
        description: business.description
      } : null,
      resolvedLocation: locationStr || (business ? business.name : null),
      coords: business ? { lat: business.lat, lng: business.lng } : (locationStr ? (COORDS_MAP as any)[locationStr.toLowerCase()] : null)
    };
  }
});
