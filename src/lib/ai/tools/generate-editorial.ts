import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function generateEditorialProfile(rawReviews: string) {
  const { object } = await generateObject({
    model: google('gemini-2.5-pro'),
    system: "You are an expert Editorial Guide editor. You will receive raw, messy internet reviews for a business. You must return a JSON object with: 1. `scoreQuality`, `scoreVibe`, `scoreService` (each rated strictly out of 30 based on the reviews. 26-30 is extraordinary, 20-25 is very good, below 20 is average/poor). 2. `editorialSummary`: A 2-to-3 sentence review that synthesizes the opinions. You MUST embed 3 or 4 short, punchy quotes from the raw reviews directly into your sentences (e.g., This 'hidden gem' offers 'stunning valley views').",
    schema: z.object({
      scoreQuality: z.number().min(0).max(30).describe("Quality score out of 30"),
      scoreVibe: z.number().min(0).max(30).describe("Vibe score out of 30"),
      scoreService: z.number().min(0).max(30).describe("Service score out of 30"),
      editorialSummary: z.string().describe("A 2-to-3 sentence review synthesizing opinions with 3 or 4 embedded short, punchy quotes.")
    }),
    prompt: `Analyze the following raw reviews and generate an Editorial profile:\n\n${rawReviews}`,
  });

  return object;
}
