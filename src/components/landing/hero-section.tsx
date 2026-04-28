"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronDown, Sparkles } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    router.push(query.trim() ? `/explore?q=${encodeURIComponent(query)}` : "/explore")
  }

  const scrollToDiscover = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full relative flex flex-col items-center justify-center overflow-hidden bg-[#09090B]">
      <div className="absolute inset-0 z-0 opacity-60">
        <Image
          src="https://images.unsplash.com/photo-1526392060635-9d60198d3fe3?q=80&w=3000&auto=format&fit=crop"
          className="object-cover"
          alt="Sacred Valley, Andes Mountains"
          fill
          priority
          unoptimized
        />
      </div>
      {/* Gradient to make text readable and blend into the dark section below */}
      <div className="bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent absolute inset-0 z-0" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full px-4 flex flex-col items-center"
      >
        <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] uppercase tracking-[0.3em] mb-4 font-bold bg-[#09090B]/40 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
          <Sparkles className="w-3.5 h-3.5" />
          INKAPORTAL OS
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-[#D4AF37]/70 mb-6 text-center drop-shadow-2xl">
          Beyond the Map.
        </h1>

        <p className="text-lg md:text-xl text-white/60 font-sans max-w-xl text-center leading-relaxed mx-auto drop-shadow-md">
          The definitive gateway to the true Sacred Valley. Access an exclusive, unlisted network of master artisans, private sanctuaries, and trusted local transit.
        </p>

        <div
          className="w-full max-w-3xl mt-12 p-2 rounded-full bg-[#09090B]/60 backdrop-blur-2xl border border-white/10 flex flex-col md:flex-row items-center gap-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all mx-auto group focus-within:border-white/30 focus-within:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
        >
          <div className="flex-1 w-full relative flex items-center px-4">
             <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Describe your perfect day in the Sacred Valley..."
              className="bg-transparent border-none text-white focus:outline-none focus:ring-0 w-full py-3 text-base md:text-lg placeholder:text-white/40 font-sans"
             />
          </div>
          
          <button
            type="button"
            onClick={() => handleSearch()}
            className="bg-[#D4AF37] text-black font-bold rounded-full px-8 py-3.5 flex items-center gap-2 hover:bg-[#C5A059] transition-colors flex-shrink-0 w-full md:w-auto justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Enter the Portal <Sparkles className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-4xl">
          {[
            { emoji: "🌿", text: "Recovery massage after the Inca Trail" },
            { emoji: "🛵", text: "Hidden ATV routes in Maras" },
            { emoji: "🍽️", text: "Authentic local Picantería near me" },
            { emoji: "🦙", text: "Trekking with Llamas in the mountains" },
            { emoji: "🛖", text: "Boutique stays in Ollantaytambo" },
            { emoji: "☕", text: "Best specialty coffee in Pisac" },
            { emoji: "✨", text: "Spiritual retreats and yoga" },
            { emoji: "🚕", text: "Private transport to Cusco airport" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              onClick={() => router.push(`/explore?q=${encodeURIComponent(text)}`)}
              className="bg-[#09090B]/60 border border-white/10 text-white/80 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-lg whitespace-nowrap"
            >
              <span>{emoji}</span> {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40 cursor-pointer hover:text-white transition-colors"
        onClick={scrollToDiscover}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Discover</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </div>
  )
}
