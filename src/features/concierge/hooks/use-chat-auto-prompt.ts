import { useEffect, useRef } from "react";
import { useQueryStates } from "nuqs";
import { searchParamsParsers } from "@/features/discovery/search-params";
import { useConciergeUiStore } from "@/lib/store/use-concierge-ui-store";

export function useChatAutoPrompt(
  sendMessage: (msg: { text: string }) => void,
  isChatOpen: boolean,
  chatStatus: string
) {
  const setIsChatOpen = useConciergeUiStore((s) => s.setIsChatOpen);
  const [, setParams] = useQueryStates(searchParamsParsers);

  const processedPromptsRef = useRef<Set<string>>(new Set());
  const pendingPromptRef = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aiPrompt = params.get("ai_prompt");
    const data = params.get("data");

    if (aiPrompt && !processedPromptsRef.current.has(aiPrompt + (data || ""))) {
      processedPromptsRef.current.add(aiPrompt + (data || ""));
      setIsChatOpen(true);

      let promptText = aiPrompt;
      if (aiPrompt === "macro_trip" && data) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(data));
          promptText = `I have completed the Journey Designer. Here is my profile:\nDates: ${parsedData.dates?.start} to ${parsedData.dates?.end}\nTravelers: ${parsedData.pax}\nExertion Profile: ${parsedData.exertionProfile}\nLenses of Discovery: ${parsedData.lenses?.join(", ")}\nAutonomy Ratio: ${parsedData.autonomy}\nNeeds Hotels: ${parsedData.needsHotels ? "Yes" : "No"}\nPlease generate my macro trip plan.`;
        } catch (e) {
          console.error("Failed to parse journey designer data", e);
        }
      }

      pendingPromptRef.current = promptText;
      setParams(
        { ai_prompt: null, data: null },
        { shallow: true, history: "replace", scroll: false }
      );
    }
  }, [setIsChatOpen, setParams]);

  useEffect(() => {
    if (pendingPromptRef.current && isChatOpen && chatStatus === "ready") {
      sendMessage({ text: pendingPromptRef.current });
      pendingPromptRef.current = null;
    }
  }, [isChatOpen, chatStatus, sendMessage]);
}
