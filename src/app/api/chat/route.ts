import { GoogleGenAI, Content, FunctionCall } from '@google/genai';
import { buildItinerary } from '@/lib/ai/tools/build-itinerary';
import { askAvailability } from '@/lib/ai/tools/ask-availability';
import { createSearchDatabaseTool } from '@/lib/ai/tools/search-database';
import { buildMacroTrip } from '@/lib/ai/tools/build-macro-trip';
import { showBoletoInfo } from '@/lib/ai/tools/show-boleto-info';
import { estimateTaxiFare } from '@/lib/ai/tools/taxi-estimator';
import { mutateItinerary } from '@/lib/ai/tools/mutate-itinerary';
import { searchDayTours } from '@/lib/ai/tools/search-day-tours';
import { triggerSupportAlert } from '@/lib/ai/tools/trigger-support';
import { askUserLocation } from '@/lib/ai/tools/ask-user-location';
import { SYSTEM_PROMPT_CONCIERGE } from '@/lib/ai/prompts';
import { EXPATS_KNOWLEDGE_BASE } from '@/lib/ai/knowledge/expats-guide';
import { PSYCHOGRAPHIC_MATRIX } from '@/lib/trip/psychographic-matrix';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

export const maxDuration = 60;
export const runtime = 'edge'; // Use Edge for long-running streaming

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1h"),
      analytics: true,
      prefix: "@upstash/ratelimit/vallecito-chat",
    })
  : null;

// Initialize Google GenAI
const ai = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY 
});

export async function POST(req: Request) {
  try {
    // Rate Limiting
    if (ratelimit) {
      const headerPayload = await headers();
      const ip = headerPayload.get("x-forwarded-for") || "anonymous";
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return new Response(JSON.stringify({ 
            error: "Too many requests. Please try again later.",
            limit, remaining, reset
        }), { status: 429 });
      }
    }

    const { messages, userLat, userLng, localTime, targetDate, archetype, intensity } = await req.json();

    // 1. Build the System Prompt
    let systemPrompt = SYSTEM_PROMPT_CONCIERGE
      .replace('{localTime}', localTime || 'unknown')
      .replace('{targetDate}', targetDate || 'today')
      .replace('{userLat}', userLat || 'unknown')
      .replace('{userLng}', userLng || 'unknown');

    systemPrompt += `\n\n<EXPATS_KNOWLEDGE_BASE>\n${EXPATS_KNOWLEDGE_BASE}\n</EXPATS_KNOWLEDGE_BASE>\n`;

    if (archetype && intensity && PSYCHOGRAPHIC_MATRIX[archetype]?.[intensity]) {
      systemPrompt += `\n\n<PSYCHOGRAPHIC_PROFILE>\nThe user is a [${archetype}] traveler seeking Intensity Level [${intensity}]. YOU MUST STRICTLY ALIGN YOUR RECOMMENDATIONS AND TONE WITH THIS EXACT DEFINITION: "${PSYCHOGRAPHIC_MATRIX[archetype][intensity]}".\n</PSYCHOGRAPHIC_PROFILE>`;
    }

    // 2. Prepare Tools
    const searchContext = { userLat, userLng, targetDate, archetype, intensity };
    const searchDbTool = createSearchDatabaseTool(searchContext);
    
    const activeToolsMap: Record<string, any> = {
      buildItinerary, 
      mutateItinerary, 
      searchDatabase: searchDbTool, 
      estimateTaxiFare, 
      searchDayTours, 
      askUserLocation,
      triggerSupportAlert,
      showBoletoInfo,
      askAvailability,
      buildMacroTrip
    };

    const functionDeclarations = Object.entries(activeToolsMap).map(([name, t]) => {
      return {
        ...t.declaration,
        name // Inject the object key as the name
      };
    });

    // 3. Format Messages for @google/genai
    const formattedMessages: Content[] = messages.map((m: any) => {
      const parts = [];
      if (m.content) parts.push({ text: m.content });
      if (m.toolInvocations) {
        for (const t of m.toolInvocations) {
           if (t.state === 'call') {
             parts.push({ functionCall: { name: t.toolName, args: t.args } });
           } else if (t.state === 'result') {
             parts.push({ functionResponse: { name: t.toolName, response: t.result } });
           }
        }
      }
      return {
        role: m.role === 'assistant' ? 'model' : m.role, // GenAI uses 'model' instead of 'assistant'
        parts
      };
    });

    // Handle streaming
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Fire & forget async loop
    (async () => {
      try {
        let currentMessages = formattedMessages;
        let isComplete = false;

        while (!isComplete) {
          const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: currentMessages,
            config: {
              systemInstruction: systemPrompt,
              tools: [{ functionDeclarations }],
            }
          });

          let textContent = '';
          const toolCalls: FunctionCall[] = [];

          for await (const chunk of stream) {
            if (chunk.text) {
              textContent += chunk.text;
              await writer.write(encoder.encode(JSON.stringify({ type: 'text', content: chunk.text }) + '\n'));
            }
            if (chunk.functionCalls) {
              toolCalls.push(...chunk.functionCalls);
            }
          }

          // If no tool calls, we're done
          if (toolCalls.length === 0) {
            isComplete = true;
            break;
          }

          // We got tool calls, execute them and continue the conversation
          currentMessages.push({
             role: 'model',
             parts: [
               ...(textContent ? [{ text: textContent }] : []),
               ...toolCalls.map(tc => ({ functionCall: { name: tc.name, args: tc.args } }))
             ]
          });

          const toolResults = [];
          for (const tc of toolCalls) {
            const toolFn = tc.name ? activeToolsMap[tc.name] : undefined;
            if (toolFn) {
              // Tell client tool started
              await writer.write(encoder.encode(JSON.stringify({ 
                type: 'tool_call', 
                toolCallId: tc.name, // Usually we have an ID, Gemini might not provide one natively, using name
                toolName: tc.name, 
                args: tc.args 
              }) + '\n'));

              try {
                const result = await toolFn.execute(tc.args);
                toolResults.push({
                   functionResponse: { name: tc.name, response: result }
                });
                
                // Tell client tool result
                await writer.write(encoder.encode(JSON.stringify({ 
                  type: 'tool_result', 
                  toolCallId: tc.name, 
                  toolName: tc.name, 
                  result 
                }) + '\n'));
              } catch (err: any) {
                const errorObj = { error: err.message || 'Tool failed' };
                toolResults.push({
                   functionResponse: { name: tc.name, response: errorObj }
                });
                await writer.write(encoder.encode(JSON.stringify({ 
                  type: 'tool_result', 
                  toolCallId: tc.name, 
                  toolName: tc.name, 
                  result: errorObj 
                }) + '\n'));
              }
            }
          }

          // Append tool results to messages and continue loop
          currentMessages.push({
             role: 'user', // Tool results are provided by the user/system role
             parts: toolResults
          });
        }
        await writer.close();
      } catch (err: any) {
        console.error("Stream generation error:", err);
        await writer.write(encoder.encode(JSON.stringify({ type: 'error', message: err.message }) + '\n'));
        await writer.close();
      }
    })();

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
