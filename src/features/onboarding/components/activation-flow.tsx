"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, UploadCloud, Smartphone, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { claimBusiness } from "@/features/onboarding/actions/claim-business"

type Business = {
  id: string
  slug: string
  name: string
}

interface ActivationFlowProps {
  business: Business
}

export function ActivationFlow({ business }: ActivationFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [whatsapp, setWhatsapp] = useState("")
  const [qrUploaded, setQrUploaded] = useState(false)

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate upload delay
    await new Promise((r) => setTimeout(r, 1000))
    
    try {
      await claimBusiness(
        business.id, 
        whatsapp, 
        qrUploaded ? "/images/yape-placeholder.png" : undefined
      )
      setIsSuccess(true)
    } catch (error) {
      console.error("Activation failed:", error)
      alert("Failed to activate profile. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="p-10 text-center rounded-3xl shadow-sm border border-slate-200 bg-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Profile Activated</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your profile for <strong>{business.name}</strong> is now verified. You can now receive direct bookings commission-free via WhatsApp!
          </p>
          <Button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl py-6 shadow-sm" 
            onClick={() => window.location.href = `/dashboard?businessId=${business.id}`}
          >
            Go to Dashboard
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          100% Free Forever
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-serif mb-3">Activate Your Profile</h1>
        <p className="text-lg text-slate-500 px-4">Complete your verification to start accepting direct, zero-commission bookings for <strong>{business.name}</strong>.</p>
      </div>

      <Card className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
        <form onSubmit={handleActivate} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="whatsapp" className="text-slate-700 font-medium">WhatsApp Number for Bookings</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-slate-400" />
              </div>
              <Input 
                id="whatsapp" 
                type="tel"
                placeholder="e.g. 987654321" 
                required 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="pl-12 rounded-xl py-6 bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-rose-500 placeholder:text-slate-400 text-lg" 
              />
            </div>
            <p className="text-xs text-slate-500">Tourists will message this number directly to book.</p>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">Your Yape QR Code (Optional)</Label>
            <div 
              onClick={() => setQrUploaded(!qrUploaded)}
              className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${qrUploaded ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
            >
              {qrUploaded ? (
                <>
                  <CheckCircle2 className="w-10 h-10 mb-3 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">QR Code Ready</span>
                  <span className="text-xs mt-1 text-emerald-600/60">Click to change</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 mb-3 text-slate-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700">Click to upload Yape QR</span>
                  <span className="text-xs mt-1 text-slate-400">PNG, JPG up to 5MB</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 text-center italic">We display this so tourists can pay you instantly via Yape.</p>
          </div>

          <Button 
            type="submit" 
            disabled={isProcessing || !whatsapp}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold text-lg shadow-md mt-4 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          >
            {isProcessing ? "Verifying & Activating..." : <>Activate Live Profile <ArrowRight className="w-5 h-5" /></>}
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Zero Commissions • Direct Access • Vallecito</p>
        </div>
      </Card>
    </div>
  )
}
