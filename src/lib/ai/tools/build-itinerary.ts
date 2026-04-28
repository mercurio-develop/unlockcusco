import { tool } from 'ai';
import { z } from 'zod';

export const buildItinerary = tool({
  description: 'Builds a multi-step itinerary combining an anchor activity and a meal, including transit if needed.',
  inputSchema: z.object({
    userLat: z.number(),
    userLng: z.number(),
    vibeIntent: z.string()
  }),
  execute: async ({ userLat, userLng, vibeIntent }) => {
    try {
      // 1. Fetch Anchor activity (DIRECT_PARTNER).
      // 2. Fetch Meal (SCRAPED).
      // 3. Calculate Haversine distance between them. If > 2km, inject Transit block.
      // 4. Return bundled array of timeline nodes.
      console.log(userLat, userLng, vibeIntent);
      return [];
    } catch (error) {
      console.error(error);
      return { error: "Failed to build itinerary." };
    }
  }
});
