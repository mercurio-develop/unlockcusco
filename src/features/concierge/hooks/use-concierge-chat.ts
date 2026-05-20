import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useChat } from '@ai-sdk/react';
import { useTrip } from "@/lib/store/trip-context";
import { usePreferences } from "@/lib/store/preferences-context";
import { getInitialMessages } from "../constants";
import { buildChatPayload, formatItineraryState } from "../utils/chat-payload";
import { DEFAULT_COORDS } from "@/lib/constants";

export function useConciergeChat() {
  const { isChatOpen, setIsChatOpen, travelVibe, travelIntensity, targetDate } = usePreferences();
  const { 
    panelMode, aiPromptToTrigger, setAiPromptToTrigger, activeItinerary,
    setActiveItinerary, setStartAnchorLocation, updateEndAnchorLocation,
    setPanelMode, moveWaypoint, clearStartAnchor, clearEndAnchor,
    setLegTransportProfile, removeWaypoint, swapWaypoint, insertWaypoint,
    setMapSearchResults
  } = useTrip();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const processedToolCalls = useRef<Set<string>>(new Set());
  const processedPromptsRef = useRef<Set<string>>(new Set());

  const isEs = pathname?.split('/')[1] === 'es';
  const initialMessages = useMemo(() => getInitialMessages(isEs), [isEs]);

  const [input, setInput] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const chat = useChat({
    api: '/api/chat',
    messages: initialMessages as any,
    body: {
      userLat: userCoords?.lat,
      userLng: userCoords?.lng,
      archetype: travelVibe,
      intensity: travelIntensity,
      itineraryState: formatItineraryState(activeItinerary)
    }
  } as any);

  const messages = chat.messages || [];
  const status = (chat as any).status || 'ready';
  const isLoading = status === 'submitted' || status === 'streaming';

  const sendMessage = useMemo(() => (msg: { text: string }) => {
    (chat as any).sendMessage({ text: msg.text }, {
      body: buildChatPayload({
        userCoords, travelVibe, travelIntensity, targetDate, activeItinerary
      })
    });
  }, [chat, userCoords, travelVibe, travelIntensity, targetDate, activeItinerary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setStartAnchorLocation(latitude, longitude);
        setPanelMode('itinerary');
        (chat as any).sendMessage(
          { text: `I just shared my GPS location. I am at coordinates ${latitude.toFixed(5)}, ${longitude.toFixed(5)}. What can you recommend nearby?` },
          {
            body: buildChatPayload({
              userCoords: { lat: latitude, lng: longitude },
              travelVibe, travelIntensity, targetDate, activeItinerary,
              activeFilters: {
                location: searchParams.get("loc"),
                category: searchParams.get("cat")
              }
            })
          }
        );
      },
      () => alert("Unable to retrieve your location. Please check permissions.")
    );
  };

  useEffect(() => {
    if (aiPromptToTrigger) {
      sendMessage({ text: aiPromptToTrigger });
      setAiPromptToTrigger(null);
    }
  }, [aiPromptToTrigger, sendMessage, setAiPromptToTrigger]);

  useEffect(() => {
    try {
      messages.forEach((msg: any) => {
        if (!msg || msg.role !== 'assistant') return;
        const toolParts = msg.parts?.filter((p: any) => p?.type?.startsWith('tool-') || p?.type === 'dynamic-tool') 
          || (msg.toolInvocations || []).filter((ti: any) => ti != null).map((ti: any) => ({ 
               type: 'tool-invocation', toolInvocation: ti, 
               state: ti?.state === 'result' ? 'output-available' : undefined, 
               output: ti?.result, toolCallId: ti?.toolCallId, toolName: ti?.toolName 
             })) || [];

        toolParts.forEach((p: any) => {
          if (!p || p?.state !== 'output-available') return;
          if (processedToolCalls.current.has(p.toolCallId)) return;

          const toolName = p.toolName || p.type?.replace(/^tool-/, '');
          const output = p.output;

          if (toolName === 'buildItinerary' && output && !output.error) {
            setActiveItinerary(output);
            setPanelMode('itinerary');
            processedToolCalls.current.add(p.toolCallId);
            return;
          }

          if (toolName === 'searchDatabase' && output && !output.error) {
            const list = Array.isArray(output) ? output : (output.alternatives || []);
            if (list.length > 0) {
              const withFlag = list.map((b: any) => ({ ...b, isConciergeResult: true }));
              setMapSearchResults(withFlag);
            }
          }

          if (toolName !== 'mutateItinerary' || !output?.success) return;
          const { action, targetId, resolvedBusiness, resolvedLocation, coords, time, direction, transportProfile, legIndex } = output;

          if (action === 'SWAP_STOP' && targetId && resolvedBusiness) swapWaypoint(targetId, resolvedBusiness as any);
          if (action === 'ADD_WAYPOINT' && resolvedBusiness) insertWaypoint(resolvedBusiness as any, true);
          if (action === 'SET_START') {
            setStartAnchorLocation(
              coords?.lat || resolvedBusiness?.lat || DEFAULT_COORDS.lat,
              coords?.lng || resolvedBusiness?.lng || DEFAULT_COORDS.lng,
              resolvedLocation || resolvedBusiness?.name || 'Current Location',
              resolvedBusiness as any, true
            );
            setPanelMode('itinerary');
          }
          if (action === 'SET_END') {
            updateEndAnchorLocation(
              coords?.lat || resolvedBusiness?.lat || DEFAULT_COORDS.lat,
              coords?.lng || resolvedBusiness?.lng || DEFAULT_COORDS.lng,
              resolvedLocation || resolvedBusiness?.name || 'Destination',
              resolvedBusiness as any, true
            );
            setPanelMode('itinerary');
          }
          if (action === 'REMOVE_WAYPOINT' && targetId) removeWaypoint(targetId);
          if (action === 'MOVE_WAYPOINT' && targetId && direction) moveWaypoint(targetId, direction);
          if (action === 'CLEAR_START') clearStartAnchor();
          if (action === 'CLEAR_END') clearEndAnchor();
          if (action === 'SET_TRANSPORT_PROFILE' && legIndex !== undefined && transportProfile) setLegTransportProfile(legIndex, transportProfile);
          if (action === 'UPDATE_TIME' && targetId && time) {
            setActiveItinerary(prev => {
              if (!prev) return prev;
              if (targetId === 'itin-start') return { ...prev, startAnchor: { ...prev.startAnchor, time } };
              else if (targetId === 'itin-arrival') return { ...prev, endAnchor: { ...prev.endAnchor, time } };
              else {
                const updatedWaypoints = prev.waypoints.map((w: any) => w.id === targetId ? { ...w, startTime: time } : w);
                return { ...prev, waypoints: updatedWaypoints };
              }
            });
          }
          processedToolCalls.current.add(p.toolCallId);
        });
      });
    } catch (e) { console.error("Tool sync error:", e); }
  }, [messages, activeItinerary, setActiveItinerary, userCoords, setPanelMode, moveWaypoint, clearStartAnchor, clearEndAnchor, setLegTransportProfile, insertWaypoint, swapWaypoint, removeWaypoint, setStartAnchorLocation, updateEndAnchorLocation, setMapSearchResults]);

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
  }, [searchParams, travelVibe, travelIntensity, pathname, router, targetDate, sendMessage, setIsChatOpen]);

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