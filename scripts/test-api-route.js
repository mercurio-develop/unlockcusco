import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
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

async function testMultiTurn() {
  const messages = [
    { id: '1', role: 'assistant', content: 'Welcome to Vallecito. ✨\n\nHow can I curate your day in the Sacred Valley?' },
    { id: '2', role: 'user', content: "I'm in Pisac and need to get to Ollantaytambo" },
    { id: '3', role: 'assistant', content: 'I can arrange that. Do you want to stop for food along the way, for example in Urubamba?' },
    { id: '4', role: 'user', content: 'sure' },
    { id: '5', role: 'user', content: 'I need a taxi from Urubamba to Pisac' }
  ];

  console.log("--- Testing Multi-Turn Chat ---");
  try {
    const normalizedMessages = messages.map(msg => {
      if (!msg.parts && msg.content) {
        return {
          ...msg,
          parts: [{ type: 'text', text: msg.content }]
        };
      }
      return msg;
    });

    const result = streamText({
      model: google('gemini-2.5-pro'),
      system: `You are the Vallecito Concierge...`,
      messages: await convertToModelMessages(normalizedMessages),
      tools: tools,
    });

    for await (const chunk of result.fullStream) {
      console.log(`[Chunk: ${chunk.type}]`);
      if (chunk.type === 'text-delta') {
        process.stdout.write(chunk.textDelta || "");
      } else if (chunk.type === 'tool-call') {
        console.log("\n[Tool Call]", JSON.stringify(chunk, null, 2));
      } else if (chunk.type === 'tool-result') {
        console.log("\n[Tool Result]", JSON.stringify(chunk, null, 2));
      } else if (chunk.type === 'error') {
        console.error("\n[Error]", chunk.error);
      }
    }
  } catch (err) {
    console.error("\nFAILED:", err);
  }
  console.log("\nDone.");
}

testMultiTurn();