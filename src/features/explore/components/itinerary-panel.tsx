"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useItinerary } from "@/lib/store/itinerary-context";
import { MapPin, ChevronRight, Loader2, Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BuilderWorkspace } from "@/features/pro-builder/components/BuilderWorkspace";
import { BookingProgressView } from "@/features/explore/components/trip/BookingProgressView";

export function ItineraryPanel() {
  const { 
    activeItinerary, 
    setPanelMode, 
    macroTrip, 
    activeDayNumber,
    setActiveDayNumber, 
    setActiveItinerary, 
    bookingStatus, 
    startBookingOrchestration,
    currentTrip,
    createDay,
    selectedId,
    setSelectedId,
    setIsChatOpen
  } = useItinerary();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentDay = Number(searchParams.get("day") || "1");
  const isAILoading = searchParams.has("ai_prompt");
  const isBooking = bookingStatus !== 'idle';

  const handleDaySwitch = (dayNum: number) => {
    if (dayNum === currentDay) return;
    
    const day = macroTrip?.days?.find((d: any) => d.dayNumber === dayNum);
    if (!day) return;

    setActiveDayNumber(dayNum);
    setActiveItinerary(null); // Clear to show loading/avoid overlap
    
    const prompt = `Day ${day.dayNumber} Plan: I'm in ${day.sleepTown}, focusing on ${day.documentaryChapterTitle}. Build my micro-itinerary following the 1-2-1 rhythm.`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("ai_prompt", prompt);
    params.set("day", dayNum.toString());
    router.push(`/explore?${params.toString()}`);
  };

  if (!activeItinerary && !isAILoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse" />
          <div className="relative bg-white p-6 rounded-full shadow-sm border border-slate-50">
            <Calendar className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="text-2xl font-serif tracking-tight text-slate-900 mb-3">Your Expedition is Empty</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Start building your perfect day! Add experiences from the <strong>Discover</strong> tab or ask our <strong>AI Concierge</strong> to curate a personalized route for you.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button
            onClick={() => setPanelMode("categories")}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            Go to Discover
          </button>
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full bg-white text-rose-600 border border-rose-100 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm hover:bg-rose-50 transition-all"
          >
            Ask Concierge
          </button>
        </div>
      </div>
    );
  }

  const totalCost = activeItinerary?.totalCost ?? 0;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
      {isBooking ? (
        <BookingProgressView />
      ) : (
        <>
          {/* Header */}
          <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {macroTrip ? (
                <button 
                  onClick={() => setPanelMode("macro")}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-widest"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Trip Plan
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Live Plan</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-serif font-semibold text-slate-900 truncate">
                  {activeItinerary?.title ?? (isAILoading ? "Curation in progress..." : "Your Expedition")}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md">DAY {currentDay}</span>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Explorer View</span>
                </div>
              </div>
              
              {macroTrip && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {macroTrip.days.map((d: any) => (
                    <button
                      key={d.dayNumber}
                      onClick={() => handleDaySwitch(d.dayNumber)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-[11px] font-bold transition-all",
                        d.dayNumber === currentDay 
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {d.dayNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/30">
            {isAILoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse scale-150" />
                  <div className="relative w-16 h-16 rounded-2xl bg-white border border-rose-100 shadow-xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
                  </div>
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Curating Day {currentDay}</h3>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                  Our concierge is weaving local expertise into your personal route. Just a moment...
                </p>
              </div>
            ) : (
              <BuilderWorkspace variant="live" selectedId={selectedId} onSelectEvent={setSelectedId} />
            )}
          </div>

          {/* Footer total */}
          {!isAILoading && activeItinerary && (
            <div className="px-6 py-5 bg-white border-t border-gray-200 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Estimated Budget</p>
                  <p className="text-2xl font-bold text-slate-900">${totalCost}</p>
                </div>
                <button 
                  onClick={startBookingOrchestration}
                  className="bg-rose-600 text-white rounded-xl px-6 py-3 text-sm font-bold hover:bg-rose-500 transition-all shadow-md active:scale-95"
                >
                  Book All Stops
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
