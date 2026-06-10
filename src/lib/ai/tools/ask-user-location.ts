/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { sanitizeToolOutput } from '@/lib/ai/utils/sanitize-tool-output';

const payloadSchema = z.object({
  message: z.string().describe('A custom message to display above the button, e.g. "To calculate your route, please share your current location."')
});

type Payload = z.infer<typeof payloadSchema>;

export const askUserLocation = tool({
  description: 'Displays a button in the chat asking the user to share their current GPS location. Use this ONLY when you DO NOT already have their userLat/userLng coordinates and they ask for recommendations "near me" or "nearby". DO NOT use this if the GPS status is already CONFIRMED.',
  parameters: payloadSchema,
  execute: async (args: Payload) => {
    return sanitizeToolOutput({
      requested: true,
      message: args.message
    });
  }
     
} as any);
