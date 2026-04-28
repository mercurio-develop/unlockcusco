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

  const scrollToDiscover = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
  }

  return (
    <div className="h-[calc(100vh-56px)] w-full relative flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1526392060635-9d60198d3fe3?q=80&w=3000&auto=format&fit=crop"
          className="object-cover"
          alt="Andes Mountains"
          fill
          priority
          unoptimized
        />
      </div>
      {/* Gradient to make text readable and blend into the white section below */}
      <div className="bg-gradient-to-t from-white via-black/40 to-black/20 absolute inset-0 z-0" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full px-4 flex flex-col items-center"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-white mb-6 text-center drop-shadow-2xl">
          Unlock the Andes.
        </h1>

        <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl text-center leading-relaxed mx-auto drop-shadow-md">
          The Sacred Valley&apos;s first AI intelligence. Skip the tourist traps. We connect you to verified local experiences in milliseconds.
        </p>

        <div
          className="w-full max-w-3xl mt-12 p-2 rounded-full bg-white flex flex-col md:flex-row items-center gap-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] transition-all mx-auto group focus-within:ring-4 focus-within:ring-rose-500/20"
        >
          <div className="flex-1 w-full relative flex items-center px-4">
             <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Describe your perfect day in the Sacred Valley..."
              className="bg-transparent border-none text-slate-900 focus:outline-none focus:ring-0 w-full py-3 text-base md:text-lg placeholder:text-gray-400 font-medium"
             />
          </div>
          
          <button
            type="button"
            onClick={() => handleSearch()}
            className="bg-rose-600 text-white font-bold rounded-full px-8 py-3.5 flex items-center gap-2 hover:bg-rose-700 transition-colors flex-shrink-0 w-full md:w-auto justify-center shadow-md"
          >
            Design Trip <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3 max-w-3xl">
          {[
            { emoji: "🌿", text: "Recovery massage after the Inca Trail" },
            { emoji: "🛵", text: "Hidden ATV routes in Maras" },
            { emoji: "🍽️", text: "Authentic local Picantería near me" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              onClick={() => router.push(`/explore?q=${encodeURIComponent(text)}`)}
              className="bg-black/30 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white hover:text-slate-900 transition-all cursor-pointer backdrop-blur-md shadow-lg"
            >
              <span>{emoji}</span> {text}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-slate-400 cursor-pointer"
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
