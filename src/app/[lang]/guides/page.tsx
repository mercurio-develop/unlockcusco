import { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Travel Guides & Itineraries for Cusco & Sacred Valley",
  description: "Read expert guides, logistics, and itineraries for planning the perfect trip to Cusco, the Sacred Valley, and Machu Picchu.",
};

const GUIDES_EN = [
  {
    title: "The Puno Wake-Up Call: Why Hydration Matters at 12,000 Feet",
    slug: "essential-health-hydration-peru",
    description: "Puno, Peru is nestled on the banks of Lake Titicaca, one of the most beautiful places I’ve ever visited. The combination of extreme altitude, intense sun, and dry air means you have to take hydration seriously.",
  },
  {
    title: "Packing for Cusco: How to Be Ready for Intense Sun, Rain, and Cold (Without Looking Like a Safari Guide)",
    slug: "sacred-valley-packing-list",
    description: "To save your spine—and your style—let me help you avoid making the exact same mistakes on your trip to Cusco.",
  }
];

const GUIDES_ES = [
  {
    title: "La llamada de atención de Puno: Por qué importa la hidratación a 3,800 metros",
    slug: "essential-health-hydration-peru",
    description: "Puno, Perú, está ubicado a orillas del Lago Titicaca, uno de los lugares más hermosos que he visitado. La combinación de altitud extrema, sol intenso y aire seco significa que debes tomarte la hidratación muy en serio.",
  },
  {
    title: "Empacar para Cusco: Cómo estar listo para el sol intenso, la lluvia y el frío (sin parecer un guía de safari)",
    slug: "sacred-valley-packing-list",
    description: "Para salvar tu columna, y tu estilo, déjame ayudarte a evitar cometer los mismos errores en tu viaje a Cusco.",
  }
];

export default async function GuidesIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';
  const GUIDES = isEs ? GUIDES_ES : GUIDES_EN;
  
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 pb-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
          {isEs ? "Guías de Viaje" : "Travel Guides"}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {isEs 
            ? "Consejos de expertos, desgloses logísticos e itinerarios curados para ayudarte a planificar el viaje perfecto al Valle Sagrado."
            : "Expert advice, logistical breakdowns, and curated itineraries to help you plan the perfect trip to the Sacred Valley."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {GUIDES.map((guide) => (
          <a key={guide.slug} href={`/${lang}/guides/${guide.slug}`} className="group block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between min-h-[220px]">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{guide.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {guide.description}
              </p>
            </div>
            <div className="text-indigo-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              {isEs ? "Leer Guía" : "Read Guide"} <ArrowRight className="w-4 h-4" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}