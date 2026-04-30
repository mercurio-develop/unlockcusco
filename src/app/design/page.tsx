"use client"

import { useState } from "react"
import { JourneyArchitect } from "@/features/wizard/components/JourneyArchitect"
import { Sparkles, Map, Compass, ShieldCheck } from "lucide-react"

export default function DesignPage() {
  const [isStarted, setIsStarted] = useState(false)

  if (isStarted) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-rose-600 text-xs uppercase tracking-[0.3em] font-semibold mb-3">
              Vallecito Expeditions
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight mb-4">
              Design Your Dream Journey
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Craft a once-in-a-lifetime expedition through the heart of the Andes.
            </p>
          </div>
          <JourneyArchitect />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <p className="text-rose-600 text-xs uppercase tracking-[0.3em] font-semibold mb-4">
            The Vallecito Method
          </p>
          <h1 className="text-5xl md:text-6xl font-serif text-slate-900 tracking-tight mb-6 leading-tight">
            Craft the Expedition <br /> of a Lifetime.
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Your journey to the Andes should be effortless and awe-inspiring. We seamlessly pace your adventure so you can acclimatize naturally, avoid the crowds, and immerse yourself in hidden local sanctuaries for a truly authentic experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <ShieldCheck className="w-8 h-8 text-rose-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Effortless Acclimatization</h3>
            <p className="text-sm text-slate-600">
              We begin your adventure in the gentle embrace of the Sacred Valley (9,000ft), ensuring a smooth, relaxing transition to the altitude before you explore the heights of Cusco.
            </p>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <Compass className="w-8 h-8 text-rose-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">The Perfect Rhythm</h3>
            <p className="text-sm text-slate-600">
              Your days flow with an unhurried, balanced cadence: an inspiring morning expedition, an authentic mid-day cultural immersion, and an evening of pure relaxation and sanctuary.
            </p>
          </div>
        </div>

        <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button
            onClick={() => setIsStarted(true)}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all text-lg"
          >
            <Sparkles className="w-5 h-5 text-rose-400" />
            Begin Your Journey
          </button>
          <p className="mt-4 text-sm text-slate-400">Takes less than 60 seconds.</p>
        </div>
      </div>
    </div>
  )
}
