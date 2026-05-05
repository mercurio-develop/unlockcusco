"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { buildFilterHref } from "@/lib/utils/filter-params"

export interface FilterOption { label: string; value: string }
export interface FilterGroup {
  key: string
  label?: string
  options: FilterOption[]
  allLabel?: string
}

export interface FilterBarProps {
  filterGroups: FilterGroup[]
  activeFilters: Record<string, string | undefined>
  basePath?: string
  onFilterChange?: (key: string, value: string | null) => void
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  defaultSearchValue?: string
  resultCount?: number
}

export function FilterBar({
  filterGroups,
  activeFilters,
  basePath,
  onFilterChange,
  onSearchChange,
  searchPlaceholder = "Search...",
  defaultSearchValue = "",
  resultCount
}: FilterBarProps) {
  const isServerMode = !!basePath

  return (
    <div className="mb-10 space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {isServerMode ? (
          <form method="GET" action={basePath}>
            {Object.entries(activeFilters).map(([k, v]) => {
              if (k !== 'q' && v !== undefined) {
                return <input key={k} type="hidden" name={k} value={v} />
              }
              return null
            })}
            <input
              type="search"
              name="q"
              defaultValue={defaultSearchValue}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 text-sm"
            />
          </form>
        ) : (
          <input
            type="search"
            defaultValue={defaultSearchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 text-sm"
          />
        )}
      </div>

      {/* Filter Groups */}
      {filterGroups.map(group => {
        const activeValue = activeFilters[group.key]
        return (
          <div key={group.key} className="space-y-3">
            {group.label && <h3 className="text-sm font-bold text-white uppercase tracking-widest">{group.label}</h3>}
            <div className="flex flex-wrap gap-2">
              {/* "All" chip */}
              {isServerMode ? (
                <Link
                  href={buildFilterHref(basePath!, activeFilters, { [group.key]: undefined })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors border ${
                    !activeValue
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {group.allLabel || "All"}
                </Link>
              ) : (
                <button
                  onClick={() => onFilterChange?.(group.key, null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors border ${
                    !activeValue
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {group.allLabel || "All"}
                </button>
              )}

              {/* Option chips */}
              {group.options.map(opt => {
                const isActive = activeValue === opt.value
                const chipClass = `px-3 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                }`

                return isServerMode ? (
                  <Link
                    key={opt.value}
                    href={buildFilterHref(basePath!, activeFilters, { [group.key]: opt.value })}
                    className={chipClass}
                  >
                    {opt.label}
                  </Link>
                ) : (
                  <button
                    key={opt.value}
                    onClick={() => onFilterChange?.(group.key, opt.value)}
                    className={chipClass}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      
      {resultCount !== undefined && (
        <p className="text-sm text-slate-400 mt-4">{resultCount} results</p>
      )}
    </div>
  )
}
