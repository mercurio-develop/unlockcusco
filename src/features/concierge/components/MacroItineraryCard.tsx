"use client"
import { Business } from "@prisma/client";
import { FullTrip } from "@/lib/types/trip";
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Sparkles, User, Sun, Moon, ArrowRight, Download, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useItinerary } from "@/lib/store/itinerary-context"
import { cn } from "@/lib/utils"

export function MacroItineraryCard({ itinerary, isExploreView = false }: { itinerary: FullTrip, isExploreView?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setPanelMode } = useItinerary()

  if (!itinerary) return null

  return (
    <Card className={cn(
      "w-full overflow-hidden transition-all duration-500",
      isExploreView 
        ? "max-w-none border-none shadow-none bg-transparent" 
        : "max-w-sm bg-white/95 backdrop-blur-xl border border-gray-100/50 shadow-xl mt-4"
    )}>
      {/* Cinematic Header */}
      <div className={cn(
        "bg-slate-900 p-8 text-white relative overflow-hidden",
        isExploreView ? "rounded-3xl mx-4 mt-4 shadow-2xl shadow-slate-900/20" : ""
      )}>
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-32 h-32 text-rose-500 animate-pulse" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-rose-500" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-rose-400 uppercase">Vallecito Expedition</span>
          </div>
          <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            {itinerary.tripTitle}
          </h3>
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">
            {(itinerary as any).narrativeArc}
          </p>
        </div>
      </div>

      <CardContent className={cn("p-0", isExploreView ? "px-6 pb-12" : "")}>
        {/* Basecamp Strategy Banner */}
        <div className="p-5 bg-indigo-50/50 border-y border-indigo-100/50 flex items-start gap-4 mt-6 rounded-2xl mx-4 mb-8 group hover:bg-indigo-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <Moon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-1">Basecamp Strategy</p>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{itinerary.baseCampStrategy}</p>
          </div>
        </div>

        {/* Graphical Day Map */}
        <div className="relative space-y-0">
          {/* Vertical Visual Line */}
          <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-slate-100 via-rose-200 to-slate-100 z-0" />

          {itinerary.days?.map((day: any, idx: number) => {
            const isArrival = day.dayNumber === 1;
            const isAcclimation = day.dayNumber <= 2;
            
            return (
              <div 
                key={day.dayNumber} 
                className={cn(
                  "group relative pl-20 pr-6 py-6 transition-all duration-300 hover:bg-white rounded-3xl mx-2 cursor-pointer",
                  isExploreView ? "" : "border-b border-gray-50 last:border-0"
                )}
                onClick={() => {
                  const targetLoc = day.sleepTown.toLowerCase()
                  const prompt = `Day ${day.dayNumber} Plan: I'm in ${day.sleepTown}, focusing on ${day.documentaryChapterTitle}. Build my micro-itinerary following the 1-2-1 rhythm.`
                  
                  if (isExploreView) {
                    setPanelMode("itinerary")
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("ai_prompt", prompt)
                    router.push(`/explore?${params.toString()}`)
                  } else {
                    window.location.href = `/explore?ai_prompt=${encodeURIComponent(prompt)}`;
                  }
                }}
              >
                {/* Day Marker */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                  <div className={cn(
                    "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all group-hover:scale-125 group-hover:shadow-lg",
                    isAcclimation 
                      ? "bg-emerald-500 border-white text-white shadow-emerald-200" 
                      : "bg-white border-slate-900 text-slate-900 shadow-slate-100"
                  )}>
                    {day.dayNumber}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isArrival ? "The Arrival" : `Chapter ${day.dayNumber}`}
                      </span>
                      {isAcclimation && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          Altitude Safe
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                      {day.suggestedTourSector}
                    </div>
                  </div>
                  
                  <h4 className="font-serif text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    {day.documentaryChapterTitle}
                  </h4>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Moon className="w-3.5 h-3.5" />
                      <span>{day.sleepTown}</span>
                    </div>
                    {day.expertOpportunity && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600/70 font-semibold italic">
                        <User className="w-3.5 h-3.5" />
                        <span>{day.expertOpportunity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Action Indicator */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <ChevronRight className="w-5 h-5 text-rose-500" />
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Footer Actions */}
        <div className={cn(
          "p-6 border-t border-gray-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4 mt-8",
          isExploreView ? "rounded-3xl border shadow-sm mx-4" : ""
        )}>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
             <Info className="w-4 h-4 text-rose-400" />
             Click any day to explore micro-stops and bookings.
          </div>
          <Button variant="outline" size="sm" className="w-full md:w-auto text-xs font-bold border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all rounded-full px-6" onClick={() => alert("PDF Export functionality will be available shortly.")}>
            <Download className="w-4 h-4 mr-2" /> Export Expedition Dossier
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
