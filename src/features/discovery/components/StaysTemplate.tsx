import { Bed, Wifi, Coffee, MapPin, Wind, Sparkles } from "lucide-react"
import type { Business, BusinessService } from "@prisma/client"

interface StaysTemplateProps {
  business: Business & { services: BusinessService[] }
}

export function StaysTemplate({ business }: StaysTemplateProps) {
  const rooms = business.services || []

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Bed className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif text-white">Accommodations</h2>
            <p className="text-white/50 text-sm">Rest in the heart of the Sacred Valley</p>
          </div>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
            <Wifi className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Free WiFi</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Breakfast</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
            <Wind className="w-5 h-5 text-sky-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Heating</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Central</span>
          </div>
        </div>

        <div className="grid gap-6">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.id} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/[0.08] hover:border-indigo-600/30">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
                      {room.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                      {room.description || "A comfortable space designed for rest and acclimatization."}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-white/40">
                      {room.priceUsd > 100 && (
                        <span className="flex items-center gap-1.5 bg-indigo-600/20 text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-600/30">
                          <Sparkles className="w-3.5 h-3.5" /> Premium Suite
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-serif text-indigo-400 font-bold shrink-0">
                    ${room.priceUsd}
                    <span className="text-xs text-white/40 font-sans block text-right mt-1 font-normal">/ night</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-white/40">Room details are being updated. Check availability for more info.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
