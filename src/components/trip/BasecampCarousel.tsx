"use client"

import { useState } from "react"
import { Moon, Star, ShieldCheck, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { useItinerary } from "@/lib/store/itinerary-context"

interface Basecamp {
  id: string
  name: string
  image: string
  rating: number
  price: number
  tags: string[]
  lat: number
  lng: number
  locationSlug: string
}

export function BasecampCarousel({ locationTown }: { locationTown: string }) {
  const { selectBasecamp } = useItinerary()

  // Placeholder mock data for hotels
  const mockHotels: Basecamp[] = [
    {
      id: "hotel-1",
      name: "Tambo del Inka Resort",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
      rating: 4.9,
      price: 450,
      tags: ["Riverside", "Spa", "Private Train"],
      lat: -13.3135,
      lng: -72.1158,
      locationSlug: "urubamba"
    },
    {
      id: "hotel-2",
      name: "Explora Sacred Valley",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
      rating: 4.8,
      price: 600,
      tags: ["All-Inclusive", "Remote", "Luxury"],
      lat: -13.3100,
      lng: -72.0800,
      locationSlug: "urubamba"
    },
    {
      id: "hotel-3",
      name: "Inkaterra Hacienda Urubamba",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800",
      rating: 4.9,
      price: 520,
      tags: ["Eco-Luxury", "Farm-to-Table", "Views"],
      lat: -13.3150,
      lng: -72.1200,
      locationSlug: "urubamba"
    }
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Moon className="w-4 h-4 text-rose-500" />
          Verified Basecamps in {locationTown}
        </h4>
        <span className="text-[10px] font-bold text-slate-500 uppercase">Swipe to explore</span>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {mockHotels.map((hotel) => (
          <div 
            key={hotel.id}
            className="flex-none w-[260px] snap-start group"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-rose-500/50 transition-all">
              {/* Image Placeholder */}
              <div className="h-32 bg-slate-800 relative">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Vallecito Verified
                </div>
              </div>
              
              <div className="p-4">
                <h5 className="text-white font-serif font-bold text-sm mb-1 line-clamp-1">{hotel.name}</h5>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-current" /> {hotel.rating}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    from <span className="text-white font-bold">${hotel.price}</span>/night
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {hotel.tags.map(tag => (
                    <span key={tag} className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <button 
                  onClick={() => selectBasecamp(hotel)}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  🛎️ Select Basecamp
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
