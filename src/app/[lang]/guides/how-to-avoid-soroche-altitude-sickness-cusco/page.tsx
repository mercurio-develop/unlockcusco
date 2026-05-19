import { Metadata } from "next";
import { Sparkles, Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Avoid & Heal Soroche (Altitude Sickness) in Cusco",
  description: "A practical, natural guide to preventing and treating altitude sickness (soroche) in Cusco, Peru. Learn about Coca tea, hydration, and proper acclimatization.",
};

export default async function SorocheGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';

  const content = isEs ? {
    title: "Cómo Evitar y Curar el Soroche (Mal de Altura) en Cusco",
    desc: "Cusco se encuentra a 3,400 metros sobre el nivel del mar. Es normal sentir el cambio de altitud, pero con un poco de preparación y los remedios tradicionales andinos, puedes disfrutar de tu viaje sin problemas.",
    h2_1: "¿Qué es el Soroche?",
    p1_1: "El soroche es la palabra local para el mal de altura. Ocurre porque hay menos oxígeno en el aire en lugares elevados. Los síntomas incluyen dolor de cabeza leve, fatiga y dificultad para respirar.",
    h2_2: "Prevención Primero (Reglas de Oro)",
    l2_1: "<strong>Tómatelo con calma:</strong> Tu primer día en Cusco debe ser de descanso. No planifiques caminatas extenuantes.",
    l2_2: "<strong>Hidratación constante:</strong> Bebe mucha más agua de lo habitual. El aire de la montaña es seco.",
    l2_3: "<strong>Come ligero:</strong> Evita comidas pesadas y grasosas al llegar, ya que la digestión es más lenta en la altura.",
    h2_3: "Remedios Naturales y Tradicionales",
    l3_1: "<strong>Mate de Coca:</strong> El antiguo remedio andino. Las hojas de coca son un estimulante suave que ayuda con la digestión y la oxigenación. Bébelo por la mañana o la tarde.",
    l3_2: "<strong>Té de Muña:</strong> La menta andina es excelente para asentar el estómago y aliviar los síntomas de la altura.",
    l3_3: "<strong>Agua de Florida:</strong> Una colonia de hierbas que muchos guías locales usan. Inhalar su aroma ayuda a abrir las vías respiratorias y despejar la mente.",
    h2_4: "Cuándo buscar ayuda",
    p4_1: "Si el dolor de cabeza es intenso o sientes náuseas fuertes, no te preocupes. La mayoría de los hoteles en Cusco cuentan con tanques de oxígeno en recepción. Unos minutos de oxígeno suelen ser suficientes para que te sientas como nuevo.",
    callToAction: "¿Deseas un itinerario que te ayude a aclimatarte?",
    callToActionDesc: "Pídele a nuestro Concierge de IA que diseñe un plan de viaje que aumente gradualmente la altitud, asegurando que te mantengas saludable.",
    askAi: "Hablar con el Concierge"
  } : {
    title: "How to Avoid & Heal Soroche (Altitude Sickness) in Cusco",
    desc: "Cusco sits at 11,150 feet (3,400 meters) above sea level. It is completely normal to feel the altitude, but with a little preparation and traditional Andean remedies, you can enjoy your trip worry-free.",
    h2_1: "What is Soroche?",
    p1_1: "Soroche is the local word for altitude sickness. It happens because there is less oxygen in the air at high elevations. Symptoms include mild headaches, fatigue, and shortness of breath.",
    h2_2: "Prevention First (The Golden Rules)",
    l2_1: "<strong>Take it easy:</strong> Your first day in Cusco should be for resting. Do not plan strenuous hikes right away.",
    l2_2: "<strong>Hydrate constantly:</strong> Drink much more water than usual. The mountain air is dry.",
    l2_3: "<strong>Eat light:</strong> Avoid heavy, fatty meals when you arrive, as digestion slows down at high altitudes.",
    h2_3: "Natural & Traditional Remedies",
    l3_1: "<strong>Coca Tea (Mate de Coca):</strong> The ancient Andean remedy. Coca leaves are a mild stimulant that help with digestion and oxygenation. Drink it in the morning or afternoon.",
    l3_2: "<strong>Muña Tea:</strong> Andean mint is excellent for settling the stomach and relieving altitude symptoms.",
    l3_3: "<strong>Agua de Florida:</strong> An herbal cologne used by local guides. Inhaling its scent helps open up the airways and clear the mind.",
    h2_4: "When to seek help",
    p4_1: "If you have a severe headache or strong nausea, don't worry. Most hotels in Cusco have oxygen tanks at the front desk. A few minutes of oxygen is usually all it takes to feel like yourself again.",
    callToAction: "Want an acclimatization-friendly itinerary?",
    callToActionDesc: "Ask our AI Concierge to design a travel plan that gradually increases in altitude, ensuring you stay healthy.",
    askAi: "Ask the AI Concierge"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isEs ? content.title : metadata.title,
            "description": isEs ? content.desc : metadata.description,
            "image": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
            "author": { "@type": "Organization", "name": "UnlockCusco" },
            "publisher": {
              "@type": "Organization",
              "name": "UnlockCusco",
              "logo": { "@type": "ImageObject", "url": "https://unlockcusco.com/icon.svg" }
            },
            "datePublished": new Date().toISOString().split('T')[0],
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

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_1}</h2>
        <p className="text-slate-600 mb-8">{content.p1_1}</p>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_2}</h2>
        <ul className="space-y-4 mb-8 text-slate-600 list-disc list-inside">
          <li dangerouslySetInnerHTML={{ __html: content.l2_1 }} />
          <li dangerouslySetInnerHTML={{ __html: content.l2_2 }} />
          <li dangerouslySetInnerHTML={{ __html: content.l2_3 }} />
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_3}</h2>
        <ul className="space-y-4 mb-8 text-slate-600 list-disc list-inside">
          <li dangerouslySetInnerHTML={{ __html: content.l3_1 }} />
          <li dangerouslySetInnerHTML={{ __html: content.l3_2 }} />
          <li dangerouslySetInnerHTML={{ __html: content.l3_3 }} />
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mb-4">{content.h2_4}</h2>
        <p className="text-slate-600 mb-12">{content.p4_1}</p>

        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" /> {content.callToAction}
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              {content.callToActionDesc}
            </p>
            <button 
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-emerald-500 transition-colors"
            >
              {content.askAi} <Sparkles className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}