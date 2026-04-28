"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Smartphone, CheckCircle2, ArrowLeft, QrCode, Building, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { claimBusiness } from "@/app/actions/claim-business"

type Business = {
  id: string
  slug: string
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

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    await claimBusiness(business.id)
    setIsProcessing(false)
    setIsSuccess(true)
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
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Profile Activated</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your profile for <strong>{business.name}</strong> is now verified and online. The client has been notified and contact details are unlocked.
          </p>
          <Button className="w-full bg-slate-900 text-white rounded-xl py-6 hover:bg-slate-800" onClick={() => window.location.href = `/dashboard?businessId=${business.id}`}>
            Go to Dashboard
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Complete Activation</h1>
          <p className="mt-3 text-lg text-slate-600">Activate your profile for <strong>{business.name}</strong> to receive direct bookings commission-free.</p>
        </div>

        <Card className="p-6 rounded-3xl bg-slate-50 border-none shadow-inner">
          <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            Plan Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <p className="font-medium text-slate-900">INKAPORTAL Premium Subscription</p>
                <p className="text-sm text-slate-500">14-day free trial</p>
              </div>
              <p className="font-bold text-slate-900">S/ 0.00</p>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <p className="font-medium text-slate-900">Identity Validation</p>
                <p className="text-sm text-slate-500">One-time payment, non-refundable</p>
              </div>
              <p className="font-bold text-slate-900">S/ 5.00</p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <p className="font-bold text-lg text-slate-900">Total Due Today</p>
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
              <h2 className="text-xl font-bold text-slate-900 mb-6">Select a payment method</h2>
              
              <button
                onClick={() => setMethod("yape")}
                className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-slate-100 hover:border-[#742183] hover:bg-[#742183]/5 transition-all group bg-white shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#742183] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#742183] transition-colors">Yape or Plin</h3>
                    <p className="text-sm text-slate-500">Peru only (100% digital QR)</p>
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
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">Credit / Debit Card</h3>
                    <p className="text-sm text-slate-500">International payments (Stripe)</p>
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
                <ArrowLeft className="w-4 h-4" /> Back to payment methods
              </button>

              {method === "yape" && (
                <Card className="p-8 rounded-3xl bg-white border-slate-100 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#742183]/5 rounded-bl-full -z-10"></div>
                  
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-[#742183] text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Scan with Yape or Plin</h3>
                      <p className="text-slate-600 mt-2">Exact amount: <strong>S/ 5.00</strong></p>
                    </div>
                    
                    {/* Placeholder for real QR code */}
                    <div className="w-48 h-48 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center p-4">
                      <div className="text-slate-400 text-sm font-medium opacity-60 flex flex-col items-center">
                        <QrCode className="w-10 h-10 mb-2" />
                        [Yape QR Here]
                      </div>
                    </div>

                    <form onSubmit={handleSimulatePayment} className="w-full space-y-4 pt-4">
                      <div className="space-y-2 text-left">
                        <Label htmlFor="yape-ref" className="text-slate-700">Operation Number (Optional)</Label>
                        <Input id="yape-ref" placeholder="e.g. 123456789" className="rounded-xl py-6" />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full bg-[#742183] hover:bg-[#5b1966] text-white py-6 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20"
                      >
                        {isProcessing ? "Verifying Payment..." : "I have paid"}
                      </Button>
                    </form>
                  </div>
                </Card>
              )}

              {method === "card" && (
                <Card className="p-8 rounded-3xl bg-white border-slate-100 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <CreditCard className="w-6 h-6 text-slate-900" />
                    <h3 className="text-2xl font-bold text-slate-900">Card Payment</h3>
                  </div>

                  <form onSubmit={handleSimulatePayment} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="cc-name" className="text-slate-700">Name on card</Label>
                      <Input id="cc-name" placeholder="e.g. John Doe" required className="rounded-xl py-6" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cc-number" className="text-slate-700">Card Number</Label>
                      <Input id="cc-number" placeholder="0000 0000 0000 0000" required className="rounded-xl py-6 font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cc-exp" className="text-slate-700">Expiration</Label>
                        <Input id="cc-exp" placeholder="MM/YY" required className="rounded-xl py-6 font-mono" />
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
                      {isProcessing ? "Processing..." : <>Pay S/ 5.00 <Send className="w-4 h-4" /></>}
                    </Button>
                  </form>
                  
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Lock className="w-3 h-3" />
                    Secure payments processed by Stripe
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