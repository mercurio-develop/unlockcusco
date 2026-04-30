"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Mountain, Clock, Map } from "lucide-react"
import { architectPath } from "@/paths"

export function ArchitectCta() {
  const router = useRouter()

  return (
    <section className="relative w-full py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Huge Typography */}
          <div className="max-w-2xl">
            <span className="text-rose-600 font-bold tracking-[0.2em] uppercase text-xs mb-6 block">
              The Journey Architect
            </span>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-serif tracking-tight text-slate-900 leading-[1.1] mb-8">
              Craft the expedition, <br/>
              <span className="text-slate-400 italic">not just the itinerary.</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-10 font-light">
              Most travelers arrive in the Andes and succumb to altitude sickness or tourist traps. We act as your Logistics Shield—securing your tickets, managing your altitude pacing, and ensuring frictionless certainty before you even pack your bags.
            </p>
            <button
              onClick={() => router.push(architectPath())}
              className="group inline-flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-full font-medium hover:bg-rose-600 transition-colors duration-500"
            >
              Begin Architecting
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>

          {/* Right Column: Minimalist Features */}
          <div className="flex flex-col gap-10 border-l border-gray-100 pl-8 lg:pl-12">
            
            <div className="group cursor-default">
              <Mountain className="w-6 h-6 text-slate-300 mb-4 group-hover:text-rose-500 transition-colors duration-500" />
              <h3 className="text-xl font-serif text-slate-900 mb-2">Altitude Protection</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light">
                We safely guide your descent into the lower Sacred Valley first, ensuring your body acclimatizes peacefully before you ascend to Cusco.
              </p>
            </div>

            <div className="w-12 h-px bg-gray-100" />

            <div className="group cursor-default">
              <Clock className="w-6 h-6 text-slate-300 mb-4 group-hover:text-rose-500 transition-colors duration-500" />
              <h3 className="text-xl font-serif text-slate-900 mb-2">The 1-2-1 Rhythm</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light">
                Every day follows a balanced cadence: one morning expedition, deep mid-day cultural immersion, and an evening of pure sanctuary.
              </p>
            </div>

            <div className="w-12 h-px bg-gray-100" />

            <div className="group cursor-default">
              <Map className="w-6 h-6 text-slate-300 mb-4 group-hover:text-rose-500 transition-colors duration-500" />
              <h3 className="text-xl font-serif text-slate-900 mb-2">Elite Local Agencies</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-light">
                We partner exclusively with high-quality, rigorously vetted local agencies. From private sanctuaries to trusted transit, everything is securely reserved so you can just enjoy the escape.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
