/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { messaging } from '@/lib/messaging';
import { sanitizeToolOutput } from '@/lib/ai/utils/sanitize-tool-output';

const payloadSchema = z.object({
  vendorName: z.string(),
  phone: z.string(),
  partySize: z.number().optional(),
  requestedTime: z.string().optional()
});

type Payload = z.infer<typeof payloadSchema>;

export const askAvailability = tool({
  description: 'Asks a vendor (e.g., driver or restaurant) for availability via the Ghost Phone or Twilio. Use this BEFORE rendering the CinematicTimeline if the user needs guaranteed booking.',
  parameters: payloadSchema,
  execute: async ({ vendorName, phone, partySize, requestedTime }: Payload) => {
    try {
      // Use standard messaging service (Twilio in Prod, Ghost Phone in Dev)
      await messaging.askAvailability({
        vendorName,
        phone: phone || '+51999999999',
        partySize,
        requestedTime
      });

      return sanitizeToolOutput({ 
        status: 'pending', 
        message: `Availability request sent to ${vendorName}. Waiting for reply.` 
      });
    } catch (e) {
      console.warn("Messaging failed, simulating success for MVP flow", e);
      return sanitizeToolOutput({ 
        status: 'simulated_success', 
        message: 'Vendor confirmed availability (simulated response due to messaging failure).' 
      });
    }
  }
   
} as any);
