"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AgencyTripBuilder() {
  const router = useRouter()
  const [packages, setPackages] = useState<any[]>([])
  const [tripDays, setTripDays] = useState([{ day: 1, packageId: "", startTime: "08:00 AM", meetingPoint: "", guideNotes: "" }])
  const [title, setTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch available TourPackages (Lego Bricks) on mount
  useEffect(() => {
    // In a real app, this would be a server action fetch
    // setPackages(fetchedPackages)
  }, [])

  const addDay = () => {
    setTripDays([...tripDays, { day: tripDays.length + 1, packageId: "", startTime: "08:00 AM", meetingPoint: "", guideNotes: "" }])
  }

  const handlePublish = async () => {
    setIsGenerating(true)
    // 1. Post to API to save Trip, associate Agency, generate random string shareToken
    // 2. Set status to PROPOSED
    const mockToken = "tx_" + Math.random().toString(36).substring(2, 8)
    setTimeout(() => {
      router.push(`/trip/${mockToken}`)
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left Panel - Tour Packages */}
      <div className="w-1/3 border-r border-gray-200 bg-white p-6 overflow-y-auto">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Vallecito Bricks</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
            <h3 className="font-semibold text-slate-900">The Altitude Descent</h3>
            <p className="text-xs text-slate-500 mt-1">EAST_VALLEY • SLOW • $150</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-xl bg-slate-50">
            <h3 className="font-semibold text-slate-900">The Adrenaline Plateau</h3>
            <p className="text-xs text-slate-500 mt-1">URUBAMBA • FAST • $185</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Timeline Canvas */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Trip Title</label>
            <input 
              type="text" 
              placeholder="e.g. The Jenkins Family Adventure"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full mt-2 text-3xl font-serif font-bold bg-transparent border-none outline-none placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-6">
            {tripDays.map((day, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-900 mb-4">Day {day.day}</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Start Time</label>
                      <input type="time" defaultValue="08:00" className="w-full mt-1 p-2 bg-slate-50 border border-gray-100 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Meeting Point</label>
                      <input type="text" placeholder="e.g. Hotel Lobby" className="w-full mt-1 p-2 bg-slate-50 border border-gray-100 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium">Guide Notes (Client Visible)</label>
                    <textarea placeholder="e.g. Bring your physical passport for the Boleto Turístico." className="w-full mt-1 p-3 bg-slate-50 border border-gray-100 rounded-lg text-sm resize-none h-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={addDay} className="px-6 py-3 bg-white border border-gray-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
              + Add Day
            </button>
            <button onClick={handlePublish} disabled={isGenerating} className="flex-1 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center">
              {isGenerating ? "Generating..." : "Generate Client Magic Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}