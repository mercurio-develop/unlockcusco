"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

const SERVICE_CATEGORIES = [
  { label: "🚕 Taxis",       value: "Taxi" },
  { label: "🧭 Guides",      value: "Guide" },
  { label: "💆 Therapists",  value: "Therapist" },
  { label: "🏢 Agencies",    value: "Agency" },
]

export function ServiceSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCatStr = searchParams.get("cat") || ""

  const currentCats = useMemo(() => {
    return currentCatStr ? currentCatStr.split(',').filter(Boolean) : []
  }, [currentCatStr])

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) {
      params.set("cat", cat)
    } else {
      params.delete("cat")
    }
    router.push(`/explore?${params.toString()}`)
  }

  const toggleCategory = (cat: string) => {
    let nextCats = [...currentCats]
    if (nextCats.includes(cat)) {
      nextCats = nextCats.filter(c => c !== cat)
    } else {
      nextCats.push(cat)
    }
    
    const params = new URLSearchParams(searchParams.toString())
    if (nextCats.length > 0) {
      params.set("cat", nextCats.join(','))
    } else {
      params.delete("cat")
    }
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center mt-2">
      <button
        onClick={() => setCategory("")}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${currentCats.length === 0 ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"}`}
      >
        All Services
      </button>
      {SERVICE_CATEGORIES.map(cat => (
        <button
          key={cat.value}
          onClick={() => toggleCategory(cat.value)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1 ${currentCats.includes(cat.value) ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"}`}
        >
          {currentCats.includes(cat.value) && (
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          )}
          {cat.label}
        </button>
      ))}
    </div>
  )
}
