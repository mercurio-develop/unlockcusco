"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, MapPin } from "lucide-react"

export default function HomePage() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query)}`)
    } else {
      router.push("/explore")
    }
  }

  const handlePillClick = (text: string) => {
    router.push(`/explore?q=${encodeURIComponent(text)}`)
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden bg-[#09090B]">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-60 mix-blend-overlay">
        <img 
          src="https://images.unsplash.com/photo-1526392060635-9d60198d3fe3?q=80&w=3000&auto=format&fit=crop" 
          className="w-full h-full object-cover" 
          alt="Andes Mountains"
        />
      </div>
      <div className="bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent absolute inset-0 z-0"></div>

      {/* Navbar */}
      <div className="w-full absolute top-0 z-50 flex justify-between items-center p-6 lg:px-12">
        <div className="tracking-[0.4em] text-white text-xl font-serif">VALLE.</div>
        <div className="flex items-center">
          <button className="text-white/70 hover:text-white transition text-sm mr-6">For Locals</button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full text-white text-sm hover:bg-white/20 transition">Sign In</button>
        </div>
      </div>

      {/* Hero Content */}
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
          The Sacred Valley's first AI intelligence. Skip the tourist traps. We connect you to verified local experiences in milliseconds.
        </p>

        {/* Omnibar */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl mt-12 p-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col md:flex-row items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] focus-within:shadow-[0_0_60px_-15px_rgba(212,175,55,0.15)] transition-all mx-auto">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your perfect day in El Valle..." 
            className="bg-transparent border-none text-white focus:outline-none focus:ring-0 w-full p-4 text-lg placeholder:text-white/40 font-light"
          />
          <button type="submit" className="bg-[#D4AF37] text-black font-medium rounded-full px-8 py-4 flex items-center gap-2 hover:bg-[#C5A059] transition-colors flex-shrink-0 w-full md:w-auto justify-center">
            Design Trip <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Inspiration Pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <div onClick={() => handlePillClick("Recovery massage after the Inca Trail")} className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-sm flex items-center hover:bg-white/10 transition cursor-pointer">
            🌿 Recovery massage after the Inca Trail
          </div>
          <div onClick={() => handlePillClick("Hidden ATV routes in Maras")} className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-sm flex items-center hover:bg-white/10 transition cursor-pointer">
            🛵 Hidden ATV routes in Maras
          </div>
          <div onClick={() => handlePillClick("Authentic local Picantería near me")} className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-sm flex items-center hover:bg-white/10 transition cursor-pointer">
            🍽️ Authentic local Picantería near me
          </div>
        </div>
      </motion.div>
    </div>
  )
}
