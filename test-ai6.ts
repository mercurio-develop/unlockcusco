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
    model: google('gemini-2.5-flash'),
    messages: [{ role: 'user', content: 'Search the database for "coffee" in Cusco' }],
    tools: toolsRegistry as any,
    maxSteps: 5,
  });
  console.log("FINAL:", result.text);
  console.log(JSON.stringify(result.steps.map(s => s.toolResults), null, 2));
}
run();
