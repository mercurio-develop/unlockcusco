"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

export function ExpandableText({ text, maxLength = 150, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const shouldTruncate = text.length > maxLength
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, maxLength).trim() + "..." : text

  return (
    <div className={cn("flex flex-col items-start flex-1", className)}>
      <p className="text-slate-600 text-sm leading-relaxed italic flex-1">
        &quot;{displayText}&quot;
      </p>
      {shouldTruncate && (
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 mt-3 transition-colors uppercase tracking-widest"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  )
}
