import { useRef, useState, useEffect, useCallback, ReactNode } from "react"
import { useTrip } from "@/lib/store/trip-context"
import { usePreferences } from "@/lib/store/preferences-context"
import { cn } from "@/lib/utils"

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
  const { panelMode, setPanelMode } = useTrip()
  const [leftWidth, setLeftWidth] = useState(40)
  const { isChatOpen, setIsChatOpen, mobileViewMode, setMobileViewMode } = usePreferences()
  const [isDragging, setIsDragging] = useState(false)

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
  }, [])

  return (
    <div ref={containerRef} className={cn("h-[calc(100dvh-56px)] md:h-[calc(100vh-56px)] w-full flex overflow-hidden bg-white font-sans relative", className)}>
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
        <div className="flex-1 overflow-hidden flex flex-col">
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
          {showMap && map}
        </div>
      )}

      {/* Mobile Map/List Toggle */}
      <div className="md:hidden fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setMobileViewMode(m => m === 'list' ? 'map' : 'list')} 
          className="bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.25)] font-bold text-sm flex items-center gap-2 transition-transform active:scale-95"
        >
          {mobileViewMode === 'list' ? (
            <>
              <span>Map</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </>
          ) : (
            <>
              <span>List</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </>
          )}
        </button>
      </div>

    </div>
  )
}
