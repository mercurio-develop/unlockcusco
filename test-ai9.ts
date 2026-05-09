import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { toolsRegistry } from './src/lib/ai/tools/registry';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  const result = await generateText({
    model: google('gemini-2.5-pro'),
    messages: [{ role: 'user', content: 'Build me an itinerary in Cusco starting with some coffee and a walk. My location is Plaza de Armas, Cusco. USE THE buildItinerary TOOL NOW!' }],
    tools: toolsRegistry as any,
    maxSteps: 5,
  });
  console.log("FINAL TEXT:", result.text);
  console.log(JSON.stringify(result.steps.map(s => ({ toolCalls: s.toolCalls.map(t => t.toolName) })), null, 2));
}
run();
