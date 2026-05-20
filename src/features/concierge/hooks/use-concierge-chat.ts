import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useChat } from '@ai-sdk/react';
import { useTrip } from "@/lib/store/trip-context";
import { usePreferences } from "@/lib/store/preferences-context";
import { getInitialMessages } from "../constants";
import { buildChatPayload, formatItineraryState } from "../utils/chat-payload";

import { useChatLocation } from "./use-chat-location";
import { useChatAutoPrompt } from "./use-chat-auto-prompt";
import { useChatToolSync } from "./use-chat-tool-sync";

export function useConciergeChat() {
  const { isChatOpen, setIsChatOpen, travelVibe, travelIntensity, targetDate } = usePreferences();
  const { activeItinerary } = useTrip();
  const pathname = usePathname();

  const isEs = pathname?.split('/')[1] === 'es';
  const initialMessages = useMemo(() => getInitialMessages(isEs), [isEs]);

  const [input, setInput] = useState("");

  const chat = useChat({
    api: '/api/chat',
    messages: initialMessages as any,
    body: {
      // NOTE: Initial coords are not provided until useChatLocation shares them.
      archetype: travelVibe,
      intensity: travelIntensity,
      itineraryState: formatItineraryState(activeItinerary)
    }
  } as any);

  const messages = chat.messages || [];
  const status = (chat as any).status || 'ready';
  const isLoading = status === 'submitted' || status === 'streaming';

  const { userCoords, handleShareLocation } = useChatLocation(
    (chat as any).sendMessage, 
    targetDate, 
    activeItinerary
  );

  const sendMessage = useMemo(() => (msg: { text: string }) => {
    (chat as any).sendMessage({ text: msg.text }, {
      body: buildChatPayload({
        userCoords, travelVibe, travelIntensity, targetDate, activeItinerary
      })
    });
  }, [chat, userCoords, travelVibe, travelIntensity, targetDate, activeItinerary]);

  // Handle URL and global state prompts
  useChatAutoPrompt(sendMessage);

  // Sync tool executions to map state
  useChatToolSync(messages);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return {
    isChatOpen,
    setIsChatOpen,
    pathname,
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    handleShareLocation,
    sendMessage
  };
}