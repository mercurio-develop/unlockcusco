import { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Travel Guides & Itineraries for Cusco & Sacred Valley",
  description: "Read expert guides, logistics, and itineraries for planning the perfect trip to Cusco, the Sacred Valley, and Machu Picchu.",
};

const GUIDES_EN = [
  {
    title: "Essential Health & Hydration in Peru",
    slug: "essential-health-hydration-peru",
    description: "Why hydration matters at 12,000 feet and how to prepare your gut for the Andean climate.",
  },
  {
    title: "Sacred Valley Packing List: The Layering Rule",
    slug: "sacred-valley-packing-list",
    description: "Andean weather is unpredictable. Learn exactly what to pack to survive the intense sun and sudden rain in the Sacred Valley.",
  },
  {
    title: "Do I Need a Water Filter in Peru?",
    slug: "do-i-need-water-filter-in-peru",
    description: "Discover why a portable water filter is essential for traveling through the Andes, and my top recommendations based on 13 years living in Peru.",
  },
  {
    title: "The Ultimate 1-Day Sacred Valley Itinerary",
    slug: "sacred-valley-1-day-itinerary",
    description: "Short on time? Here is the perfect 1-day route hitting Pisac, Urubamba, and Ollantaytambo before catching the train to Machu Picchu.",
  },
  {
    title: "Machu Picchu Circuits Explained (2026 Guide)",
    slug: "machu-picchu-circuits-explained",
    description: "Don't buy the wrong ticket! A complete breakdown of Circuit 1, Circuit 2, and Circuit 3, plus how to combine them with mountain hikes.",
  },
  {
    title: "7 Best Restaurants in Cusco & The Sacred Valley",
    slug: "best-restaurants-cusco-sacred-valley",
    description: "From world-class tasting menus at MIL to hidden local gems in Urubamba, discover where to eat in the Andes.",
  },
  {
    title: "The Route of Coffee and Cacao",
    slug: "coffee-cacao-route",
    description: "Immerse yourself in Peru's rich agricultural heritage with a bean-to-cup and bean-to-bar journey.",
  },
  {
    title: "How to Avoid Soroche (Altitude Sickness) in Cusco",
    slug: "how-to-avoid-soroche-altitude-sickness-cusco",
    description: "Learn how to prevent and treat altitude sickness before your trip to the Andes.",
  }
];

const GUIDES_ES = [
  {
    title: "Salud e Hidratación Esencial en Perú",
    slug: "essential-health-hydration-peru",
    description: "Por qué la hidratación importa a más de 3,600 metros de altura y cómo preparar tu intestino para el clima andino.",
  },
  {
    title: "Lista de Empaque para el Valle Sagrado: La Regla de las Capas",
    slug: "sacred-valley-packing-list",
    description: "El clima andino es impredecible. Aprende exactamente qué empacar para sobrevivir al sol intenso y la lluvia en el Valle Sagrado.",
  },
  {
    title: "¿Necesito un filtro de agua en Perú?",
    slug: "do-i-need-water-filter-in-peru",
    description: "Descubre por qué un filtro portátil es esencial para viajar por los Andes y mis mejores recomendaciones basadas en 13 años viviendo en Perú.",
  },
  {
    title: "El Itinerario Definitivo de 1 Día en el Valle Sagrado",
    slug: "sacred-valley-1-day-itinerary",
    description: "¿Poco tiempo? Esta es la ruta perfecta de 1 día que pasa por Pisac, Urubamba y Ollantaytambo antes de tomar el tren a Machu Picchu.",
  },
  {
    title: "Circuitos de Machu Picchu Explicados (Guía 2026)",
    slug: "machu-picchu-circuits-explained",
    description: "¡No compres el boleto equivocado! Un desglose completo del Circuito 1, Circuito 2 y Circuito 3, además de cómo combinarlos con caminatas por la montaña.",
  },
  {
    title: "Los 7 Mejores Restaurantes en Cusco y el Valle Sagrado",
    slug: "best-restaurants-cusco-sacred-valley",
    description: "Desde menús de degustación de clase mundial en MIL hasta joyas locales escondidas en Urubamba, descubre dónde comer en los Andes.",
  },
  {
    title: "La Ruta del Café y Cacao",
    slug: "coffee-cacao-route",
    description: "Sumérgete en la rica herencia agrícola de Perú con un viaje desde el grano hasta la taza y la barra.",
  },
  {
    title: "Cómo Evitar el Soroche (Mal de Altura) en Cusco",
    slug: "how-to-avoid-soroche-altitude-sickness-cusco",
    description: "Aprende cómo prevenir y tratar el mal de altura antes de tu viaje a los Andes.",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GUIDES.map((guide) => (
          <a key={guide.slug} href={`/${lang}/guides/${guide.slug}`} className="group block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-rose-200 transition-all flex flex-col justify-between min-h-[200px]">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">{guide.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {guide.description}
              </p>
            </div>
            <div className="text-rose-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
              {isEs ? "Leer Guía" : "Read Guide"} <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}