import { useRef, useState, useEffect, useCallback, ReactNode } from "react"
import { useMapUiStore } from "@/lib/store/use-ui-store"
import { cn } from "@/lib/utils"
import { LayoutGrid, Map as RouteMap} from "lucide-react"

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
  const [leftWidth, setLeftWidth] = useState(40)
  const mobileViewMode = useMapUiStore(s => s.mobileViewMode)
  const setMobileViewMode = useMapUiStore(s => s.setMobileViewMode)
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
    <div ref={containerRef} className={cn("h-[calc(100dvh-112px)] md:h-[calc(100vh-48px)] w-full flex overflow-hidden bg-white font-sans relative", className)}>
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
        <div className="flex-1 overflow-hidden flex flex-col md:pb-0">
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

      {/* Mobile Map/List Toggle FAB */}
      {showMap && (
        <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => setMobileViewMode(mobileViewMode === 'map' ? 'list' : 'map')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md text-white rounded-full shadow-lg font-bold text-xs tracking-wide transition-transform active:scale-95 border border-slate-700/50"
          >
            {mobileViewMode === 'map' ? (
              <>
                <LayoutGrid className="w-4 h-4" />
                <span>Show List</span>
              </>
            ) : (
              <>
                <RouteMap className="w-4 h-4" />
                <span>Show Map</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  )
}
