"use client"

import { Star, MapPin, Phone } from "lucide-react"
import type { Business } from "@prisma/client"
import { trackWhatsappClick } from "@/features/business/actions/track-click"

const CATEGORY_ICON: Record<string, string> = {
  Taxi:       "🚕",
  Guide:      "🧭",
  Therapist:  "💆",
  Agency:     "🏢",
}

export function ServiceCard({ business }: { business: Business }) {
  const zones: string[] = (() => {
    try { return JSON.parse((business as any).serviceZones ?? "[]") } catch { return [] }
  })()

  const icon = CATEGORY_ICON[business.category] ?? "🛎️"

  const handleContact = async () => {
    if (!business.whatsapp) return
    await trackWhatsappClick(business.id)
    const msg = encodeURIComponent(`Hello ${business.name}! I found you on Vallecito and I'd like to inquire about your services.`)
    window.open(`https://wa.me/51${business.whatsapp}?text=${msg}`, "_blank")
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-2">{business.name}</h3>
          <p className="text-xs text-rose-600 font-medium mt-0.5">{business.category}</p>
        </div>
        {business.rating !== null && business.rating !== undefined && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
            <span className="text-sm font-semibold text-slate-900">{business.rating}</span>
          </div>
        )}
      </div>

      {/* Zones */}
      {zones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {zones.slice(0, 4).map(z => (
            <span key={z} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-lg capitalize">
              <MapPin className="w-2.5 h-2.5" />{z}
            </span>
          ))}
          {zones.length > 4 && <span className="text-[11px] text-slate-400 font-medium self-center">+{zones.length - 4}</span>}
        </div>
      )}

      {/* CTA */}
      {business.whatsapp ? (
        <button
          onClick={handleContact}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Phone className="w-3.5 h-3.5" /> Contact via WhatsApp
        </button>
      ) : (
        <div className="w-full text-center text-xs text-slate-400 py-2 border border-dashed border-gray-200 rounded-xl">
          Contact info unavailable
        </div>
      )}
    </div>
  )
}
