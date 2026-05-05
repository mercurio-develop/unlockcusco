"use client"

import { useState } from "react"
import { ThreePaneLayout } from "@/components/layout/three-pane-layout"
import { FilterBar, FilterGroup } from "@/components/filters/filter-bar"
import { EntityCard } from "@/components/cards/entity-card"
import type { UniversalService } from "@/lib/types/trip"

interface ServicesViewProps {
  title: string
  subtitle?: string
  description?: string
  entities: UniversalService[]
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

  const sidebar = (
    <div className="px-6 pt-10 pb-6 bg-white border-b border-gray-100">
      <div className="max-w-2xl mb-10">
        {subtitle && (
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            {subtitle}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight mb-4 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 leading-relaxed font-light">
            {description}
          </p>
        )}
      </div>

      <FilterBar 
        basePath={basePath}
        activeFilters={activeFilters}
        filterGroups={filterGroups}
        searchPlaceholder={searchPlaceholder}
        defaultSearchValue={defaultSearchValue}
        resultCount={entities.length}
      />
    </div>
  )

  const content = (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
        {entities.map((entity) => (
          <div key={entity.id}>
            <EntityCard 
              entity={entity} 
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
  )

  return (
    <ThreePaneLayout
      sidebar={sidebar}
      content={content}
      showMap={false} 
    />
  )
}
