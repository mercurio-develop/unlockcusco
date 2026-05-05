"use client"

import { useRef, useState, useEffect, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTrip } from "@/lib/store/trip-context"
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
  const { leftWidth, setLeftWidth } = useTrip()
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
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
  }, [showMap, leftWidth])

  return (
    <div ref={containerRef} className={cn("h-[calc(100vh-56px)] w-full flex overflow-hidden bg-white font-sans relative", className)}>
      {/* Left / Main Content Panel */}
      <div 
        style={{ 
          width: showMap ? `calc(${leftWidth}% - 4px)` : '100%',
          minWidth: showMap ? '320px' : '100%',
        }}
        className={cn(
          "transition-none flex flex-col h-full relative z-10 bg-white",
          viewMode === "map" ? "hidden md:flex" : "w-full"
        )}
      >
        {/* Sidebar (Header/Search) */}
        <div className="shrink-0">
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
          style={{ width: showMap ? `calc(${100 - leftWidth}% - 4px)` : '0%' }}
          className={cn(
            "transition-none flex flex-col relative z-10 bg-slate-100",
            viewMode === "list" ? "hidden md:flex" : "",
            !showMap ? "hidden" : "flex-1"
          )}
        >
          {showMap && map}
        </div>
      )}

      {/* Mobile Mode Toggle */}
      {map && (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-2xl">
            <button 
              onClick={() => setViewMode("list")} 
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-colors",
                viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-gray-50"
              )}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode("map")} 
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-colors",
                viewMode === "map" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-gray-50"
              )}
            >
              Map
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
