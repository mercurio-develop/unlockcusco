"use client"

import { useState } from "react"
import { Send, CheckCircle2, MessageCircle } from "lucide-react"
import { sendAvailabilityRequest } from "../actions/send-availability-request"

export function AvailabilityForm({ 
  agencyId, 
  agencyName, 
  agencyEmail, 
  whatsapp, 
  packages 
}: { 
  agencyId: string;
  agencyName: string;
  agencyEmail?: string;
  whatsapp: string;
  packages: any[];
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formData, setForm] = useState({
    userName: "",
    userWhatsapp: "",
    date: "",
    experienceId: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    const selectedPkg = packages.find(p => p.id === formData.experienceId)
    
    const result = await sendAvailabilityRequest({
      agencyId,
      agencyName,
      agencyEmail: agencyEmail || "reservas@jaguarllaqta.com",
      experienceTitle: selectedPkg?.title || "General Inquiry",
      ...formData
    })

    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  const handleWhatsApp = () => {
    const selectedPkg = packages.find(p => p.id === formData.experienceId)
    const msg = encodeURIComponent(
      `Hello ${agencyName}! 👋 I'm interested in the "${selectedPkg?.title || 'Expedition'}" experience on ${formData.date || 'TBD'}. My name is ${formData.userName}.`
    )
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${msg}`, "_blank")
  }

  if (status === 'success') {
    return (
      <section className="bg-[var(--primary)] py-24 px-6 md:px-12 rounded-[3rem] mx-6 mb-12 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-[var(--font-display)] font-bold mb-4">Request Sent</h2>
          <p className="text-slate-400 leading-relaxed">
            The {agencyName} team has been notified. They will reach out to you via WhatsApp within the next 24 hours to confirm details and finalize your expedition.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="book" className="bg-[var(--primary)] py-24 px-6 md:px-12 rounded-[3rem] mx-6 mb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <div className="text-white">
          <p className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            Direct Connection
          </p>
          <h2 className="text-5xl font-[var(--font-display)] font-bold mb-8 leading-tight tracking-tight">
            Secure your expedition <br/> with {agencyName}.
          </h2>
          <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
            Tell us when you&apos;re arriving and what you&apos;re looking for. We connect you directly with the native guides&mdash;no agents, no markups, just direct valley logistics.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Direct WhatsApp support
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Verified native-owned expert team
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Transparent pricing with no hidden fees
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Your Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.userName}
                  onChange={(e) => setForm({...formData, userName: e.target.value})}
                  placeholder="Juan Perez" 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">WhatsApp</label>
                <input 
                  required
                  type="tel" 
                  value={formData.userWhatsapp}
                  onChange={(e) => setForm({...formData, userWhatsapp: e.target.value})}
                  placeholder="+51..." 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Expedition Date</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setForm({...formData, date: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Experience</label>
                <select 
                  required
                  value={formData.experienceId}
                  onChange={(e) => setForm({...formData, experienceId: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all appearance-none"
                >
                  <option value="">Select Package...</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Additional Notes</label>
              <textarea 
                rows={3}
                value={formData.notes}
                onChange={(e) => setForm({...formData, notes: e.target.value})}
                placeholder="Special requirements, dietary needs, or general questions..." 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-alt)] text-white font-bold py-5 rounded-full shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {status === 'loading' ? 'Processing...' : (
                  <>
                    Send via Email <Send className="w-4 h-4" />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={handleWhatsApp}
                className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-5 rounded-full shadow-lg transition-all flex items-center justify-center gap-3"
              >
                Direct WhatsApp <MessageCircle className="w-5 h-5" />
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-[10px] text-center font-bold uppercase">
                Something went wrong. Please try WhatsApp instead.
              </p>
            )}

            <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-tighter">
              By clicking, you agree to connect directly with {agencyName} staff.
            </p>
          </form>
        </div>

      </div>
    </section>
  )
}
