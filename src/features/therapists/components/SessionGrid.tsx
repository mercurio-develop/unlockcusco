"use client"

import { Clock, Tag } from "lucide-react"

export function SessionGrid({ services, therapistName }: { services: any[], therapistName: string }) {
  return (
    <section className="bg-slate-50 py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <p className="text-rose-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            Private Sessions
          </p>
          <h2 className="text-4xl font-serif text-slate-900 tracking-tight">
            Modalities of Restoration
          </h2>
          <p className="text-slate-500 mt-4 font-light">
            Select a session to begin your ritual. All sessions are conducted in private sanctuaries or can be arranged at your basecamp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                   <Tag className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">${service.priceUsd}</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    <Clock className="w-3 h-3" /> {service.durationMins} Min
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-serif font-bold text-slate-900 mb-4 group-hover:text-rose-600 transition-colors">
                {service.title}
              </h3>
              
              <p className="text-sm text-slate-500 font-light leading-relaxed mb-8 flex-1">
                {service.description}
              </p>

              <button 
                onClick={() => {
                  const msg = encodeURIComponent(`Hola! I am interested in booking a ${service.title} session with ${therapistName}.`);
                  window.open(`https://wa.me/51999888777?text=${msg}`, "_blank");
                }}
                className="w-full bg-slate-900 hover:bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest py-4 rounded-full shadow-lg shadow-slate-900/10 transition-all"
              >
                Request Booking
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
