"use client"

import { useRouter, useSearchParams } from "next/navigation"

const SERVICE_CATEGORIES = [
  { label: "🚕 Taxis",       value: "Taxi" },
  { label: "🧭 Guides",      value: "Guide" },
  { label: "💆 Therapists",  value: "Therapist" },
  { label: "🏢 Agencies",    value: "Agency" },
]

export function ServiceSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCat = searchParams.get("cat") || ""

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) params.set("cat", cat); else params.delete("cat")
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Category</span>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setCategory("")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${currentCat === "" ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"}`}
        >
          All Services
        </button>
        {SERVICE_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${currentCat === cat.value ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-600 hover:bg-gray-50 border border-gray-200"}`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
