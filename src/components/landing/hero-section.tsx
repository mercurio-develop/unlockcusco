"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, ChevronDown } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    router.push(query.trim() ? `/explore?q=${encodeURIComponent(query)}` : "/explore")
  }

  return (
    <div className="h-screen w-full relative flex flex-col items-center justify-center overflow-hidden bg-[#09090B]">
      <div className="absolute inset-0 z-0 opacity-60 mix-blend-overlay">
        <Image
          src="https://images.unsplash.com/photo-1526392060635-9d60198d3fe3?q=80&w=3000&auto=format&fit=crop"
          className="object-cover"
          alt="Andes Mountains"
          fill
          priority
          unoptimized
        />
      </div>
      <div className="bg-linear-to-t from-[#09090B] via-[#09090B]/50 to-transparent absolute inset-0 z-0" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full px-4 flex flex-col items-center"
      >
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md flex items-center justify-center mx-auto w-max mb-8">
          <span className="text-xs text-white/80 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Powered by Khipu AI
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-serif tracking-tight text-white mb-6 text-center drop-shadow-xl">
          Unlock the Andes.
        </h1>

        <p className="text-lg md:text-xl text-white/70 font-light max-w-2xl text-center leading-relaxed mx-auto">
          The Sacred Valley&apos;s first AI intelligence. Skip the tourist traps. We connect you to verified local experiences in milliseconds.
        </p>

        <form
          onSubmit={handleSearch}
          className="w-full max-w-3xl mt-12 p-2 rounded-full bg-white shadow-2xl flex flex-col md:flex-row items-center gap-2 transition-all mx-auto"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your perfect day in the Sacred Valley..."
            className="bg-transparent border-none text-slate-900 focus:outline-none focus:ring-0 w-full p-4 text-lg placeholder:text-gray-400 font-light"
          />
          <button
            type="submit"
            className="bg-rose-600 text-white font-semibold rounded-full px-8 py-4 flex items-center gap-2 hover:bg-rose-700 transition-colors shrink-0 w-full md:w-auto justify-center"
          >
            Design Trip <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            { emoji: "🌿", text: "Recovery massage after the Inca Trail" },
            { emoji: "🛵", text: "Hidden ATV routes in Maras" },
            { emoji: "🍽️", text: "Authentic local Picantería near me" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              onClick={() => router.push(`/explore?q=${encodeURIComponent(text)}`)}
              className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-sm flex items-center hover:bg-white/10 transition cursor-pointer"
            >
              {emoji} {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/30"
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
