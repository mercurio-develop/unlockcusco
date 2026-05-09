import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { toolsRegistry } from '@/lib/ai/tools/registry';
import { SYSTEM_PROMPT_CONCIERGE, PLANNING_PROMPT, RESEARCH_PROMPT, SUPPORT_PROMPT } from '@/lib/ai/prompts';
import { PSYCHOGRAPHIC_MATRIX } from '@/lib/trip/psychographic-matrix';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const maxDuration = 30;

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1h"),
      analytics: true,
      prefix: "@upstash/ratelimit/vallecito-chat",
    })
  : null;

export async function POST(req: Request) {
  try {
    if (ratelimit) {
      const headerPayload = await headers();
      const ip = headerPayload.get("x-forwarded-for") || "anonymous";
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return new Response(JSON.stringify({ 
            error: "Too many requests. Please try again later.",
            limit,
            remaining,
            reset
        }), { 
            status: 429,
            headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
            }
        });
      }
    }

    const { messages, userLat, userLng, localTime, targetDate, archetype, intensity } = await req.json();
    console.log("=== INCOMING CHAT REQUEST ===");
    console.log("Local Time:", localTime, "Target Date:", targetDate, "Coords:", userLat, userLng, "Profile:", archetype, intensity);

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    let systemInstruction = SYSTEM_PROMPT_CONCIERGE
      .replace('{localTime}', localTime || 'unknown')
      .replace('{targetDate}', targetDate || 'today')
      .replace('{userLat}', userLat || 'unknown')
      .replace('{userLng}', userLng || 'unknown');

    systemInstruction += `\n\n${PLANNING_PROMPT}\n\n${SUPPORT_PROMPT}\n\n${RESEARCH_PROMPT}`;

    if (archetype && intensity && PSYCHOGRAPHIC_MATRIX[archetype]?.[intensity]) {
      systemInstruction += `\n\n<PSYCHOGRAPHIC_PROFILE>\nThe user is a [${archetype}] traveler seeking Intensity Level [${intensity}]. YOU MUST STRICTLY ALIGN YOUR RECOMMENDATIONS AND TONE WITH THIS EXACT DEFINITION: "${PSYCHOGRAPHIC_MATRIX[archetype][intensity]}".\nDo not suggest Level 3 intensity items to a Level 1 user, and vice versa. Adjust your conversational personality to match their risk tolerance and desires.\n</PSYCHOGRAPHIC_PROFILE>`;
    }

    // Pre-process messages
    const processedMessages = messages.map((msg: any) => {
      if (typeof msg.content === 'string') {
        let text = msg.content;
        if (msg.role === 'user' && text && text.startsWith('I just added') && text.includes('to my itinerary.')) {
          text += '\n\n[System Instruction: Acknowledge this addition and specifically ask the user: "I saw you added an experience to your Day itinerary. Do you want to set the start where you are? And do you have an idea where you will end this itinerary?"]';
        }
        return { ...msg, content: text };
      }
      return msg;
    });

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: systemInstruction,
      messages: processedMessages,
      tools: toolsRegistry as any, // Bypass strict type check for now since toolsRegistry is inferred from native tool() calls
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
