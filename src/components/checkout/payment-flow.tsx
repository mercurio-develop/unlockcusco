"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Smartphone, CheckCircle2, ArrowLeft, QrCode, Building, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

type Business = {
  id: string
  name: string
}

interface PaymentFlowProps {
  business: Business
}

type PaymentMethod = "yape" | "card" | null

export function PaymentFlow({ business }: PaymentFlowProps) {
  const [method, setMethod] = useState<PaymentMethod>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
    }, 2000)
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="p-10 text-center rounded-3xl shadow-xl border-slate-100 bg-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Perfil Activado</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Tu perfil para <strong>{business.name}</strong> está ahora verificado y en línea. El cliente ha sido notificado y el contacto ha sido desbloqueado.
          </p>
          <Button className="w-full bg-slate-900 text-white rounded-xl py-6 hover:bg-slate-800" onClick={() => window.location.href = "/dashboard"}>
            Ir al Panel de Control
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      
      {/* Left Column: Order Summary */}
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Completa tu Activación</h1>
          <p className="mt-3 text-lg text-slate-600">Activa tu perfil de <strong>{business.name}</strong> para recibir reservas directas sin comisiones.</p>
        </div>

        <Card className="p-6 rounded-3xl bg-slate-50 border-none shadow-inner">
          <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            Resumen del Plan
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <p className="font-medium text-slate-900">Suscripción Valle Premium</p>
                <p className="text-sm text-slate-500">Prueba gratuita por 14 días</p>
              </div>
              <p className="font-bold text-slate-900">S/ 0.00</p>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <p className="font-medium text-slate-900">Validación de Identidad</p>
                <p className="text-sm text-slate-500">Pago único, no reembolsable</p>
              </div>
              <p className="font-bold text-slate-900">S/ 5.00</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <p className="font-bold text-lg text-slate-900">Total a Pagar Hoy</p>
              <p className="font-extrabold text-2xl text-[#D4AF37]">S/ 5.00</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Payment Method Selection */}
      <div>
        <AnimatePresence mode="wait">
          {!method ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">Selecciona un método de pago</h2>
              
              <button
                onClick={() => setMethod("yape")}
                className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-slate-100 hover:border-[#742183] hover:bg-[#742183]/5 transition-all group bg-white shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#742183] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#742183] transition-colors">Yape o Plin</h3>
                    <p className="text-sm text-slate-500">Solo para Perú (QR 100% digital)</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-[#742183]"></div>
              </button>

              <button
                onClick={() => setMethod("card")}
                className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group bg-white shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">Tarjeta de Crédito / Débito</h3>
                    <p className="text-sm text-slate-500">Pagos internacionales (Stripe)</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-600"></div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button 
                onClick={() => setMethod(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a métodos de pago
              </button>

              {method === "yape" && (
                <Card className="p-8 rounded-3xl bg-white border-slate-100 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#742183]/5 rounded-bl-full -z-10"></div>
                  
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-[#742183] text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Escanea con Yape o Plin</h3>
                      <p className="text-slate-600 mt-2">Monto exacto: <strong>S/ 5.00</strong></p>
                    </div>
                    
                    {/* Placeholder for real QR code */}
                    <div className="w-48 h-48 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center p-4">
                      <div className="text-slate-400 text-sm font-medium opacity-60 flex flex-col items-center">
                        <QrCode className="w-10 h-10 mb-2" />
                        [QR de Yape Aquí]
                      </div>
                    </div>

                    <form onSubmit={handleSimulatePayment} className="w-full space-y-4 pt-4">
                      <div className="space-y-2 text-left">
                        <Label htmlFor="yape-ref" className="text-slate-700">Número de Operación (Opcional)</Label>
                        <Input id="yape-ref" placeholder="Ej. 123456789" className="rounded-xl py-6" />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-[#742183] hover:bg-[#5b1966] text-white py-6 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20"
                      >
                        {isProcessing ? "Verificando Pago..." : "Ya realicé el pago"}
                      </Button>
                    </form>
                  </div>
                </Card>
              )}

              {method === "card" && (
                <Card className="p-8 rounded-3xl bg-white border-slate-100 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <CreditCard className="w-6 h-6 text-slate-900" />
                    <h3 className="text-2xl font-bold text-slate-900">Pago con Tarjeta</h3>
                  </div>

                  <form onSubmit={handleSimulatePayment} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="cc-name" className="text-slate-700">Nombre en la tarjeta</Label>
                      <Input id="cc-name" placeholder="Ej. Juan Pérez" required className="rounded-xl py-6" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cc-number" className="text-slate-700">Número de Tarjeta</Label>
                      <Input id="cc-number" placeholder="0000 0000 0000 0000" required className="rounded-xl py-6 font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cc-exp" className="text-slate-700">Vencimiento</Label>
                        <Input id="cc-exp" placeholder="MM/AA" required className="rounded-xl py-6 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cc-cvc" className="text-slate-700">CVC</Label>
                        <Input id="cc-cvc" placeholder="123" required className="rounded-xl py-6 font-mono" />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold text-lg shadow-lg mt-4 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? "Procesando..." : <>Pagar S/ 5.00 <Send className="w-4 h-4" /></>}
                    </Button>
                  </form>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Lock className="w-3 h-3" />
                    Pagos seguros procesados por Stripe
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Lock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
