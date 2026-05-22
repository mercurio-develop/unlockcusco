"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Phone, Mail, MessageCircle, Calendar, MapPin, ExternalLink } from "lucide-react"
import type { Lead } from "@prisma/client"

interface LeadCTAProps {
  businessName: string
  _businessWhatsapp?: string | null
  lead: Lead
}

export function LeadCTA({ businessName, lead }: LeadCTAProps) {
  const [open, setOpen] = useState(false)

  const displayDate = new Date(lead.date).toLocaleDateString('en-US', {

    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-50 transition-colors flex items-center gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        View Contact Details
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Lead Unlocked</div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Real Client Request</h2>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0">
                  {lead.touristName[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{lead.touristName}</p>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> International Tourist
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Requested Date: <strong>{displayDate}</strong></span>
                </div>
                {lead.touristPhone && (
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{lead.touristPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{lead.touristEmail}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Platform Referral</p>
                <p className="text-sm text-slate-700 italic">
                  &quot;Hi! I found {businessName} through UNLOCKCUSCO and I&apos;m interested in booking for {displayDate}.&quot;
                </p>
              </div>

              <div className="flex gap-3">
                {lead.touristPhone ? (
                  <a
                    href={`https://wa.me/${lead.touristPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${lead.touristName}! I am from ${businessName}. I saw your inquiry on UnlockCusco for ${displayDate}. Shall I confirm your reservation?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                ) : null}
                <a
                  href={`mailto:${lead.touristEmail}?subject=UNLOCKCUSCO Booking - ${businessName}&body=Hi ${lead.touristName}!`}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
