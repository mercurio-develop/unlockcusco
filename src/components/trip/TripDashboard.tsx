"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SecureManifestForm } from "@/components/checkout/SecureManifestForm"

interface TripDashboardProps {
  trip: any
}

export function TripDashboard({ trip }: TripDashboardProps) {
  const [isBookingMode, setIsBookingMode] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-32">
      {/* Hero Header */}
      <div className="bg-slate-900 px-6 py-16 text-center">
        <p className="text-rose-400 text-xs uppercase tracking-widest font-bold mb-4">
          Curated by {trip.agency?.name || "Vallecito"}
        </p>
        <h1 className="text-4xl md:text-5xl font-serif text-white">{trip.tripTitle}</h1>
      </div>

      <AnimatePresence mode="wait">
        {!isBookingMode && !isSuccess ? (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
              {trip.days.map((day: any) => (
                <div key={day.dayNumber} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative">
                  <div className="absolute -top-3 left-6 bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Day {day.dayNumber}
                  </div>
                  
                  <h3 className="text-xl font-serif font-bold text-slate-900 mt-4 mb-2">{day.tourPackage.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">{day.tourPackage.description}</p>

                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">🕒</span>
                      <span className="text-sm font-bold text-rose-900">{day.startTime} @ {day.meetingPoint}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-base">🗣️</span>
                      <p className="text-xs text-rose-800 italic leading-relaxed font-medium">
                        &quot;{day.guideNotes}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center pb-32">
              <button 
                onClick={() => setIsBookingMode(true)}
                className="bg-rose-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors flex items-center gap-3 text-lg"
              >
                <span className="text-xl">🛎️</span> Book & Secure This Expedition
              </button>
            </div>
          </motion.div>
        ) : isBookingMode && !isSuccess ? (
          <motion.div
            key="booking-form"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            <SecureManifestForm 
              tripId={trip.id || "mock-trip-123"} 
              paxCount={trip.paxCount || 1} 
              onComplete={() => setIsSuccess(true)} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center px-4"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Journey Secured</h2>
            <p className="text-slate-500 max-w-md">Your manifest is securely encrypted. We are now confirming your trains and sanctuary tickets.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
