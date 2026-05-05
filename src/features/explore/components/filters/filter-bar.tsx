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
    <div className="mb-4 space-y-6">
      {/* Search Input */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
              className="w-full pl-12 pr-4 py-3.5 rounded-full border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 text-[15px] font-medium shadow-sm hover:shadow transition-all outline-none"
            />
          </form>
        ) : (
          <input
            type="search"
            defaultValue={defaultSearchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 rounded-full border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 text-[15px] font-medium shadow-sm hover:shadow transition-all outline-none"
          />
        )}
      </div>

      {/* Filter Groups */}
      <div className="flex flex-col gap-5">
        {filterGroups.map(group => {
          const activeValue = activeFilters[group.key]
          return (
            <div key={group.key} className="space-y-3">
              {group.label && <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{group.label}</h3>}
              <div className="flex flex-wrap gap-2.5">
                {/* "All" chip */}
                {isServerMode ? (
                  <Link
                    href={buildFilterHref(basePath!, activeFilters, { [group.key]: undefined })}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 ${
                      !activeValue
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white text-slate-600 border-gray-200 hover:border-slate-900 hover:text-slate-900 hover:bg-gray-50"
                    }`}
                  >
                    {group.allLabel || "All"}
                  </Link>
                ) : (
                  <button
                    onClick={() => onFilterChange?.(group.key, null)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 ${
                      !activeValue
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white text-slate-600 border-gray-200 hover:border-slate-900 hover:text-slate-900 hover:bg-gray-50"
                    }`}
                  >
                    {group.allLabel || "All"}
                  </button>
                )}

                {/* Option chips */}
                {group.options.map(opt => {
                  const isActive = activeValue === opt.value
                  const chipClass = `px-4 py-2 rounded-full text-sm font-semibold transition-all border duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white text-slate-600 border-gray-200 hover:border-slate-900 hover:text-slate-900 hover:bg-gray-50"
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
      </div>
      
      {resultCount !== undefined && (
        <p className="text-sm font-medium text-slate-500 mt-2">{resultCount} {resultCount === 1 ? 'result' : 'results'} found</p>
      )}
    </div>
  )
}
