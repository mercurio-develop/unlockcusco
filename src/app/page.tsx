import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Map, Sparkles, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-indigo-600 font-medium text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Inka-Portal IA</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight">
          Descubre la Magia del <span className="text-indigo-600">Valle Sagrado</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Encuentra los mejores restaurantes, spas, y aventuras. Nuestro conserje con Inteligencia Artificial planeará tu día perfecto.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/explore">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-full shadow-xl transition-transform hover:scale-105 w-full sm:w-auto">
              Explorar el Valle
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Map className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Directorio Completo</h3>
            <p className="text-slate-600 mt-2 text-sm">Desde Urubamba hasta Pisac y Ollantaytambo.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="bg-indigo-100 p-3 rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Conserje IA</h3>
            <p className="text-slate-600 mt-2 text-sm">Pregunta lo que sea y recibe itinerarios personalizados.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <ArrowRight className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Reserva Directa</h3>
            <p className="text-slate-600 mt-2 text-sm">Contacta a los negocios locales directamente por WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  )
}