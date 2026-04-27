"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

const CATEGORIES = [
  { label: "🥾 Adventure", value: "Adventure" },
  { label: "🧘 Wellness", value: "Wellness" },
  { label: "🍽️ Dining", value: "Dining" },
  { label: "🏺 Culture", value: "Culture" },
  { label: "🛌 Stays", value: "Stays" },
]

export function ExploreSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialQuery)

  const navigate = (q: string) => {
    if (q.trim()) {
      router.push(`/explore?q=${encodeURIComponent(q.trim())}`)
    } else {
      router.push("/explore")
    }
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          navigate(value)
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="✨ Describe your perfect day (e.g. massage and good food)..."
          className="w-full p-5 rounded-2xl border border-white/20 bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all mb-6 text-white shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)] text-lg placeholder:text-white/40 font-light backdrop-blur-md"
        />
      </form>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive =
            initialQuery &&
            initialQuery.toLowerCase().includes(cat.value.toLowerCase())
          return (
            <Badge
              key={cat.value}
              variant="secondary"
              onClick={() => navigate(cat.value)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap cursor-pointer transition-colors text-sm font-medium border ${
                isActive
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] hover:bg-[#C5A059]"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </Badge>
          )
        })}
      </div>
    </>
  )
}
