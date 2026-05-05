"use client"

import { useState } from "react"
import Link from "next/link"
import { ThreePaneLayout } from "@/components/layout/three-pane-layout"
import { FilterBar, FilterGroup } from "@/features/explore/components/filters/filter-bar"
import { BusinessCard } from "@/features/business/components/business-card"
import { Filter, X, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Business } from "@prisma/client"

interface ServicesViewProps {
  title: string
  subtitle?: string
  description?: string
  entities: Business[]
  filterGroups: FilterGroup[]
  activeFilters: Record<string, string | undefined>
  basePath: string
  searchPlaceholder?: string
  defaultSearchValue?: string
}

export function ServicesView({
  title,
  subtitle,
  description,
  entities,
  filterGroups,
  activeFilters,
  basePath,
  searchPlaceholder,
  defaultSearchValue
}: ServicesViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(true)

  const content = (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 transition-all duration-300">
        <div className="px-6 md:px-10 lg:px-14 pt-8 pb-4 max-w-screen-3xl mx-auto w-full">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div className="max-w-2xl">
              {subtitle && (
                <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-2 font-bold">
                  {subtitle}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-slate-500 leading-relaxed font-light mt-2">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors shrink-0 self-start md:self-auto"
            >
              {showFilters ? (
                <><X className="w-4 h-4" /> Hide Filters</>
              ) : (
                <><Filter className="w-4 h-4" /> Show Filters</>
              )}
            </button>
          </div>

          <div className={cn("transition-all duration-300 overflow-hidden", showFilters ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0")}>
            <div className="pt-4">
              <FilterBar 
                basePath={basePath}
                activeFilters={activeFilters}
                filterGroups={filterGroups}
                searchPlaceholder={searchPlaceholder}
                defaultSearchValue={defaultSearchValue}
                resultCount={entities.length}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 lg:px-14 py-10 max-w-screen-3xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-6 md:gap-8 pb-20">
          {entities.map((entity) => (
            <div key={entity.id}>
              <BusinessCard 
                business={entity} 
                isHighlighted={selectedId === entity.id}
                onSelect={() => setSelectedId(entity.id)}
              />
            </div>
          ))}
          {entities.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400">No results found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <ThreePaneLayout
      sidebar={null}
      content={content}
      showMap={false} 
    />
  )
}
