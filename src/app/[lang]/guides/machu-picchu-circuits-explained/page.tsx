import { Metadata } from "next";
import { Sparkles, Bot } from "lucide-react";

export const metadata: Metadata = {
  title: "Machu Picchu Circuits Explained (2026 Guide)",
  description: "Don't buy the wrong ticket! A complete breakdown of Circuit 1, Circuit 2, and Circuit 3, plus how to combine them with mountain hikes.",
};

export default async function GuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';
  
  const content = isEs ? {
    title: "Circuitos de Machu Picchu Explicados (Guía 2026)",
    desc: "Comprar un boleto para Machu Picchu se ha vuelto increíblemente complicado. El gobierno recientemente renovó el sistema de entradas dividiéndolo en varios circuitos estrictos. Si compras el equivocado, podrías perderte la vista clásica por completo. Esto es lo que necesitas saber.",
    confused: "¿Confundido sobre los boletos?",
    confusedDesc: "No adivines. Puedes pedirle a nuestro Concierge de IA que verifique la disponibilidad en tiempo real y recomiende el circuito perfecto según tu estado físico y horario.",
    askAi: "Preguntar al Concierge de IA",
    h2_1: "Circuito 1: La Ruta Panorámica",
    p1_1: "Este circuito se centra en la \"Vista de Postal Clásica\". Subirás a las terrazas superiores de la ciudadela, donde se toman casi todas las famosas fotos panorámicas de Machu Picchu.",
    l1_1: "<strong>Mejor para:</strong> Fotógrafos y personas que quieren la foto icónica.",
    l1_2: "<strong>Lo que te pierdes:</strong> NO podrás caminar por las ruinas inferiores (los templos, el sector urbano).",
    l1_3: "<strong>Caminatas Adicionales:</strong> Este es el boleto que necesitas si quieres caminar por la Montaña Machu Picchu o la Puerta del Sol (Inti Punku).",
    h2_2: "Circuito 2: La Ruta Clásica",
    p2_1: "Este es el boleto más completo y solicitado. Incluye las terrazas superiores para la foto clásica y luego te lleva a las profundidades de las ruinas para explorar los templos.",
    l2_1: "<strong>Mejor para:</strong> Visitantes por primera vez que desean la experiencia completa.",
    l2_2: "<strong>Lo que te pierdes:</strong> Las caminatas adicionales (montañas).",
    l2_3: "<strong>Advertencia:</strong> Debido a que es el mejor, se agota con meses de anticipación.",
    h2_3: "Circuito 3: La Ruta de la Realeza",
    p3_1: "Este circuito se mantiene completamente en el sector urbano inferior. Caminarás entre las ruinas y los templos, pero <strong>no</strong> subirás a las terrazas para la foto panorámica clásica.",
    l3_1: "<strong>Mejor para:</strong> Personas con problemas de movilidad, o aquellos que no pudieron conseguir el Circuito 2.",
    l3_2: "<strong>Caminatas Adicionales:</strong> Este es el boleto necesario si quieres subir <strong>Huayna Picchu</strong> o Huchuy Picchu.",
    h2_4: "Resumen",
    p4_1: "Si quieres la foto clásica Y caminar entre las ruinas: <strong>Compra el Circuito 2</strong>. Si está agotado, la siguiente mejor opción suele ser una combinación del Circuito 1 (para la foto) y el Circuito 3 (para las ruinas), lo que requiere dos boletos separados."
  } : {
    title: "Machu Picchu Circuits Explained (2026 Guide)",
    desc: "Buying a ticket to Machu Picchu has become incredibly complicated. The government recently overhauled the ticketing system into multiple strict circuits. If you buy the wrong one, you might miss the classic view entirely. Here is what you need to know.",
    confused: "Confused about tickets?",
    confusedDesc: "Don't guess. You can ask our AI Concierge to check real-time availability and recommend the perfect circuit based on your physical fitness and schedule.",
    askAi: "Ask the AI Concierge",
    h2_1: "Circuit 1: The Panoramic Route",
    p1_1: "This circuit is all about the \"Classic Postcard View\". You will climb to the upper terraces of the citadel, where almost all the famous wide-angle photos of Machu Picchu are taken.",
    l1_1: "<strong>Best for:</strong> Photographers and people who want the iconic shot.",
    l1_2: "<strong>What you miss:</strong> You do NOT get to walk through the lower ruins (the temples, the urban sector).",
    l1_3: "<strong>Hike Add-ons:</strong> This is the ticket you need if you want to hike Machu Picchu Mountain or the Sun Gate (Inti Punku).",
    h2_2: "Circuit 2: The Classic Route",
    p2_1: "This is the most comprehensive and highly sought-after ticket. It includes the upper terraces for the classic photo, and then takes you down deep into the ruins to explore the temples.",
    l2_1: "<strong>Best for:</strong> First-time visitors who want the complete experience.",
    l2_2: "<strong>What you miss:</strong> The extra hikes.",
    l2_3: "<strong>Warning:</strong> Because it's the best, it sells out months in advance.",
    h2_3: "Circuit 3: The Royalty Route",
    p3_1: "This circuit stays entirely in the lower urban sector. You will walk among the ruins and temples, but you will <strong>not</strong> go up to the terraces for the classic panoramic photo.",
    l3_1: "<strong>Best for:</strong> People with mobility issues, or those who could not get Circuit 2.",
    l3_2: "<strong>Hike Add-ons:</strong> This is the ticket required if you want to climb <strong>Huayna Picchu</strong> or Huchuy Picchu.",
    h2_4: "Summary",
    p4_1: "If you want the classic photo AND to walk in the ruins: <strong>Buy Circuit 2</strong>. If it's sold out, the next best option is usually a combination of Circuit 1 (for the photo) and Circuit 3 (for the ruins), requiring two separate tickets."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isEs ? "Circuitos de Machu Picchu Explicados (Guía 2026)" : metadata.title,
            "description": isEs ? content.desc : metadata.description,
            "image": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
            "author": { "@type": "Organization", "name": "UnlockCusco" },
            "publisher": {
              "@type": "Organization",
              "name": "UnlockCusco",
              "logo": { "@type": "ImageObject", "url": "https://unlockcusco.com/icon.svg" }
            },
            "datePublished": "2026-05-15",
          })
        }}
      />
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
          {content.title}
        </h1>
        
        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          {content.desc}
        </p>

        <div className="bg-slate-900 text-white rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Bot className="w-5 h-5 text-rose-400" /> {content.confused}
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              {content.confusedDesc}
            </p>
            <button 
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-rose-500 transition-colors"
            >
              {content.askAi} <Sparkles className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="prose prose-slate prose-lg max-w-none">
          <h2>{content.h2_1}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p1_1 }} />
          <ul>
            <li dangerouslySetInnerHTML={{ __html: content.l1_1 }} />
            <li dangerouslySetInnerHTML={{ __html: content.l1_2 }} />
            <li dangerouslySetInnerHTML={{ __html: content.l1_3 }} />
          </ul>

          <h2>{content.h2_2}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p2_1 }} />
          <ul>
            <li dangerouslySetInnerHTML={{ __html: content.l2_1 }} />
            <li dangerouslySetInnerHTML={{ __html: content.l2_2 }} />
            <li dangerouslySetInnerHTML={{ __html: content.l2_3 }} />
          </ul>

          <h2>{content.h2_3}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p3_1 }} />
          <ul>
            <li dangerouslySetInnerHTML={{ __html: content.l3_1 }} />
            <li dangerouslySetInnerHTML={{ __html: content.l3_2 }} />
          </ul>

          <h2>{content.h2_4}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p4_1 }} />
        </div>

      </div>
    </>
  );
}