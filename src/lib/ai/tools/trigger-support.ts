/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { sanitizeToolOutput } from '@/lib/ai/utils/sanitize-tool-output';

const payloadSchema = z.object({
  message: z.string().describe('A detailed explanation of the user\'s issue, including any relevant context from the conversation.'),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('The severity of the issue. Use "critical" for safety concerns or completely failed logistics.')
});

type Payload = z.infer<typeof payloadSchema>;

export const triggerSupportAlert = tool({
  description: 'Triggers an emergency or high-priority support alert to human operators via the Ghost Phone. Use this when a user is lost, a service fails, or they explicitly request urgent human assistance.',
  parameters: payloadSchema,
  execute: async ({ message, urgencyLevel }: Payload) => {
    // In a real implementation, this would POST to the Ghost Phone webhook
    console.log(`\n🚨 [GHOST PHONE ALERT] Urgency: ${urgencyLevel.toUpperCase()}`);
    console.log(`📝 Message: ${message}`);
    console.log(`🚨 =========================================\n`);

    return sanitizeToolOutput({
      success: true,
      statusMessage: "Support alert successfully sent to local human operators."
    });
  }
     
} as any);