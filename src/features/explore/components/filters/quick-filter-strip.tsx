"use client"

import { CATEGORIES } from "../../constants"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickFilterStripProps {
  currentCats: string[]
  onCategoryToggle: (cat: string) => void
  onOpenFilters: () => void
  categoryCounts?: Record<string, number>
}

export function QuickFilterStrip({
  currentCats,
  onCategoryToggle,
  onOpenFilters,
  categoryCounts = {}
}: QuickFilterStripProps) {
  const totalCount = Object.values(categoryCounts).reduce((acc, curr) => acc + curr, 0)

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {/* Advanced Filters Trigger */}
      <button
        onClick={onOpenFilters}
        className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-full border border-gray-200 bg-white text-slate-600 text-sm font-semibold hover:bg-gray-50 hover:border-slate-900 transition-all shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {/* Vertical Divider */}
      <div className="w-px h-6 bg-gray-200 shrink-0 mx-1" />

      {/* All Experiences Chip */}
      <button
        onClick={() => currentCats.length > 0 && onCategoryToggle("CLEAR_ALL")}
        className={cn(
          "shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 flex items-center gap-2",
          currentCats.length === 0
            ? "bg-slate-900 text-white shadow-md border-slate-900"
            : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
        )}
      >
        All
        {totalCount > 0 && (
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            currentCats.length === 0 ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          )}>
            {totalCount}
          </span>
        )}
      </button>

      {/* Category Chips */}
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon
        const isActive = currentCats.includes(cat.value)
        const count = categoryCounts[cat.value.toUpperCase()] || 0
        
        return (
          <button
            key={cat.value}
            onClick={() => onCategoryToggle(cat.value)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 flex items-center gap-2",
              isActive
                ? "bg-slate-900 text-white shadow-md border-slate-900"
                : "bg-white text-slate-600 hover:bg-gray-50 border-gray-200 hover:border-slate-900 hover:text-slate-900"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
            <span>{cat.label}</span>
            {count > 0 && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
