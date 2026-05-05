"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Mountain, Wine, Leaf, Compass, Heart } from "lucide-react"

export type Archetype = 'LIVING_CULTURE' | 'GASTRONOMIC' | 'LUXURY_WELLNESS' | 'SPIRITUAL' | 'MOUNTAIN_EXPLORER'

export interface ArchetypeSelectorProps {
  onComplete: (archetype: Archetype, intensity: number) => void
}

const ARCHETYPES: { id: Archetype, title: string, icon: React.ReactNode, description: string }[] = [
  { id: 'LIVING_CULTURE', title: 'Living Culture', icon: <Compass className="w-8 h-8 text-rose-500" />, description: 'Immerse in indigenous communities, textiles, and ancestral markets.' },
  { id: 'GASTRONOMIC', title: 'Gastronomic', icon: <Wine className="w-8 h-8 text-rose-500" />, description: 'Taste the Andes from street food to world-class dining like MIL.' },
  { id: 'LUXURY_WELLNESS', title: 'Luxury Wellness', icon: <Heart className="w-8 h-8 text-rose-500" />, description: 'Spas, hot springs, and absolute relaxation in the Sacred Valley.' },
  { id: 'SPIRITUAL', title: 'Spiritual Journey', icon: <Leaf className="w-8 h-8 text-rose-500" />, description: 'Coca readings, cacao ceremonies, and deep Andean mysticism.' },
  { id: 'MOUNTAIN_EXPLORER', title: 'Mountain Explorer', icon: <Mountain className="w-8 h-8 text-rose-500" />, description: 'Hikes, treks, and off-the-grid adventure in the high Andes.' },
]

export function ArchetypeSelector({ onComplete }: ArchetypeSelectorProps) {
  const [archetype, setArchetype] = useState<Archetype | null>(null)
  const [intensity, setIntensity] = useState<number | null>(null)

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <p className="text-rose-600 text-xs uppercase tracking-[0.3em] font-semibold mb-3">
          Design Your Narrative
        </p>
        <h2 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight mb-4">
          Select your travel archetype and your desired intensity level.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-16">
        {ARCHETYPES.map((a) => {
          const isSelected = archetype === a.id
          return (
            <div
              key={a.id}
              onClick={() => setArchetype(a.id)}
              className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 ${
                isSelected 
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-105" 
                  : "bg-white/60 backdrop-blur-md border-gray-200 text-slate-900 hover:border-rose-300 hover:shadow-md"
              }`}
            >
              <div className="mb-4">
                {a.icon}
              </div>
              <h3 className={`font-bold mb-2 ${isSelected ? "text-white" : "text-slate-900"}`}>{a.title}</h3>
              <p className={`text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{a.description}</p>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {archetype && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="flex flex-col items-center"
          >
            <h3 className="text-xl font-serif text-slate-900 mb-8">Select your Intensity Level</h3>
            <div className="flex w-full max-w-3xl gap-4 justify-between relative mb-12">
              {/* Line connector */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2" />
              
              {[
                { level: 1, label: 'Level 1: Accessible', desc: 'Relaxed, well-paved, standard comforts' },
                { level: 2, label: 'Level 2: Immersive', desc: 'Moderate activity, deeper cultural integration' },
                { level: 3, label: 'Level 3: The Edge', desc: 'High physical or cultural intensity, off-grid' },
              ].map((lvl) => {
                const isSelected = intensity === lvl.level
                return (
                  <div
                    key={lvl.level}
                    onClick={() => setIntensity(lvl.level)}
                    className={`cursor-pointer flex flex-col items-center flex-1 bg-white p-4 rounded-2xl border transition-all duration-300 ${
                      isSelected 
                        ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-105" 
                        : "border-gray-200 hover:border-rose-300"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3 ${isSelected ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {lvl.level}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{lvl.label}</h4>
                    <p className="text-xs text-slate-500 text-center mt-1">{lvl.desc}</p>
                  </div>
                )
              })}
            </div>
            
            <AnimatePresence>
              {intensity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <button
                    onClick={() => onComplete(archetype, intensity)}
                    className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all text-lg"
                  >
                    <Sparkles className="w-5 h-5 text-rose-400" />
                    Wake the Concierge
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
