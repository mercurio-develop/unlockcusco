"use client"

import { useState } from "react"
import { simulateDriverAccept, simulateDriverMessage, simulateRideComplete } from "@/features/sandbox/actions/simulate-webhooks"
import type { RideBooking, Driver, RideMessage } from "@prisma/client"

type RideWithDetails = RideBooking & { 
  driver: Driver | null; 
  messages: RideMessage[]; 
}

export function SandboxDashboard({ rides }: { rides: RideWithDetails[] }) {
  const [loading, setLoading] = useState(false)

  const handleAccept = async (id: string) => {
    setLoading(true)
    await simulateDriverAccept(id)
    setLoading(false)
  }

  const handleMessage = async (id: string) => {
    setLoading(true)
    await simulateDriverMessage(id, "I am outside in the silver Yaris.")
    setLoading(false)
  }

  const handleComplete = async (id: string) => {
    setLoading(true)
    await simulateRideComplete(id)
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-2">Ghost Phone Simulator</h1>
      <p className="text-slate-500 mb-8">Test the webhook responses without a real WhatsApp connection. Rides appear here when Stripe Holds are secured.</p>

      {rides.length === 0 ? (
        <div className="p-10 border-2 border-dashed border-gray-200 rounded-xl text-center text-slate-500">
          No active rides found. Request a taxi in the /explore chat to see it here.
        </div>
      ) : (
        <div className="space-y-6">
          {rides.map(ride => (
            <div key={ride.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{ride.pickupLocation} → {ride.dropoffLocation}</h3>
                  <p className="text-sm text-slate-500">Tourist: {ride.touristName} | Price: ${ride.priceUsd}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  ride.status === 'HOLD_SECURED' ? 'bg-amber-100 text-amber-800' :
                  ride.status === 'DRIVER_ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                  ride.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {ride.status}
                </div>
              </div>

              {ride.driver && (
                <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
                  <strong>Driver Assigned:</strong> {ride.driver.name} ({ride.driver.carModel} - {ride.driver.licensePlate})
                </div>
              )}

              {/* Chat Log Preview */}
              {ride.messages.length > 0 && (
                <div className="mb-4 space-y-2 max-h-32 overflow-y-auto border border-gray-100 p-2 rounded-lg bg-gray-50 text-sm">
                  {ride.messages.map((m: RideMessage) => (
                    <div key={m.id}>
                      <span className="font-bold">{m.sender}:</span> {m.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Simulator Actions */}
              <div className="flex gap-2 border-t border-gray-100 pt-4 mt-4">
                {ride.status === 'HOLD_SECURED' && (
                  <button 
                    onClick={() => handleAccept(ride.id)} 
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm disabled:opacity-50"
                  >
                    Simulate Driver &quot;ACCEPT&quot;
                  </button>
                )}
                {ride.status === 'DRIVER_ASSIGNED' && (
                  <>
                    <button 
                      onClick={() => handleMessage(ride.id)} 
                      disabled={loading}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50"
                    >
                      Simulate &quot;I am outside&quot; Msg
                    </button>
                    <button 
                      onClick={() => handleComplete(ride.id)} 
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-sm disabled:opacity-50 ml-auto"
                    >
                      Simulate Ride Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
