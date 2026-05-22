import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUiStore } from "@/lib/store/use-ui-store";
import { useItineraryStore } from "@/lib/store/use-itinerary-store";
import { buildChatPayload } from "../utils/chat-payload";
import type { OptimizedPlan } from '@/lib/ai/schemas/planner-schema';

export function useChatLocation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chatSendMessage: (message: { text: string }, options?: { body: any }) => void,
  targetDate: Date | null,
  activeItinerary: OptimizedPlan | null
) {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const searchParams = useSearchParams();
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const setPanelMode = useUiStore(s => s.setPanelMode);
  const travelVibe = useUiStore(s => s.travelVibe);
  const travelIntensity = useUiStore(s => s.travelIntensity);

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
        
        chatSendMessage(
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

  return { userCoords, handleShareLocation };
}
