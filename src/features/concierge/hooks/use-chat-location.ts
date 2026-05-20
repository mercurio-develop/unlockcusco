import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTrip } from "@/lib/store/trip-context";
import { usePreferences } from "@/lib/store/preferences-context";
import { buildChatPayload } from "../utils/chat-payload";

export function useChatLocation(
  chatSendMessage: (message: any, chatRequestOptions?: any) => void,
  targetDate: Date | null,
  activeItinerary: any
) {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const searchParams = useSearchParams();
  const { setStartAnchorLocation, setPanelMode } = useTrip();
  const { travelVibe, travelIntensity } = usePreferences();

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
