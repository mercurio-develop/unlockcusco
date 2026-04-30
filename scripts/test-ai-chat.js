import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';
import { findLocalExperiences } from '../src/lib/ai/tools/local-experiences';
import { buildSpatialItinerary } from '../src/lib/ai/tools/itinerary-builder';
import { estimateTaxiFare } from '../src/lib/ai/tools/taxi-estimator';
import { buildChronoRelay } from '../src/lib/ai/tools/chrono-relay';
import { askAvailability } from '../src/lib/ai/tools/ask-availability';
import * as dotenv from 'dotenv';
dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
});

const tools = {
  findLocalExperiences,
  buildSpatialItinerary,
  estimateTaxiFare,
  buildChronoRelay,
  askAvailability,
};

async function testPrompt(prompt) {
  console.log(`\n\n--- Testing Prompt: "${prompt}" ---`);
  try {
    const result = await generateText({
      model: google('gemini-2.5-pro'),
      system: `You are the Vallecito Concierge. Current time: 12:00 PM. User coords: -13.3047, -72.1167. NEVER output outbound WhatsApp links. ALWAYS use tools to render Generative UI components. For complex journeys, use buildChronoRelay to offer a complete relay sequence (food + transit + stay). CRITICAL: If the user asks for a relay/taxi but does not state their current location, you MUST ask "Where are you currently located?" before calling the tools. Use findLocalExperiences to recommend specific spots. Use buildSpatialItinerary for multi-stop plans.`,
      prompt: prompt,
      tools: tools,
      maxSteps: 3
    });
    
    console.log("Text Response:", result.text);
    if (result.toolCalls && result.toolCalls.length > 0) {
      console.log("Tools Called:");
      result.toolCalls.forEach(call => {
        console.log(call);
      });
      if (result.toolResults && result.toolResults.length > 0) {
        console.log("Tool Results:");
        result.toolResults.forEach(res => {
          console.log(res);
        });
      }
    }
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

async function runAll() {
  await testPrompt("Coffee in Urubamba and after that I would like to go to Ollantaytambo");
  await testPrompt("I need a taxi from Urubamba to Pisac");
  console.log("\nDone.");
}

runAll();