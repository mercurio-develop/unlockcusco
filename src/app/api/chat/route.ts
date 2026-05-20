import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { processChatStream } from "@/features/concierge/services/chat-service";

export const maxDuration = 60;

const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1h"),
      analytics: true,
      prefix: "@upstash/ratelimit/unlockcusco-chat",
    })
  : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format." }), { status: 400 });
    }

    if (ratelimit) {
      // Basic IP-based rate limiting (fallback to a default string if ip is undefined)
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      
      if (!success) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
      }
    }

    const result = await processChatStream(messages, body);
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("Error in AI Chat Route:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
  }
}
