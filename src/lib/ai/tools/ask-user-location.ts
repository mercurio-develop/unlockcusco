import { tool } from 'ai';
import { z } from 'zod';

/**
 * Tool to request the user's physical GPS location via a UI button in the chat.
 * Use this when you need a starting or ending point and the user hasn't typed a town name.
 */
export const askUserLocation = tool({
  description: 'Displays a button in the chat asking the user to share their current GPS location. Use this when the user is starting their journey and you need their exact starting point.',
  inputSchema: z.object({
    message: z.string().describe('A custom message to display above the button, e.g. "To calculate your route, please share your current location."')
  }),
  execute: async ({ message }) => {
    return {
      requested: true,
      message
    };
  }
});
