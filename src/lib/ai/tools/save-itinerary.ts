import { tool } from 'ai';
import { z } from 'zod';

const payloadSchema = z.object({
  itineraryState: z.string().describe("The current itinerary state as a JSON string.")
});

type Payload = z.infer<typeof payloadSchema>;

export const generateSaveLink = tool({
  description: 'Generates a magic link to save the current itinerary. Call this whenever a user asks you to save the itinerary, save their trip, or give them a link to their route.',
  parameters: payloadSchema,
  execute: async ({ itineraryState }: Payload) => {
    try {
      const stateObj = JSON.parse(itineraryState);
      const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      const res = await fetch(`${host}/api/itineraries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: stateObj })
      });
      
      const data = await res.json();
      if (data.success && data.shortId) {
        return { success: true, url: `${host}/explore?trip=${data.shortId}` };
      }
      return { success: false, error: data.error || 'Failed to save' };
    } catch (e) {
      console.error('generateSaveLink error:', e);
      return { success: false, error: 'Internal error generating link' };
    }
  }
} as any);
