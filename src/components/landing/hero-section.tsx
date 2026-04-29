"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronDown, MapPin } from "lucide-react"
import Image from "next/image"

const SACRED_VALLEY_LOCATIONS = [
  "Urubamba", "Pisac", "Maras", "Ollantaytambo", "Chinchero", "Calca", "Cusco", "Machu Picchu"
];

export function HeroSection() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault()
    const finalQuery = directPrompt || query.trim()
    if (!finalQuery) {
      router.push("/explore")
      return
    }
    setIsSearching(true)
    setTimeout(() => {
      router.push(`/explore?ai_prompt=${encodeURIComponent(finalQuery)}`)
    }, 400)
  }

  const lastWord = query.split(' ').pop() || "";
  const suggestions = (isFocused && lastWord.length >= 2) 
    ? SACRED_VALLEY_LOCATIONS.filter(l => l.toLowerCase().startsWith(lastWord.toLowerCase()) && l.toLowerCase() !== lastWord.toLowerCase())
    : [];

  const handleSuggestionClick = (suggestion: string) => {
    const words = query.split(' ');
    words.pop();
    words.push(suggestion);
    setQuery(words.join(' ') + ' ');
    inputRef.current?.focus();
  };

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
        <div className="w-full max-w-2xl relative">
          <form
            onSubmit={handleSearch}
            className="w-full bg-white rounded-full shadow-[0_2px_20px_rgba(0,0,0,0.12)] flex items-center gap-2 p-2 border border-gray-100 relative z-20"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)} // delay to allow click
              placeholder="e.g., 'I need a taxi from Pisac to Ollantaytambo right now'"
              className="bg-transparent border-none text-slate-900 focus:outline-none focus:ring-0 w-full px-4 py-3 text-base placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-rose-600 text-white font-semibold rounded-full px-6 py-3 flex items-center gap-2 hover:bg-rose-700 transition-colors shrink-0 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] justify-center"
            >
              {isSearching ? (
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Working...
                </span>
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10 p-2 text-left"
              >
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span className="font-medium">{suggestion}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Filters */}
        <div className="mt-8 w-full max-w-2xl">
          <div className="flex justify-center gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide px-4">
            {[
              { label: "Adventure", value: "Adventure", emoji: "🥾" },
              { label: "Wellness", value: "Wellness", emoji: "🧘" },
              { label: "Dining", value: "Dining", emoji: "🍽️" },
              { label: "Culture", value: "Culture", emoji: "🏺" },
              { label: "Stays", value: "Stays", emoji: "🛌" },
            ].map(({ label, value, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => router.push(`/explore?cat=${value}`)}
                className="flex flex-col items-center gap-2 group shrink-0"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:border-rose-300 group-hover:scale-105 transition-all">
                  {emoji}
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-rose-600 transition-colors">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
