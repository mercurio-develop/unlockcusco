"use client"

import React, { useRef, useState, MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface ScrollCarouselProps {
  children: React.ReactNode
  className?: string
}

export function ScrollCarousel({ children, className }: ScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    
    // Determine if we've actually dragged vs just clicked
    if (Math.abs(walk) > 5) {
      setHasDragged(true)
    }
    
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onClickCapture={(e) => {
        // Prevent child link clicks if the user was dragging
        if (hasDragged) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      className={cn(
        "flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        isDragging ? "cursor-grabbing snap-none select-none" : "cursor-grab snap-x snap-mandatory",
        className
      )}
    >
      {children}
    </div>
  )
}
