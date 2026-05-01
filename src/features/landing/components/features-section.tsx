"use client"

import { Shield, Activity, Lock, Smartphone, MapPin, Zap } from "lucide-react"

export function FeaturesSection() {
  return (
    <div className="bg-slate-50 py-24 sm:py-32 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:text-center mb-16 sm:mb-20">
          <h2 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4">
            The Vallecito Promise
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-serif">
            Plan with confidence.<br/>Travel without stress.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            We solve the fragmentation of Andean travel by giving you two powerful tools: a meticulous pre-trip designer to secure your core itinerary, and a live pocket fixer to eliminate on-the-ground stress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Pre-Trip */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-full bg-rose-50 p-4">
                <Shield className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">The Pre-Trip Designer</h3>
            </div>
            <p className="text-slate-600 mb-10 leading-relaxed text-lg">
              Used weeks in advance. We secure tickets, handle altitude pacing (start low, end high), and curate daily rhythms so everything is perfectly ready before you even pack your bags.
            </p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <Activity className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Altitude Protection</h4>
                  <p className="text-base text-slate-600 mt-2 leading-relaxed">We bypass the shock of Cusco by automatically routing your arrival into the oxygen-rich, peaceful elevations of the Sacred Valley so your body adapts naturally.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lock className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">The Logistics Shield</h4>
                  <p className="text-base text-slate-600 mt-2 leading-relaxed">Machu Picchu tickets sell out and mountain transit is chaotic. We bypass the bureaucracy to secure entries, sync trains, and dispatch pre-vetted elite agencies.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: On the Ground */}
          <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 shadow-xl border border-slate-800 text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-full bg-slate-800 p-4 border border-slate-700">
                <Smartphone className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">The Live Pocket Fixer</h3>
            </div>
            <p className="text-slate-300 mb-10 leading-relaxed text-lg">
              Used live, on the ground in Peru. Want to fill an afternoon gap? Need a trusted driver now? We provide instant solutions to real-time friction so you can travel without stress.
            </p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">Instant Adjustments</h4>
                  <p className="text-base text-slate-400 mt-2 leading-relaxed">Change of plans due to unexpected rain? Instantly pivot your itinerary with a single tap to find indoor cultural immersions or relaxing treatments nearby.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">Localized AI Discovery</h4>
                  <p className="text-base text-slate-400 mt-2 leading-relaxed">No more scattered TripAdvisor reviews. Find the best specialty coffee, trustworthy transit edges, and unlisted local sanctuaries right where you stand.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}