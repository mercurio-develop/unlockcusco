"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Lock } from "lucide-react"
import { saveTravelerManifest } from "@/features/checkout/actions/save-travelers"

interface SecureManifestFormProps {
  tripId: string
  paxCount: number
  onComplete: () => void
}

export function SecureManifestForm({ tripId, paxCount, onComplete }: SecureManifestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Initialize state for each traveler
  const [travelers, setTravelers] = useState(() => 
    Array.from({ length: paxCount }).map(() => ({
      firstName: "",
      lastName: "",
      passportNumber: "",
      nationality: "",
      dateOfBirth: "",
      whatsappNumber: "",
      dietaryRestrictions: "",
      medicalNotes: ""
    }))
  )

  const updateTraveler = (index: number, field: string, value: string) => {
    setTravelers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await saveTravelerManifest(tripId, travelers)
      onComplete()
    } catch (err) {
      console.error("Failed to save manifest", err)
      // Provide user feedback here in real app
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 text-white mb-6 shadow-xl">
          <Shield className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4 tracking-tight">The Bureaucracy Shield</h2>
        <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto">
          Peru requires exact passport data to issue train and sanctuary tickets. Enter your details securely below, and we will bypass the government portals and handle all reservations for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {travelers.map((traveler, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60"
          >
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Passenger {idx + 1} {idx === 0 && <span className="ml-2 text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded-full uppercase tracking-wider">Lead Guest</span>}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">First Name</label>
                <input 
                  required
                  type="text" 
                  value={traveler.firstName}
                  onChange={(e) => updateTraveler(idx, 'firstName', e.target.value)}
                  placeholder="As it appears on passport"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Last Name</label>
                <input 
                  required
                  type="text" 
                  value={traveler.lastName}
                  onChange={(e) => updateTraveler(idx, 'lastName', e.target.value)}
                  placeholder="As it appears on passport"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Passport Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    required
                    type="text" 
                    value={traveler.passportNumber}
                    onChange={(e) => updateTraveler(idx, 'passportNumber', e.target.value)}
                    placeholder="🔒 Encrypted"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nationality</label>
                <input 
                  required
                  type="text" 
                  value={traveler.nationality}
                  onChange={(e) => updateTraveler(idx, 'nationality', e.target.value)}
                  placeholder="e.g. United States"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Date of Birth</label>
                <input 
                  required
                  type="date" 
                  value={traveler.dateOfBirth}
                  onChange={(e) => updateTraveler(idx, 'dateOfBirth', e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
              {idx === 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">WhatsApp Number</label>
                  <input 
                    required
                    type="tel" 
                    value={traveler.whatsappNumber}
                    onChange={(e) => updateTraveler(idx, 'whatsappNumber', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all mb-1"
                  />
                  <p className="text-[10px] text-slate-500 font-medium italic">For your 24/7 Live Pocket Fixer in Peru.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm font-bold text-slate-800 mb-4">Help us protect your health and tailor your dining.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Dietary Restrictions</label>
                  <textarea 
                    value={traveler.dietaryRestrictions}
                    onChange={(e) => updateTraveler(idx, 'dietaryRestrictions', e.target.value)}
                    placeholder="e.g. Vegan, Gluten-Free, Peanut Allergy"
                    rows={2}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Medical Notes</label>
                  <textarea 
                    value={traveler.medicalNotes}
                    onChange={(e) => updateTraveler(idx, 'medicalNotes', e.target.value)}
                    placeholder="e.g. Mild asthma, bad knees, alt sickness history"
                    rows={2}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="pt-8">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white text-lg font-bold py-5 rounded-2xl shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Securing...</span>
            ) : (
              <>
                <Lock className="w-5 h-5 text-rose-400" />
                Encrypt & Secure My Journey
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}