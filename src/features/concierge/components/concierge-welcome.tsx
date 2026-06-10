import { Bot, Map, Utensils, Bed, MapPin, Info } from "lucide-react";

interface ConciergeWelcomeProps {
  isEs: boolean;
  sendMessage: (msg: { text: string }) => void;
}

export function ConciergeWelcome({ isEs, sendMessage }: ConciergeWelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-200">
        <Bot className="w-8 h-8 text-rose-600" />
      </div>
      <h2 className="text-xl font-bold font-serif text-slate-900 mb-2">
        {isEs ? "¡Hola! Soy tu Conserje." : "Hi! I'm your Concierge."}
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        {isEs ? "¿Qué planeamos hoy?" : "What are we planning today?"}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <button 
          onClick={() => sendMessage({ text: isEs ? "Planear mi día completo" : "Plan my full day" })}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 rounded-2xl transition-all shadow-sm group"
        >
          <Map className="w-6 h-6 text-slate-400 group-hover:text-rose-500 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-700">{isEs ? "Planear Día" : "Build Itinerary"}</span>
        </button>
        <button 
          onClick={() => sendMessage({ text: isEs ? "Buscar los mejores restaurantes" : "Find Top Dining" })}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50 rounded-2xl transition-all shadow-sm group"
        >
          <Utensils className="w-6 h-6 text-slate-400 group-hover:text-orange-500 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-700">{isEs ? "Restaurantes" : "Top Dining"}</span>
        </button>
        <button 
          onClick={() => sendMessage({ text: isEs ? "Recomiéndame un lugar para quedarme" : "Recommend a place to stay" })}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-2xl transition-all shadow-sm group"
        >
          <Bed className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-700">{isEs ? "Alojamiento" : "Stays"}</span>
        </button>
        <button 
          onClick={() => sendMessage({ text: isEs ? "¿Qué hay cerca de mí?" : "What's good near me?" })}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm group"
        >
          <MapPin className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-700">{isEs ? "Cerca de Mí" : "Near Me"}</span>
        </button>
        <button 
          onClick={() => sendMessage({ text: isEs ? "Quisiera algunos tips locales y FAQs" : "I'd like some local tips and FAQs" })}
          className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 rounded-2xl transition-all shadow-sm group"
        >
          <Info className="w-6 h-6 text-slate-400 group-hover:text-sky-500 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-700">{isEs ? "Tips & FAQ" : "Tips & FAQ"}</span>
        </button>
      </div>
    </div>
  );
}