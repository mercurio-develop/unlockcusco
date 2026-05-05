"use client"

import { useState } from "react"
import { useBuilder } from "@/features/pro-builder/store/builder-context"
import { useRouter } from "next/navigation"
import { User, FileText, Lock, ChevronLeft, Sparkles, Loader2 } from "lucide-react"
import { generateProTrip } from "../actions/generate-trip"

export function CheckoutDetailsForm() {
  const { draftTrip, updateTripMeta, setViewState, resetBuilder } = useBuilder()
  const router = useRouter()
  
  const [name, setName] = useState(draftTrip.leadPax.name || "")
  const [email, setEmail] = useState(draftTrip.leadPax.email || "")
  const [phone, setPhone] = useState(draftTrip.leadPax.phone || "")
  
  const [clientNotes, setClientNotes] = useState(draftTrip.clientNotes || "")
  const [internalNotes, setInternalNotes] = useState(draftTrip.internalNotes || "")

  const [isGenerating, setIsGenerating] = useState(false)

  const isValid = name.trim() !== "" && email.includes("@")

  const handleMagicAutoFill = () => {
    setName("Robert Jenkins")
    setEmail("robert@example.com")
    setPhone("+1 555 0192")
    setClientNotes("Welcome to the Sacred Valley! Drink plenty of coca tea.")
    setInternalNotes("VIP Clients. Ensure champagne in room on arrival.")
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    updateTripMeta({
      leadPax: { name, email, phone },
      clientNotes,
      internalNotes
    })

    try {
      const result = await generateProTrip({
        ...draftTrip,
        leadPax: { name, email, phone },
        clientNotes,
        internalNotes
      })

      if (result.success) {
        resetBuilder()
        router.push(`/trip/${result.shareToken}`)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to generate trip. Please try again.")
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full flex bg-slate-50 min-h-[600px]">
      
      <div className="w-1/3 bg-slate-900 text-white p-8 overflow-y-auto border-r border-slate-800 hidden md:block">
        <h2 className="text-3xl font-serif font-bold mb-2 leading-tight">Finalizing</h2>
        <p className="text-slate-400 mb-8">{draftTrip.title}</p>
        
        <div className="space-y-4">
           <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
             <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-1">Total Days</p>
             <p className="font-medium text-white">{draftTrip.days.length} Days</p>
           </div>
           
           <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
             <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-1">Total Events</p>
             <p className="font-medium text-white">
               {draftTrip.days.reduce((acc, day) => acc + day.events.length, 0)} Timeline Blocks
             </p>
           </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-white relative">
        {isGenerating && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
            <h3 className="text-2xl font-serif text-slate-900 mb-2">Publishing Itinerary...</h3>
            <p className="text-slate-500 text-sm">Generating magic link for your client...</p>
          </div>
        )}

        <div className="max-w-xl mx-auto space-y-10 pb-20">
          
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-serif text-slate-900 mb-2">Passenger Details</h2>
              <p className="text-lg text-slate-500 font-light">Who is the primary contact for this proposal?</p>
            </div>
            <button 
              onClick={handleMagicAutoFill}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Fill
            </button>
          </div>

          <div className="space-y-8">
            <div className="group relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 transition-colors group-focus-within:text-rose-600">
                <User className="w-3.5 h-3.5 inline-block mr-1" /> Full Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full py-3 bg-transparent border-b-2 border-slate-200 text-2xl font-serif text-slate-900 focus:border-rose-600 outline-none transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="group relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 transition-colors group-focus-within:text-rose-600">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full py-3 bg-transparent border-b-2 border-slate-200 text-xl font-medium text-slate-900 focus:border-rose-600 outline-none transition-colors"
                />
              </div>
              <div className="group relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 transition-colors group-focus-within:text-rose-600">Phone / WhatsApp</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full py-3 bg-transparent border-b-2 border-slate-200 text-xl font-medium text-slate-900 focus:border-rose-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 space-y-10">
             <div className="group relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-rose-600">
                  <FileText className="w-3.5 h-3.5 inline-block mr-1" /> Client-Visible Notes
                </label>
                <textarea 
                  placeholder="e.g. Welcome to Peru! Please ensure your passports are valid for 6 months."
                  value={clientNotes}
                  onChange={e => setClientNotes(e.target.value)}
                  className="w-full py-3 bg-transparent border-b-2 border-slate-200 text-lg font-medium text-slate-900 focus:border-rose-600 outline-none transition-colors h-20 resize-none"
                />
             </div>

             <div className="group relative">
                <label className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-2 transition-colors group-focus-within:text-rose-700">
                  <Lock className="w-3.5 h-3.5 inline-block mr-1" /> Internal Business Notes (Hidden)
                </label>
                <textarea 
                  placeholder="e.g. VIP client. Promised complimentary bottle of wine at Tambo del Inka."
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  className="w-full py-3 bg-transparent border-b-2 border-rose-200 text-lg font-medium text-slate-900 focus:border-rose-600 outline-none transition-colors h-20 resize-none placeholder:text-rose-200"
                />
             </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-between items-center z-10">
          <button 
            onClick={() => setViewState('workspace')}
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase tracking-widest text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleGenerate}
            disabled={!isValid || isGenerating}
            className="flex items-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-5 h-5 text-rose-400" /> Publish & Generate Link
          </button>
        </div>

      </div>
    </div>
  )
}
