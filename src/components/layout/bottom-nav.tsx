"use client"

import { usePathname, useRouter } from "next/navigation"
import { LayoutGrid, Map as RouteMap, CalendarDays, Sparkles, Home } from "lucide-react"
import { useConciergeUiStore } from "@/lib/store/use-concierge-ui-store"
import { usePanelStore } from "@/lib/store/use-panel-store"
import { useMapUiStore } from "@/lib/store/use-map-ui-store"
import { cn } from "@/lib/utils"
import { explorePath, homePath, parseLocale } from "@/paths"

export function BottomNav() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  
  const panelMode = usePanelStore(s => s.panelMode)
  const setPanelMode = usePanelStore(s => s.setPanelMode)
  const mobileViewMode = useMapUiStore(s => s.mobileViewMode)
  const setMobileViewMode = useMapUiStore(s => s.setMobileViewMode)
  const isChatOpen = useConciergeUiStore(s => s.isChatOpen)
  const setIsChatOpen = useConciergeUiStore(s => s.setIsChatOpen)

  const locale = parseLocale(pathname.split('/')[1])
  const exploreRootPath = explorePath(locale)
  const homeRoute = homePath(locale)
  const isExploreRoot = pathname === exploreRootPath
  const isHome = pathname === homeRoute || pathname === `${homeRoute}/` || pathname === '/'

  const navigateToExplore = () => {
    if (!isExploreRoot) {
      router.push(exploreRootPath);
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_14px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-1">
        <button 
          onClick={() => { setIsChatOpen(false); router.push(homeRoute); }}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isHome && !isChatOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => { setPanelMode('discover'); setMobileViewMode('list'); setIsChatOpen(false); navigateToExplore(); }}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isExploreRoot && panelMode === 'discover' && mobileViewMode === 'list' && !isChatOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Discover</span>
        </button>
        
        <button 
          onClick={() => { setMobileViewMode('map'); setIsChatOpen(false); navigateToExplore(); }}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isExploreRoot && mobileViewMode === 'map' && !isChatOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <RouteMap className="w-5 h-5" />
          <span className="text-[10px] font-medium">Map</span>
        </button>
        
        <button 
          onClick={() => { setPanelMode('itinerary'); setMobileViewMode('list'); setIsChatOpen(false); navigateToExplore(); }}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isExploreRoot && panelMode === 'itinerary' && mobileViewMode === 'list' && !isChatOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900")}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium">Itinerary</span>
        </button>
        
        <button 
          onClick={() => { 
            setMobileViewMode('map');
            if (!isExploreRoot) {
              setIsChatOpen(true);
              navigateToExplore();
            } else {
              setIsChatOpen(!isChatOpen);
            }
          }}
          className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative", isChatOpen ? "text-rose-600" : "text-slate-500 hover:text-slate-900")}
        >
          <Sparkles className={cn("w-5 h-5", isChatOpen ? "text-rose-600" : "text-slate-500")} />
          <span className="text-[10px] font-medium">Concierge</span>
        </button>
      </div>
    </div>
  )
}
