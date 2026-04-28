import { tool } from 'ai';
import { z } from 'zod';

export const askAvailability = tool({
  description: 'Asks a vendor (e.g., driver or restaurant) for availability via the Ghost Phone. Use this BEFORE rendering the CinematicTimeline if the user needs guaranteed booking. Note: for MVP, this sends a real message if ghost phone is running, but always returns simulated success to continue the flow seamlessly.',
  inputSchema: z.object({
    vendorName: z.string(),
    phone: z.string(),
    partySize: z.number().optional(),
    requestedTime: z.string().optional()
  }),
  execute: async ({ vendorName, phone, partySize, requestedTime }) => {
    try {
      const res = await fetch('http://localhost:4000/api/message/ask-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer dev-secret`
        },
        body: JSON.stringify({
          vendorName,
          phone: phone || '+51999999999',
          partySize,
          requestedTime
        })
      });
      // For MVP, we proceed even if the ping fails, to allow testing the UI
      if (res.ok) {
        return { status: 'pending', message: `Availability request sent to ${vendorName}. Waiting for reply.` };
      }
      return { status: 'simulated_success', message: 'Vendor confirmed availability (simulated response).' };
    } catch (e) {
      console.warn("Ghost phone unreachable, simulating success for MVP flow", e);
      return { status: 'simulated_success', message: 'Vendor confirmed availability (simulated response due to missing ghost phone).' };
    }
  }
});
