"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    router.push(query.trim() ? `/explore?q=${encodeURIComponent(query)}` : "/explore")
  }

  return (
    <div className="min-h-[90vh] w-full relative flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Sacred Valley background — visible but light-theme friendly */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=3000&auto=format&fit=crop"
          className="object-cover object-center"
          alt="Sacred Valley, Andes Mountains"
          fill
          priority
          unoptimized
        />
      </div>
      {/* Radial white vignette — keeps center text crisp, shows landscape at edges */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_50%_100%_at_50%_50%,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.45)_50%,transparent_100%)]" />
      {/* Bottom fade into white page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-0 bg-linear-to-t from-white to-transparent" />

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full px-4 flex flex-col items-center text-center"
      >
        <p className="text-rose-600 text-xs uppercase tracking-[0.3em] font-semibold mb-5">
          Sacred Valley, Peru
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-slate-900 mb-6 max-w-4xl">
          Beyond the Map.
        </h1>

        <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl leading-relaxed mx-auto mb-12">
          The definitive gateway to the true Sacred Valley. Access an exclusive, unlisted network of master artisans, private sanctuaries, and trusted local transit.
        </p>

        {/* Airbnb-style white search bar */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl bg-white rounded-full shadow-[0_2px_20px_rgba(0,0,0,0.12)] flex items-center gap-2 p-2 border border-gray-100"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your perfect day in the Sacred Valley..."
            className="bg-transparent border-none text-slate-900 focus:outline-none focus:ring-0 w-full px-4 py-3 text-base placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="bg-rose-600 text-white font-semibold rounded-full px-6 py-3 flex items-center gap-2 hover:bg-rose-700 transition-colors shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick search pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-4xl">
          {[
            { emoji: "🚕", text: "I need a taxi from Urubamba to Pisac" },
            { emoji: "🦙", text: "Authentic Alpaca textiles in Chinchero" },
            { emoji: "🗺️", text: "Build a 1-day family itinerary in the Valley" },
            { emoji: "🌿", text: "Recovery massage after the Inca Trail" },
            { emoji: "🍽️", text: "Authentic local Picantería near me" },
            { emoji: "🛵", text: "Hidden ATV routes in Maras" },
            { emoji: "☕", text: "Specialty coffee with fast Wi-Fi" },
            { emoji: "🏔️", text: "Local guides for off-beaten treks" },
            { emoji: "🛖", text: "Quiet boutique stays in Ollantaytambo" },
            { emoji: "🧘", text: "Yoga and sound healing retreats" },
          ].map(({ emoji, text }) => (
            <button
              key={text}
              type="button"
              onClick={() => router.push(`/explore?q=${encodeURIComponent(text)}`)}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 text-slate-700 px-4 py-2 rounded-full text-sm hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all cursor-pointer shadow-sm"
            >
              {emoji} {text}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-xs uppercase tracking-widest">Discover</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  )
}
