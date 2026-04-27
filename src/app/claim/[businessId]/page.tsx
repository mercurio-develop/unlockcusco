import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, TrendingUp, Lock, ArrowRight, Star } from "lucide-react"

const prisma = new PrismaClient()

interface ClaimPageProps {
  params: Promise<{ businessId: string }>
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { businessId } = await params
  
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    notFound()
  }

  // Redirect if already claimed
  if (business.isClaimed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Perfil Verificado</h2>
          <p className="text-slate-600">Este perfil ya ha sido reclamado y está activo recibiendo reservas directas.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Urgent Header */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex gap-4 items-start">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-red-800 font-bold text-lg">Acción Requerida: Cliente en Espera</h2>
            <p className="text-red-700 text-sm mt-1">Un turista internacional intentó contactar a <strong>{business.name}</strong> hace unos minutos, pero su perfil figura como "No Verificado".</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Main Value Prop */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                No pierdas más clientes en el Valle Sagrado.
              </h1>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                InkaPortal es el directorio potenciado por IA que usan los turistas para planear su viaje. Reclama tu perfil ahora para desbloquear el contacto del cliente y activar el botón de "Reserva Inmediata".
              </p>
            </div>

            <Card className="p-6 border-indigo-100 shadow-lg bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                NUEVO LEAD
              </div>
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-slate-400" />
                Detalles de la Reserva Ocultos
              </h3>
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-slate-500">Nombre del Turista:</span>
                  <span className="font-medium text-slate-900">Sarah J********</span>
                </div>
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-slate-500">Fecha de Interés:</span>
                  <span className="font-medium text-slate-900">15 de Mayo, 2026</span>
                </div>
                <div className="flex justify-between items-center blur-sm select-none">
                  <span className="text-slate-500">Categoría:</span>
                  <span className="font-medium text-slate-900">{business.category}</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6 shadow-xl transition-transform hover:scale-[1.02]">
                  Reclamar Perfil y Ver Contacto
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-slate-500 mt-3">Prueba gratis por 30 días. Luego s/49 al mes.</p>
              </div>
            </Card>
          </div>

          {/* Business Preview Sidebar */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Así te ven los turistas hoy</h3>
            <Card className="overflow-hidden relative opacity-75 grayscale-[30%] pointer-events-none">
              <div className="absolute inset-0 bg-white/20 z-10 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="secondary" className="bg-white/90 text-slate-800 shadow-lg border-red-200 text-xs uppercase tracking-widest font-bold">
                  No Verificado
                </Badge>
              </div>
              
              <img
                src={business.imageUrl}
                alt={business.name}
                className="object-cover h-40 w-full"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg line-clamp-1">{business.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{business.category}</p>
                {business.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{business.rating}</span>
                    <span className="text-xs text-gray-500">({business.reviewsCount})</span>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4" disabled>
                  Consultar Disponibilidad
                </Button>
              </div>
            </Card>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Aumenta tus Ventas</h4>
                  <p className="text-xs text-slate-600 mt-1">Conecta directamente por WhatsApp con turistas de alto valor sin comisiones por reserva.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}