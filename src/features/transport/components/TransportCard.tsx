"use client"

import { Star, MapPin, Phone, CalendarPlus, Users, Car } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Transport } from "@prisma/client"
import { Button } from "@/components/ui/button"

export function TransportCard({ transport }: { transport: Transport }) {
  const router = useRouter()

  const zones: string[] = (() => {
    try {
      return JSON.parse(transport.serviceZones || "[]")
    } catch {
      return []
    }
  })()

  const handleAddToPlanner = (e: React.MouseEvent) => {
    e.stopPropagation()
    const prompt = `I want to book transport with ${transport.name}. Please add this to my planner and let me set a time to check availability.`
    router.push(`/explore?ai_prompt=${encodeURIComponent(prompt)}`)
  }

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!transport.whatsapp) return
    const msg = encodeURIComponent(`Hello ${transport.name}! I found you on Vallecito and I'd like to inquire about your transport services.`)
    window.open(`https://wa.me/${transport.whatsapp.replace(/\D/g, '')}?text=${msg}`, "_blank")
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-500">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {transport.imageUrl ? (
          <img 
            src={transport.imageUrl} 
            alt={transport.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Car className="w-12 h-12" />
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-900">{transport.rating || "New"}</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">
            {transport.vehicleType}
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Up to {transport.capacity} Pax</span>
        </div>
        
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
          {transport.name}
        </h3>

        {/* Zones */}
        {zones.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {zones.map(z => (
              <span key={z} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
                <MapPin className="w-2.5 h-2.5 text-rose-500" />{z}
              </span>
            ))}
          </div>
        )}

        {/* Pricing */}
        {transport.basePriceUsd && (
          <div className="mb-6">
            <span className="text-sm text-slate-400 font-medium">From </span>
            <span className="text-2xl font-serif font-bold text-slate-900">${transport.basePriceUsd}</span>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex gap-2">
          <Button
            onClick={handleContact}
            variant="outline"
            className="flex-1 bg-white text-slate-900 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold rounded-xl transition-all py-5 text-sm"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact
          </Button>
          <Button
            onClick={handleAddToPlanner}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all py-5 text-sm"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Book
          </Button>
        </div>
      </div>
    </div>
  )
}
