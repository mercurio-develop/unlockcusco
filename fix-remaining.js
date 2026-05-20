const fs = require('fs');

function updateAiConcierge() {
    const file = 'src/features/concierge/components/ai-concierge.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /import\s+{\s*usePreferences\s*}\s*from\s*"@\/lib\/store\/preferences-context"/g,
        'import { useUiStore } from "@/lib/store/use-ui-store"'
    );
    fs.writeFileSync(file, content);
}

function updateBusinessCard() {
    const file = 'src/features/discovery/components/business-card.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /import\s+{\s*useTrip\s*}\s*from\s*"@\/lib\/store\/trip-context"/g,
        'import { useUiStore } from "@/lib/store/use-ui-store"\nimport { useItineraryStore } from "@/lib/store/use-itinerary-store"'
    );
    content = content.replace(
        /import\s+{\s*usePreferences\s*}\s*from\s*"@\/lib\/store\/preferences-context"/g,
        ''
    );
    const useTripRegex = /const\s+{\s*activeItinerary,[\s\S]*?setSelectedId\s*}\s*=\s*useTrip\(\)\n\s*const\s+{\s*setMobileViewMode,\s*setIsChatOpen,\s*conciergeSendMessage\s*}\s*=\s*usePreferences\(\)/;
    const newContext = `const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const swapWaypoint = useItineraryStore(s => s.swapWaypoint);
  const insertWaypoint = useItineraryStore(s => s.insertWaypoint);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);

  const panelMode = useUiStore(s => s.panelMode);
  const setPanelMode = useUiStore(s => s.setPanelMode);
  const exchangeTargetId = useUiStore(s => s.exchangeTargetId);
  const setExchangeTargetId = useUiStore(s => s.setExchangeTargetId);
  const isExchangingStart = useUiStore(s => s.isExchangingStart);
  const setIsExchangingStart = useUiStore(s => s.setIsExchangingStart);
  const isExchangingEnd = useUiStore(s => s.isExchangingEnd);
  const setIsExchangingEnd = useUiStore(s => s.setIsExchangingEnd);
  const setSelectedId = useUiStore(s => s.setSelectedId);
  const setIsChatOpen = useUiStore(s => s.setIsChatOpen);
  const conciergeSendMessage = useUiStore(s => s.conciergeSendMessage);
  const setMobileViewMode = useUiStore(s => s.setMobileViewMode);`;
    content = content.replace(useTripRegex, newContext);
    fs.writeFileSync(file, content);
}

function updateExploreMap() {
    const file = 'src/features/discovery/components/explore-map.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /import\s+{\s*useTrip\s*}\s*from\s*"@\/lib\/store\/trip-context"/g,
        'import { useUiStore } from "@/lib/store/use-ui-store"\nimport { useItineraryStore } from "@/lib/store/use-itinerary-store"\nimport { useMapboxRoute } from "@/features/discovery/hooks/use-mapbox-route"'
    );
    content = content.replace(
        /import\s+{\s*usePreferences\s*}\s*from\s*"@\/lib\/store\/preferences-context"/g,
        ''
    );
    const useTripRegex = /const\s+{\s*activeItinerary,\s*panelMode:\s*strictPanelMode,\s*setPanelMode,\s*setStartAnchorLocation,\s*updateEndAnchorLocation,\s*insertWaypoint,\s*routeData,\s*setMapClickMode,\s*setMapSearchResults\s*}\s*=\s*useTrip\(\)\n\s*const\s*panelMode\s*=\s*strictPanelMode\s*as\s*string;\n\s*const\s+{\s*isChatOpen,\s*conciergeSendMessage\s*}\s*=\s*usePreferences\(\)/;
    const newContext = `const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);
  const insertWaypoint = useItineraryStore(s => s.insertWaypoint);

  const strictPanelMode = useUiStore(s => s.panelMode);
  const setPanelMode = useUiStore(s => s.setPanelMode);
  const setMapClickMode = useUiStore(s => s.setMapClickMode);
  const setMapSearchResults = useUiStore(s => s.setMapSearchResults);
  const isChatOpen = useUiStore(s => s.isChatOpen);
  const conciergeSendMessage = useUiStore(s => s.conciergeSendMessage);

  const { routeData } = useMapboxRoute();
  const panelMode = strictPanelMode as string;`;
    content = content.replace(useTripRegex, newContext);
    fs.writeFileSync(file, content);
}

function updateExplorePanel() {
    const file = 'src/features/discovery/components/explore-panel.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /import\s+{\s*useTrip\s*}\s*from\s*"@\/lib\/store\/trip-context"/g,
        'import { useUiStore } from "@/lib/store/use-ui-store"'
    );
    const useTripRegex = /const\s+{\s*isAddingStop,\s*setIsAddingStop,\s*exchangeTargetId,\s*setExchangeTargetId,\s*isExchangingStart,\s*setIsExchangingStart,\s*isExchangingEnd,\s*setIsExchangingEnd,\s*setPanelMode\s*}\s*=\s*useTrip\(\)/;
    const newContext = `const isAddingStop = useUiStore(s => s.isAddingStop);
  const setIsAddingStop = useUiStore(s => s.setIsAddingStop);
  const exchangeTargetId = useUiStore(s => s.exchangeTargetId);
  const setExchangeTargetId = useUiStore(s => s.setExchangeTargetId);
  const isExchangingStart = useUiStore(s => s.isExchangingStart);
  const setIsExchangingStart = useUiStore(s => s.setIsExchangingStart);
  const isExchangingEnd = useUiStore(s => s.isExchangingEnd);
  const setIsExchangingEnd = useUiStore(s => s.setIsExchangingEnd);
  const setPanelMode = useUiStore(s => s.setPanelMode);`;
    content = content.replace(useTripRegex, newContext);
    fs.writeFileSync(file, content);
}

function updateExploreView() {
    const file = 'src/features/discovery/components/explore-view.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /import\s+{\s*useTrip\s*}\s*from\s*"@\/lib\/store\/trip-context"/g,
        'import { useUiStore } from "@/lib/store/use-ui-store"\nimport { useItineraryStore } from "@/lib/store/use-itinerary-store"'
    );
    content = content.replace(
        /import\s+{\s*usePreferences\s*}\s*from\s*"@\/lib\/store\/preferences-context"/g,
        ''
    );
    const useTripRegex = /const\s+{\s*panelMode,\s*setPanelMode,\s*selectedId,\s*setSelectedId,\s*mapClickMode,\s*setMapClickMode,\s*updateEndAnchorLocation,\s*setStartAnchorLocation,\s*mapSearchResults,\s*activeItinerary,\s*setActiveItinerary\s*}\s*=\s*useTrip\(\)\n\s*const\s+{\s*isChatOpen,\s*setIsChatOpen,\s*conciergeSendMessage\s*}\s*=\s*usePreferences\(\)/;
    const newContext = `const panelMode = useUiStore(s => s.panelMode);
  const setPanelMode = useUiStore(s => s.setPanelMode);
  const selectedId = useUiStore(s => s.selectedId);
  const setSelectedId = useUiStore(s => s.setSelectedId);
  const mapClickMode = useUiStore(s => s.mapClickMode);
  const setMapClickMode = useUiStore(s => s.setMapClickMode);
  const mapSearchResults = useUiStore(s => s.mapSearchResults);
  const isChatOpen = useUiStore(s => s.isChatOpen);
  const setIsChatOpen = useUiStore(s => s.setIsChatOpen);
  const conciergeSendMessage = useUiStore(s => s.conciergeSendMessage);

  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const setActiveItinerary = useItineraryStore(s => s.setActiveItinerary);`;
    content = content.replace(useTripRegex, newContext);
    fs.writeFileSync(file, content);
}

function updateItineraryPanel() {
    const file = 'src/features/discovery/components/itinerary-panel.tsx';
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /import\s+{\s*useTrip\s*}\s*from\s*"@\/lib\/store\/trip-context"/g,
        'import { useUiStore } from "@/lib/store/use-ui-store"\nimport { useItineraryStore } from "@/lib/store/use-itinerary-store"\nimport { useMapboxRoute, type RouteData } from "@/features/discovery/hooks/use-mapbox-route"\nimport { useCallback } from "react"\nimport { saveItineraryAction } from "@/features/itinerary/actions/save-itinerary"'
    );
    content = content.replace(
        /import\s+{\s*usePreferences\s*}\s*from\s*"@\/lib\/store\/preferences-context";\n/g,
        ''
    );
    content = content.replace(
        /import\s+type\s+{\s*RouteData,\s*TransportProfile\s*}\s*from\s*"@\/lib\/store\/trip-context";/g,
        'import type { TransportProfile } from "@/lib/store/use-itinerary-store";'
    );
    
    const useTripRegex = /const\s+{\s*activeItinerary,[\s\S]*?saveItinerary,\s*}\s*=\s*useTrip\(\);\n\s*const\s+{\s*setIsChatOpen,\s*conciergeSendMessage\s*}\s*=\s*usePreferences\(\);/;
    const newContext = `const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);
  const removeWaypoint = useItineraryStore(s => s.removeWaypoint);
  const moveWaypoint = useItineraryStore(s => s.moveWaypoint);
  const setWaypoints = useItineraryStore(s => s.setWaypoints);
  const clearStartAnchor = useItineraryStore(s => s.clearStartAnchor);
  const clearEndAnchor = useItineraryStore(s => s.clearEndAnchor);
  const transportProfiles = useItineraryStore(s => s.transportProfiles);
  const setLegTransportProfile = useItineraryStore(s => s.setLegTransportProfile);

  const panelMode = useUiStore(s => s.panelMode);
  const setPanelMode = useUiStore(s => s.setPanelMode);
  const selectedId = useUiStore(s => s.selectedId);
  const setSelectedId = useUiStore(s => s.setSelectedId);
  const exchangeTargetId = useUiStore(s => s.exchangeTargetId);
  const setExchangeTargetId = useUiStore(s => s.setExchangeTargetId);
  const isExchangingStart = useUiStore(s => s.isExchangingStart);
  const setIsExchangingStart = useUiStore(s => s.setIsExchangingStart);
  const isExchangingEnd = useUiStore(s => s.isExchangingEnd);
  const setIsExchangingEnd = useUiStore(s => s.setIsExchangingEnd);
  const isAddingStop = useUiStore(s => s.isAddingStop);
  const setIsAddingStop = useUiStore(s => s.setIsAddingStop);
  const mapClickMode = useUiStore(s => s.mapClickMode);
  const setMapClickMode = useUiStore(s => s.setMapClickMode);
  const setIsChatOpen = useUiStore(s => s.setIsChatOpen);
  const conciergeSendMessage = useUiStore(s => s.conciergeSendMessage);

  const { routeData } = useMapboxRoute();

  const saveItinerary = useCallback(async () => {
    if (!activeItinerary) return null;
    try {
      const data = await saveItineraryAction(activeItinerary);
      if (data.success && data.shortId) {
        const url = new URL(window.location.href);
        url.searchParams.set('trip', data.shortId);
        window.history.replaceState({}, '', url.toString());
        return url.toString();
      }
    } catch (e) {
      console.error("Failed to save itinerary:", e);
    }
    return null;
  }, [activeItinerary]);`;
    content = content.replace(useTripRegex, newContext);
    fs.writeFileSync(file, content);
}

updateAiConcierge();
updateBusinessCard();
updateExploreMap();
updateExplorePanel();
updateExploreView();
updateItineraryPanel();
