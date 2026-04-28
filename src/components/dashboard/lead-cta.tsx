"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Phone, Mail, MessageCircle, Calendar, MapPin } from "lucide-react"


interface LeadCTAProps {
  businessName: string
  businessWhatsapp?: string | null
}

export function LeadCTA({ businessName, businessWhatsapp }: LeadCTAProps) {
  const [open, setOpen] = useState(false)

  const lead = {
    name: "Sarah Jenkins",
    flag: "🇺🇸",
    origin: "New York, USA",
    date: "May 15, 2026",
    phone: "+1 (555) 234-7890",
    email: "sarah.j@outlook.com",
    message: `Hi! I'm looking for a relaxing experience in the Sacred Valley. I found ${businessName} through INKAPORTAL and I'd love to book a session for May 15th. My group is 2 people.`,
  }

  const whatsappReply = businessWhatsapp
    ? `https://wa.me/51${businessWhatsapp}?text=${encodeURIComponent(`Hi ${businessName}! We have a new booking from ${lead.name} for ${lead.date}. Her contact is ${lead.phone}.`)}`
    : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-50 transition-colors"
      >
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
                  <h2 className="text-2xl font-extrabold text-slate-900">New Client</h2>
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0">
                  {lead.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">{lead.flag} {lead.name}</p>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {lead.origin}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Requested Date: <strong>{lead.date}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{lead.email}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Message</p>
                <p className="text-sm text-slate-700 italic">&quot;{lead.message}&quot;</p>
              </div>

              <div className="flex gap-3">
                {whatsappReply ? (
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${lead.name}! I am from ${businessName}. I saw your booking for ${lead.date}. Shall I confirm your appointment?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                ) : null}
                <a
                  href={`mailto:${lead.email}?subject=INKAPORTAL Booking - ${businessName}&body=Hi ${lead.name}!`}
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
