/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChat } from '@ai-sdk/react';
import {
  useSelectionStore,
  useConciergeUiStore,
  useInteractionStore,
} from "@/lib/store/use-ui-store";
import { useItineraryStore } from "@/lib/store/use-itinerary-store";
import { getInitialMessages } from "../constants";
import { buildChatPayload, formatItineraryState } from "../utils/chat-payload";

import { useChatLocation } from "./use-chat-location";
import { useChatAutoPrompt } from "./use-chat-auto-prompt";
import { useChatToolSync } from "./use-chat-tool-sync";
import type { UIMessage } from "@ai-sdk/react";

export function useConciergeChat() {
  const isChatOpen = useConciergeUiStore(s => s.isChatOpen);
  const setIsChatOpen = useConciergeUiStore(s => s.setIsChatOpen);
  const travelVibe = useConciergeUiStore(s => s.travelVibe);
  const travelIntensity = useConciergeUiStore(s => s.travelIntensity);
  const targetDate = useConciergeUiStore(s => s.targetDate);
  const setConciergeSendMessage = useConciergeUiStore(s => s.setConciergeSendMessage);
  const selectedId = useSelectionStore(s => s.selectedId);
  const interactionHistory = useInteractionStore(s => s.interactionHistory);
  const activeItinerary = useItineraryStore(s => s.activeTab === 'primary' ? s.activeItinerary : s.secondaryItinerary);
  const pathname = usePathname();

  const isEs = pathname?.split('/')[1] === 'es';
  const initialMessages = useMemo(() => getInitialMessages(isEs), [isEs]);

  const [input, setInput] = useState("");

  const chat = useChat({
    messages: initialMessages as UIMessage[],
    body: {
      archetype: travelVibe,
      intensity: travelIntensity,
      itineraryState: formatItineraryState(activeItinerary),
      interactionHistory,
      currentlyViewing: interactionHistory.find(h => h.id === selectedId)?.name || selectedId
    }
   
  } as any);

  const messages = chat.messages || [];
  const status = chat.status || 'ready';
  const isLoading = status === 'submitted' || status === 'streaming';

  const { userCoords, handleShareLocation } = useChatLocation(
     
    (msg: any, opts: any) => chat.sendMessage(msg, opts), 
    targetDate, 
    activeItinerary
  );

  const sendMessage = useMemo(() => (msg: { text: string }) => {
    chat.sendMessage({ text: msg.text }, {
      body: buildChatPayload({
        userCoords, 
        travelVibe, 
        travelIntensity, 
        targetDate, 
        activeItinerary,
        interactionHistory,
        currentlyViewing: interactionHistory.find(h => h.id === selectedId)?.name || selectedId
      })
     
    } as any);
  }, [chat, userCoords, travelVibe, travelIntensity, targetDate, activeItinerary, interactionHistory, selectedId]);

  // Register the sendMessage function globally so other components can trigger it synchronously
  useEffect(() => {
    setConciergeSendMessage(() => sendMessage);
    return () => setConciergeSendMessage(null);
  }, [sendMessage, setConciergeSendMessage]);

  // Handle URL prompts deterministically
  useChatAutoPrompt(sendMessage, isChatOpen, status);

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
