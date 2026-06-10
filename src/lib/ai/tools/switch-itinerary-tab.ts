import { tool } from 'ai';
import { z } from 'zod';

export const switchItineraryTab = tool({
  description: `Switch the user's active itinerary tab. Use this when the user says something like "Switch to the alternative route", "I want to work on my secondary itinerary", or "Show me the primary route". You MUST use this to switch the active context so that subsequent changes (like adding waypoints) happen in the correct itinerary.`,
  parameters: z.object({
    tab: z.enum(['primary', 'secondary']).describe('The tab to switch to.')
  }),
  execute: async ({ tab }: { tab: string }) => {
    return {
      success: true,
      tab,
      message: `Successfully switched context to the ${tab} itinerary. Any places you add will now go here.`
    };
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);