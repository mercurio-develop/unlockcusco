import { tool } from 'ai';
import { z } from 'zod';

export const mutateItinerary = tool({
  description: 'Surgically edits the user\'s current day plan (activeItinerary) without rebuilding it from scratch. Use this when the user asks to swap a place, change a time, or set a new start/end location.',
  parameters: z.object({
    action: z.enum(['SWAP_STOP', 'SET_START', 'SET_END', 'UPDATE_TIME', 'ADD_WAYPOINT']),
    targetId: z.string().optional().describe('The ID of the waypoint or anchor to modify (e.g. itin-start, itin-arrival, or a business ID)'),
    time: z.string().optional().describe('The new time (HH:MM)'),
    resolvedBusiness: z.any().optional().describe('The business object to insert/swap (must include id, name, lat, lng, category)'),
    resolvedLocation: z.string().optional().describe('The name of the new location'),
    coords: z.object({ lat: z.number(), lng: z.number() }).optional().describe('Coordinates of the new location')
  }),
  // @ts-ignore
  execute: async (payload: any) => {
    // The UI handles the actual state mutation in ai-concierge.tsx via this payload
    return {
      success: true,
      ...payload
    };
  }
});
