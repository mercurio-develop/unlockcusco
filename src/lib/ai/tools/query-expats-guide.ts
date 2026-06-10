/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { EXPATS_KNOWLEDGE_BASE } from '../knowledge/expats-guide';
import { sanitizeToolOutput } from '@/lib/ai/utils/sanitize-tool-output';

const payloadSchema = z.object({
  query: z.string().describe('The topic or question to search the local knowledge base for, e.g. "buying land", "renting", "Calca", "Rainbow Mountain".'),
});

type Payload = z.infer<typeof payloadSchema>;

export const queryExpatsGuide = tool({
  description: 'Search the local knowledge base for the Sacred Valley. Use this to find information about long-term stays, buying land, renting houses, living in towns like Huaran or Calca, and sustainable tourism (Palo Santo, Rainbow Mountain). DO NOT use this for general tourism info like restaurants or opening hours.',
  parameters: payloadSchema,
  execute: async ({ query }: Payload) => {
    // In a real RAG system, this would do vector search.
    // For now, since the text isn't massive, we can return the whole thing or a chunk
    // But since it's a tool, the LLM will just read what we return.
    
    // We'll just return the full text for the model to read contextually.
    return sanitizeToolOutput({
      knowledgeBase: EXPATS_KNOWLEDGE_BASE,
      message: `Here is the comprehensive guide. Please extract the answer for '${query}' from this text.`
    });
  }
     
} as any);
