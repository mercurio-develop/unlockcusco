import { useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTrip } from "@/lib/store/trip-context";
import { usePreferences } from "@/lib/store/preferences-context";

export function useChatAutoPrompt(sendMessage: (msg: { text: string }) => void) {
  const { setIsChatOpen } = usePreferences();
  const { aiPromptToTrigger, setAiPromptToTrigger } = useTrip();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const processedPromptsRef = useRef<Set<string>>(new Set());

  // Handle global state trigger
  useEffect(() => {
    if (aiPromptToTrigger) {
      sendMessage({ text: aiPromptToTrigger });
      setAiPromptToTrigger(null);
    }
  }, [aiPromptToTrigger, sendMessage, setAiPromptToTrigger]);

  // Handle URL params trigger
  useEffect(() => {
    const aiPrompt = searchParams.get("ai_prompt");
    const data = searchParams.get("data");

    if (aiPrompt && !processedPromptsRef.current.has(aiPrompt + (data || ""))) {
      processedPromptsRef.current.add(aiPrompt + (data || ""));
      setIsChatOpen(true);

      let promptText = aiPrompt;
      if (aiPrompt === "macro_trip" && data) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(data));
          promptText = `I have completed the Journey Designer. Here is my profile:\nDates: ${parsedData.dates?.start} to ${parsedData.dates?.end}\nTravelers: ${parsedData.pax}\nExertion Profile: ${parsedData.exertionProfile}\nLenses of Discovery: ${parsedData.lenses?.join(', ')}\nAutonomy Ratio: ${parsedData.autonomy}\nNeeds Hotels: ${parsedData.needsHotels ? 'Yes' : 'No'}\nPlease generate my macro trip plan.`;
        } catch (e) { console.error("Failed to parse journey designer data", e); }
      }

      setTimeout(() => sendMessage({ text: promptText }), 300);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("ai_prompt");
      params.delete("data");
      const newSearch = params.toString();
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, sendMessage, setIsChatOpen]);
}
