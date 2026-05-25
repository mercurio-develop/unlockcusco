import { useRef, useState, useEffect, useCallback, ReactNode } from "react"
import { useUiStore } from "@/lib/store/use-ui-store"
import { cn } from "@/lib/utils"
import { LayoutGrid, Map as RouteMap, CalendarDays, Sparkles } from "lucide-react"

interface ThreePaneLayoutProps {
  sidebar: ReactNode
  content: ReactNode
  map?: ReactNode
  showMap?: boolean
  className?: string
}

export function ThreePaneLayout({
  sidebar,
  content,
  map,
  showMap = true,
  className
}: ThreePaneLayoutProps) {
  const panelMode = useUiStore(s => s.panelMode)
  const setPanelMode = useUiStore(s => s.setPanelMode)
  const [leftWidth, setLeftWidth] = useState(40)
  const mobileViewMode = useUiStore(s => s.mobileViewMode)
  const setMobileViewMode = useUiStore(s => s.setMobileViewMode)
  const isChatOpen = useUiStore(s => s.isChatOpen)
  const setIsChatOpen = useUiStore(s => s.setIsChatOpen)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    const newWidth = (e.clientX / containerWidth) * 100
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftWidth(newWidth)
      window.dispatchEvent(new Event('resize'))
    }
  }, [isDragging, setLeftWidth])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Trigger map resize when layout changes
  useEffect(() => {
    const timer = setTimeout(() => window.dispatchEvent(new Event('resize')), 300)
    return () => clearTimeout(timer)
  }, [showMap, leftWidth, mobileViewMode])

  useEffect(() => {
    const handleSnap = () => {
      setMobileViewMode('map')
    }
    window.addEventListener('drawer-snap-half', handleSnap)
    window.addEventListener('switch-to-map-view', handleSnap)
    return () => {
      window.removeEventListener('drawer-snap-half', handleSnap)
      window.removeEventListener('switch-to-map-view', handleSnap)
    }
  }, [setMobileViewMode])

  return (
    <div ref={containerRef} className={cn("h-[calc(100dvh-48px)] md:h-[calc(100vh-48px)] w-full flex overflow-hidden bg-white font-sans relative", className)}>
      {/* Desktop Left / Main Content Panel / Mobile List Panel */}
      <div 
        style={{ 
          '--desktop-width': showMap ? `calc(${leftWidth}% - 4px)` : '100%',
          '--desktop-min-width': showMap ? '320px' : '100%',
        } as React.CSSProperties}
        className={cn(
          "transition-none flex-col h-full relative z-10 bg-white",
          "w-full md:w-[var(--desktop-width)]",
          "min-w-full md:min-w-[var(--desktop-min-width)]",
          "md:flex", // always flex on desktop
          mobileViewMode === 'list' ? "flex" : "hidden md:flex" // toggle on mobile
        )}
      >
        {/* Sidebar (Header/Search) */}
        <div className="shrink-0 overflow-x-hidden">
           {sidebar}
        </div>

        {/* Primary Content (Scrollable Area) */}
        <div className="flex-1 overflow-hidden flex flex-col pb-16 md:pb-0">
           {content}
        </div>
      </div>

      {/* Resizer */}
      {showMap && (
        <div 
          onMouseDown={() => setIsDragging(true)}
          className="hidden md:flex w-2 bg-gray-50 hover:bg-rose-400 active:bg-rose-600 cursor-col-resize z-20 items-center justify-center border-x border-gray-100 transition-colors"
        >
          <div className="h-8 w-0.5 bg-gray-200 rounded-full" />
        </div>
      )}

      {/* Map Panel */}
      {map && (
        <div 
          className={cn(
            "transition-none flex flex-col relative z-0 bg-slate-100 flex-1",
            "md:[--map-width:calc(100%-4px-var(--left-width))]",
            "md:w-[var(--map-width)]",
            "md:flex", // always flex on desktop
            mobileViewMode === 'map' ? "flex w-full" : "hidden md:flex",
            !showMap ? "hidden" : ""
          )}
          style={{ 
            '--left-width': `${leftWidth}%`, 
          } as React.CSSProperties}
        >
          {showMap && (!isMobile || mobileViewMode === 'map') && map}
        </div>
      )}

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[110] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_14px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2">
          <button 
            onClick={() => { setPanelMode('discover'); setMobileViewMode('list'); setIsChatOpen(false); }}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", panelMode === 'discover' && mobileViewMode === 'list' && !isChatOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900")}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-medium">Discover</span>
          </button>
          
          <button 
            onClick={() => { setMobileViewMode('map'); setIsChatOpen(false); }}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", mobileViewMode === 'map' && !isChatOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900")}
          >
            <RouteMap className="w-5 h-5" />
            <span className="text-[10px] font-medium">Map</span>
          </button>
          
          <button 
            onClick={() => { setPanelMode('itinerary'); setMobileViewMode('list'); setIsChatOpen(false); }}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", panelMode === 'itinerary' && mobileViewMode === 'list' && !isChatOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900")}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] font-medium">Itinerary</span>
          </button>
          
          <button 
            onClick={() => { setIsChatOpen(!isChatOpen); }}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative", isChatOpen ? "text-rose-600" : "text-slate-500 hover:text-slate-900")}
          >
            <Sparkles className={cn("w-5 h-5", isChatOpen ? "text-rose-600" : "text-slate-500")} />
            <span className="text-[10px] font-medium">Concierge</span>
          </button>
        </div>
      </div>

    </div>
  )
}
