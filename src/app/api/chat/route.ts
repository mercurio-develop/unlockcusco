import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { buildItinerary } from '@/lib/ai/tools/build-itinerary';
import { askAvailability } from '@/lib/ai/tools/ask-availability';
import { searchDatabase } from '@/lib/ai/tools/search-database';
import { buildMacroTrip } from '@/lib/ai/tools/build-macro-trip';
import { showBoletoInfo } from '@/lib/ai/tools/show-boleto-info';
import { estimateTaxiFare } from '@/lib/ai/tools/taxi-estimator';
import { SYSTEM_PROMPT_CONCIERGE } from '@/lib/ai/prompts';
import { PSYCHOGRAPHIC_MATRIX } from '@/lib/trip/psychographic-matrix';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Helicone External Observability Integration
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
      baseURL: process.env.HELICONE_API_KEY ? 'https://gateway.helicone.ai/v1beta' : undefined,
      headers: process.env.HELICONE_API_KEY ? {
        'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
        'Helicone-Property-Session': 'concierge-chat'
      } : undefined
    });

    const { messages, userLat, userLng, localTime, archetype, intensity } = await req.json();
    console.log("=== INCOMING CHAT REQUEST ===");
    console.log("Local Time:", localTime, "Coords:", userLat, userLng, "Profile:", archetype, intensity);
    console.log("Messages Payload:", JSON.stringify(messages, null, 2));

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    // Normalize seeded messages that have content but no parts (e.g. the welcome message)
    const normalizedMessages = messages.map((msg: any) => {
      let content = msg.content;

      // Hidden instruction for the specific itinerary addition message
      if (msg.role === 'user' && content && content.startsWith('I just added') && content.includes('to my itinerary.')) {
        content += '\n\n[System Instruction: Acknowledge this addition and specifically ask the user: "I saw you added an experience to your Day itinerary. Do you want to set the start where you are? And do you have an idea where you will end this itinerary?"]';
      }

      if (!msg.parts && content) {
        return { ...msg, content, parts: [{ type: 'text', text: content }] };
      }
      
      // If parts exist but we modified the content, update the parts too
      if (msg.parts && content !== msg.content) {
          const newParts = [...msg.parts];
          if (newParts.length > 0 && newParts[newParts.length - 1].type === 'text') {
              newParts[newParts.length - 1].text = content;
          } else {
              newParts.push({ type: 'text', text: content });
          }
          return { ...msg, content, parts: newParts };
      }

      return msg;
    });

    let systemPrompt = SYSTEM_PROMPT_CONCIERGE
      .replace('{localTime}', localTime || 'unknown')
      .replace('{userLat}', userLat || 'unknown')
      .replace('{userLng}', userLng || 'unknown');

    if (archetype && intensity && PSYCHOGRAPHIC_MATRIX[archetype]?.[intensity]) {
      systemPrompt += `\n\n<PSYCHOGRAPHIC_PROFILE>\nThe user is a [${archetype}] traveler seeking Intensity Level [${intensity}]. YOU MUST STRICTLY ALIGN YOUR RECOMMENDATIONS AND TONE WITH THIS EXACT DEFINITION: "${PSYCHOGRAPHIC_MATRIX[archetype][intensity]}".\nDo not suggest Level 3 intensity items to a Level 1 user, and vice versa. Adjust your conversational personality to match their risk tolerance and desires.\n</PSYCHOGRAPHIC_PROFILE>`;
    }

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: systemPrompt,
      messages: await convertToModelMessages(normalizedMessages),
      tools: {
        buildItinerary,
        askAvailability,
        searchDatabase,
        buildMacroTrip,
        showBoletoInfo,
        estimateTaxiFare,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
