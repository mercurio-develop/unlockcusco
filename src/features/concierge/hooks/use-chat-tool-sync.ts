/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useUiStore } from "@/lib/store/use-ui-store";
import { useItineraryStore } from "@/lib/store/use-itinerary-store";
import { DEFAULT_COORDS } from "@/lib/constants";

 
export function useChatToolSync(messages: any[]) {
  const setPanelMode = useUiStore(s => s.setPanelMode);
  const setMapSearchResults = useUiStore(s => s.setMapSearchResults);
  
  const activeItinerary = useItineraryStore(s => s.activeItinerary);
  const setActiveItinerary = useItineraryStore(s => s.setActiveItinerary);
  const setStartAnchorLocation = useItineraryStore(s => s.setStartAnchorLocation);
  const updateEndAnchorLocation = useItineraryStore(s => s.updateEndAnchorLocation);
  const moveWaypoint = useItineraryStore(s => s.moveWaypoint);
  const clearStartAnchor = useItineraryStore(s => s.clearStartAnchor);
  const clearEndAnchor = useItineraryStore(s => s.clearEndAnchor);
  const setLegTransportProfile = useItineraryStore(s => s.setLegTransportProfile);
  const removeWaypoint = useItineraryStore(s => s.removeWaypoint);
  const swapWaypoint = useItineraryStore(s => s.swapWaypoint);
  const insertWaypoint = useItineraryStore(s => s.insertWaypoint);
  const undoItinerary = useItineraryStore(s => s.undoItinerary);
  const redoItinerary = useItineraryStore(s => s.redoItinerary);

  const processedToolCalls = useRef<Set<string>>(new Set());

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
             
            setPanelMode('itinerary' as any);
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
           
          if (action === 'ADD_WAYPOINT' && resolvedBusiness) insertWaypoint(resolvedBusiness as any);
          if (action === 'SET_START') {
            setStartAnchorLocation(
              coords?.lat || resolvedBusiness?.lat || DEFAULT_COORDS.lat,
              coords?.lng || resolvedBusiness?.lng || DEFAULT_COORDS.lng,
              resolvedLocation || resolvedBusiness?.name || 'Current Location',
               
              resolvedBusiness as any
            );
             
            setPanelMode('itinerary' as any);
          }
          if (action === 'SET_END') {
            updateEndAnchorLocation(
              coords?.lat || resolvedBusiness?.lat || DEFAULT_COORDS.lat,
              coords?.lng || resolvedBusiness?.lng || DEFAULT_COORDS.lng,
              resolvedLocation || resolvedBusiness?.name || 'Destination',
               
              resolvedBusiness as any
            );
             
            setPanelMode('itinerary' as any);
          }
          if (action === 'REMOVE_WAYPOINT' && targetId) removeWaypoint(targetId);
          if (action === 'MOVE_WAYPOINT' && targetId && direction) moveWaypoint(targetId, direction);
          if (action === 'CLEAR_START') clearStartAnchor();
          if (action === 'CLEAR_END') clearEndAnchor();
          if (action === 'UNDO') undoItinerary();
          if (action === 'REDO') redoItinerary();
           
          if (action === 'SET_TRANSPORT_PROFILE' && legIndex !== undefined && transportProfile) setLegTransportProfile(legIndex, transportProfile as any);
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
  }, [messages, activeItinerary, setActiveItinerary, setPanelMode, moveWaypoint, clearStartAnchor, clearEndAnchor, setLegTransportProfile, insertWaypoint, swapWaypoint, removeWaypoint, setStartAnchorLocation, updateEndAnchorLocation, setMapSearchResults, undoItinerary, redoItinerary]);
}
