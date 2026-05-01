import { Car, MapPin, Phone } from "lucide-react"

export default function TransportDirectory() {
  const drivers = [
    {
      name: "Juan Perez - Urubamba",
      type: "Private Taxi (Sedan)",
      phone: "+51 987 654 321",
      routes: "Urubamba ↔ Cusco, Urubamba ↔ Ollantaytambo",
    },
    {
      name: "Asociación Valle Sagrado",
      type: "Combi (Shared)",
      phone: "Terminal Paradero",
      routes: "Cusco ↔ Calca ↔ Urubamba",
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Transport Directory</h1>
          <p className="text-lg text-slate-600">
            Trusted drivers and public transit routes across the Sacred Valley.
          </p>
        </header>

        <div className="space-y-6">
          {drivers.map((driver, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{driver.name}</h3>
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">{driver.type}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {driver.routes}
                </div>
              </div>
              
              <a 
                href={`https://wa.me/${driver.phone.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors shrink-0"
              >
                <Phone className="w-4 h-4" />
                {driver.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
