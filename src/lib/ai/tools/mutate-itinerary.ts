import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const mutateItinerary = tool({
  description: 'Surgically edits the user\'s current day plan (activeItinerary). Use this when the user asks to add a specific place to their route or set a new start/end location. You must provide the businessId from a previous searchDatabase result.',
  parameters: z.object({
    action: z.enum(['SWAP_STOP', 'SET_START', 'SET_END', 'UPDATE_TIME', 'ADD_WAYPOINT']),
    targetId: z.string().optional().describe('The ID of the waypoint to modify (e.g. itin-start, itin-arrival, or an existing waypoint ID)'),
    businessId: z.string().optional().describe('The ID of the business to insert/swap (must be an exact ID from searchDatabase)'),
    resolvedLocation: z.string().optional().describe('The name of a generic location if not a specific business'),
    time: z.string().optional().describe('The new time (HH:MM)')
  }),
  // @ts-ignore
  execute: async (payload: any) => {
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

    // The UI handles the actual state mutation in ai-concierge.tsx via this payload
    return {
      success: true,
      ...payload,
      resolvedBusiness
    };
  }
});
