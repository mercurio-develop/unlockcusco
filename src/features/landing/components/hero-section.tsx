"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, MapPin, Sparkles, Utensils, Bed, Leaf, Palette, Compass, Bot } from "lucide-react"
import { SACRED_VALLEY_LOCATIONS } from "@/lib/constants"
import { ScrollCarousel } from "@/components/ui/scroll-carousel"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HeroSection({ dict }: { dict: Record<string, any> }) {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const pathname = usePathname() || '/'
  const locale = pathname.split('/')[1] || 'en'
  const langPrefix = ['en', 'es'].includes(locale) ? `/${locale}` : '/en'
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault()
    const finalQuery = directPrompt || query.trim()
    if (!finalQuery) {
      router.push(`${langPrefix}/explore`)
      return
    }
    setIsSearching(true)
    setTimeout(() => {
      router.push(`${langPrefix}/explore?ai_prompt=${encodeURIComponent(finalQuery)}`)
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
    <div className="min-h-[90vh] w-full relative flex flex-col items-center justify-center overflow-hidden bg-slate-50 pt-12">
      {/* Sacred Valley background — visible but light-theme friendly */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1600&auto=format&fit=crop"
          className="object-cover object-center"
          alt="Sacred Valley, Andes Mountains"
          fill
          priority
          sizes="100vw"
        />
      </div>
      {/* Radial white vignette — keeps center text crisp, shows landscape at edges */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_90%_at_50%_50%,rgba(248,250,252,0.95)_0%,rgba(248,250,252,0.7)_40%,transparent_100%)]" />
      {/* Bottom fade into white page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-0 bg-linear-to-t from-slate-50 to-transparent" />

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full px-4 flex flex-col items-center text-center"
      >

        <h1 className="text-5xl md:text-6xl lg:text-8xl font-serif tracking-tight text-slate-900 mb-4 md:mb-6 max-w-4xl px-2">
          {dict.heroTitle1}<br/>
          <span className="text-3xl md:text-5xl lg:text-7xl block mt-2 text-rose-500">{dict.heroTitle2}</span>
        </h1>

        <div className="flex flex-col items-center mb-6 md:mb-8 max-w-3xl">
          <p className="text-sm md:text-xl text-slate-600 font-light leading-relaxed mx-auto px-4">
            {dict.heroSubtitle}
          </p>
        </div>

          {/* Airbnb-style white search bar */}
          <div className="w-full max-w-2xl relative mt-4 md:mt-0">
            <form
              onSubmit={handleSearch}
              className="w-full bg-slate-50 rounded-2xl md:rounded-full shadow-[0_2px_20px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-stretch md:items-center gap-2 p-2 border border-slate-200 relative z-20"
            >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)} // delay to allow click
              placeholder={dict.searchPlaceholder}
              className="bg-transparent border-none text-slate-900 focus:outline-none focus:ring-0 w-full px-4 py-3 text-sm md:text-base placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-rose-600 text-white font-semibold rounded-xl md:rounded-full px-4 md:px-6 py-3 flex items-center gap-2 hover:bg-rose-700 transition-colors shrink-0 disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto md:min-w-[140px] justify-center"
            >
              {isSearching ? (
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden md:inline">{dict.working}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm">
                  <span className="hidden md:inline">{dict.search}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
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

        {/* Quick search pills */}
        <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 max-w-4xl px-2">
          {[
            { icon: <Utensils className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" />, text: dict.pills.dining },
            { icon: <Bed className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" />, text: dict.pills.stays },
            { icon: <Leaf className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" />, text: dict.pills.wellness },
            { icon: <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" />, text: dict.pills.spiritual },
            { icon: <Palette className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" />, text: dict.pills.artisan },
            { icon: <Compass className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-500" />, text: dict.pills.tours },
          ].map(({ icon, text }, index) => (
            <button
              key={text}
              type="button"
              disabled={isSearching}
              onClick={() => handleSearch(undefined, text)}
              className={`bg-white/80 backdrop-blur-sm border border-gray-200 text-slate-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 ${index >= 4 ? 'max-md:hidden' : ''}`}
            >
              {icon} <span>{text}</span>
            </button>
          ))}
        </div>

        {/* Popular Itineraries */}
        <div className="mt-12 w-full max-w-5xl px-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 md:mb-6 text-left pl-2">{dict.popularItineraries}</h2>
          <ScrollCarousel className="pb-4">
            {[
              { id: "cusco-city-tour", title: dict.trips.cusco, image: "/images/boleto/sacsayhuaman.jpg" },
              { id: "ultimate-inca-ruins", title: dict.trips.ruins, image: "/images/boleto/ollantaytambo-ruins.jpg" },
              { id: "top-7-culinary-route", title: dict.trips.culinary, image: "/images/dummy/ceviche.jpg" },
              { id: "maras-moray", title: dict.trips.maras, image: "/images/boleto/moray.jpg" },
            ].map(trip => (
              <div
                key={trip.id}
                onClick={() => router.push(`${langPrefix}/itinerary/${trip.id}`)}
                className="min-w-[260px] bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col snap-center shrink-0 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="h-32 bg-slate-100 rounded-xl mb-4 relative overflow-hidden">
                  <Image
                    src={trip.image}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 260px, 260px"
                  />
                </div>
                <h3 className="font-bold text-lg mb-4 text-slate-900 line-clamp-1">{trip.title}</h3>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`${langPrefix}/explore?trip=${trip.id}`); }}
                    className="flex-1 bg-white border border-rose-200 text-rose-600 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="w-4 h-4" />
                    Map
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`${langPrefix}/itinerary/${trip.id}`); }}
                    className="flex-1 bg-rose-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-4 h-4" />
                    AI Guide
                  </button>
                </div>
              </div>
            ))}
          </ScrollCarousel>
        </div>

        {/* Travel Guides Carousel */}
        <div className="mt-8 w-full max-w-5xl px-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 md:mb-6 text-left pl-2">Essential Travel Guides</h2>
          <ScrollCarousel className="pb-4">
            {[
              { slug: "acclimating-altitude", title: "How to Acclimate to Altitude", image: "/images/boleto/sacsayhuaman.jpg" },
              { slug: "packing-sacred-valley", title: "Packing List for the Sacred Valley", image: "/images/boleto/moray.jpg" },
              { slug: "boleto-turistico-explained", title: "Understanding the Boleto Turistico", image: "/images/boleto/cosituc-ticket-office.jpg" },
              { slug: "best-time-machu-picchu", title: "Best Time to Visit Machu Picchu", image: "/images/dummy/aguas-calientes.jpg" },
            ].map(guide => (
              <div
                key={guide.slug}
                className="min-w-[240px] bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col snap-center shrink-0 cursor-pointer hover:shadow-md transition-all"
                onClick={() => router.push(`${langPrefix}/guides/${guide.slug}`)}
              >
                <div className="h-28 bg-slate-50 border border-slate-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <Compass className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="font-bold text-md mb-2 text-slate-900 line-clamp-2">{guide.title}</h3>
                <div className="flex gap-2 mt-auto pt-2">
                  <span className="text-rose-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    Read Guide <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </ScrollCarousel>
        </div>
      </motion.div>
    </div>
  )
}
