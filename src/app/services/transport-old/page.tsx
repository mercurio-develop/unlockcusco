"use client"

import { Car, MapPin, Phone, CalendarPlus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TransportDirectory() {
  const router = useRouter()

  const drivers = [
    {
      id: "taxi-juan",
      name: "Juan Perez - Urubamba",
      type: "Private Taxi (Sedan)",
      phone: "+51 987 654 321",
      routes: "Urubamba ↔ Cusco, Urubamba ↔ Ollantaytambo",
    },
    {
      id: "combi-valle",
      name: "Asociación Valle Sagrado",
      type: "Combi (Shared)",
      phone: "Terminal Paradero",
      routes: "Cusco ↔ Calca ↔ Urubamba",
    }
  ]

  const handleAddToPlanner = (driverName: string) => {
    const prompt = `I want to book a taxi with ${driverName}. Please add this to my planner and let me set a time to check availability.`
    router.push(`/explore?ai_prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Business Directory</h1>
          <p className="text-lg text-slate-600">
            Trusted drivers and public transit routes across the Sacred Valley.
          </p>
        </header>

        <div className="space-y-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{driver.name}</h3>
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">{driver.type}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm mb-4 md:mb-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {driver.routes}
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <a 
                  href={`https://wa.me/${driver.phone.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-medium hover:bg-slate-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Contact
                </a>
                <button
                  onClick={() => handleAddToPlanner(driver.name)}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Book via Planner
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
