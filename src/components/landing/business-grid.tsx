"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { Star, Zap, ArrowUpRight } from "lucide-react"

type Business = {
  id: string
  name: string
  category: string
  imageUrl: string
  rating: number | null
  reviewsCount: number
  isClaimed: boolean
}

const CATEGORIES = ["All", "Adventure", "Wellness", "Dining", "Culture", "Stays"]

const CATEGORY_EMOJI: Record<string, string> = {
  Adventure: "🥾",
  Wellness: "🧘",
  Dining: "🍽️",
  Culture: "🏺",
  Stays: "🛌",
}

interface BusinessGridProps {
  businesses: Business[]
}

export function BusinessGrid({ businesses }: BusinessGridProps) {
  const [active, setActive] = useState("All")
  const router = useRouter()

  const filtered =
    active === "All" ? businesses : businesses.filter((b) => b.category === active)

  return (
    <section className="bg-[#09090B] px-6 md:px-12 py-20">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-3">Sacred Valley</p>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
            Places waiting for you.
          </h2>
        </div>
        <button
          onClick={() => router.push("/explore")}
          className="flex items-center gap-2 text-white/50 hover:text-white transition text-sm group"
        >
          See all on map
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-10 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              active === cat
                ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat !== "All" ? `${CATEGORY_EMOJI[cat]} ` : ""}{cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        key={active}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {filtered.map((business, i) => (
          <motion.div
            key={`${business.id}-${i}`}
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
            onClick={() => router.push(`/explore?q=${encodeURIComponent(business.name)}`)}
            className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-slate-900 ${
              i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-[3/4]"
            }`}
          >
            <Image
              src={business.imageUrl}
              alt={business.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <span className="text-xs bg-black/40 backdrop-blur-sm text-white/80 px-2.5 py-1 rounded-full border border-white/10">
                {CATEGORY_EMOJI[business.category]} {business.category}
              </span>
              {business.isClaimed && (
                <span className="flex items-center gap-1 text-[10px] bg-[#25D366] text-white font-bold px-2 py-1 rounded-full">
                  <Zap className="w-2.5 h-2.5 fill-current" /> Live
                </span>
              )}
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className={`font-bold text-white leading-tight line-clamp-2 ${i === 0 ? "text-2xl md:text-3xl font-serif" : "text-sm md:text-base"}`}>
                {business.name}
              </h3>

              {business.rating !== null && (
                <div className="flex items-center gap-1 mt-1.5">
                  <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-xs text-white/70 font-medium">
                    {business.rating} ({business.reviewsCount})
                  </span>
                </div>
              )}

              {/* Slide-up CTA */}
              <div className="mt-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1.5 rounded-full">
                  Explore <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <button
          onClick={() => router.push("/explore")}
          className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-white/10 transition-all hover:border-white/20"
        >
          Open the full map
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  )
}
