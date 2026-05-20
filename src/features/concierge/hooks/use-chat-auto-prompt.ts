import { useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { usePreferences } from "@/lib/store/preferences-context";

export function useChatAutoPrompt(
  sendMessage: (msg: { text: string }) => void,
  isChatOpen: boolean,
  chatStatus: string
) {
  const { setIsChatOpen } = usePreferences();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const processedPromptsRef = useRef<Set<string>>(new Set());
  const pendingPromptRef = useRef<string | null>(null);

  // 1. Detect URL params and set pending prompt
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

      pendingPromptRef.current = promptText;

      const params = new URLSearchParams(searchParams.toString());
      params.delete("ai_prompt");
      params.delete("data");
      const newSearch = params.toString();
      router.replace(newSearch ? `${pathname}?${newSearch}` : pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, setIsChatOpen]);

  // 2. Deterministic Execution: Send message when chat is actually ready
  useEffect(() => {
    if (pendingPromptRef.current && isChatOpen && chatStatus === 'ready') {
      sendMessage({ text: pendingPromptRef.current });
      pendingPromptRef.current = null;
    }
  }, [isChatOpen, chatStatus, sendMessage]);
}
