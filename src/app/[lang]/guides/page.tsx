import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Travel Guides & Itineraries for Cusco & Sacred Valley",
  description: "Read expert guides, logistics, and itineraries for planning the perfect trip to Cusco, the Sacred Valley, and Machu Picchu.",
};

const GUIDES_EN = [
  {
    title: "The Ultimate 1-Day Sacred Valley Itinerary",
    slug: "sacred-valley-1-day-itinerary",
    description: "Short on time? Here is the perfect 1-day route hitting Pisac, Urubamba, and Ollantaytambo before catching the train to Machu Picchu.",
    imageUrl: "/images/boleto/pisac-ruins.jpg",
  },
  {
    title: "Machu Picchu Circuits Explained (2026 Guide)",
    slug: "machu-picchu-circuits-explained",
    description: "Don't buy the wrong ticket! A complete breakdown of Circuit 1, Circuit 2, and Circuit 3, plus how to combine them with mountain hikes.",
    imageUrl: "/images/dummy/generic.jpg",
  },
  {
    title: "7 Best Restaurants in Cusco & The Sacred Valley",
    slug: "best-restaurants-cusco-sacred-valley",
    description: "From world-class tasting menus at MIL to hidden local gems in Urubamba, discover where to eat in the Andes.",
    imageUrl: "/images/dummy/ceviche.jpg",
  },
  {
    title: "The Route of Coffee and Cacao",
    slug: "coffee-cacao-route",
    description: "Immerse yourself in Peru's rich agricultural heritage with a bean-to-cup and bean-to-bar journey.",
    imageUrl: "/images/dummy/huerto.jpg",
  },
  {
    title: "How to Avoid Soroche (Altitude Sickness) in Cusco",
    slug: "how-to-avoid-soroche-altitude-sickness-cusco",
    description: "Learn how to prevent and treat altitude sickness before your trip to the Andes.",
    imageUrl: "/images/boleto/sacsayhuaman.jpg",
  }
];

const GUIDES_ES = [
  {
    title: "El Itinerario Definitivo de 1 Día en el Valle Sagrado",
    slug: "sacred-valley-1-day-itinerary",
    description: "¿Poco tiempo? Esta es la ruta perfecta de 1 día que pasa por Pisac, Urubamba y Ollantaytambo antes de tomar el tren a Machu Picchu.",
    imageUrl: "/images/boleto/pisac-ruins.jpg",
  },
  {
    title: "Circuitos de Machu Picchu Explicados (Guía 2026)",
    slug: "machu-picchu-circuits-explained",
    description: "¡No compres el boleto equivocado! Un desglose completo del Circuito 1, Circuito 2 y Circuito 3, además de cómo combinarlos con caminatas por la montaña.",
    imageUrl: "/images/dummy/generic.jpg",
  },
  {
    title: "Los 7 Mejores Restaurantes en Cusco y el Valle Sagrado",
    slug: "best-restaurants-cusco-sacred-valley",
    description: "Desde menús de degustación de clase mundial en MIL hasta joyas locales escondidas en Urubamba, descubre dónde comer en los Andes.",
    imageUrl: "/images/dummy/ceviche.jpg",
  },
  {
    title: "La Ruta del Café y Cacao",
    slug: "coffee-cacao-route",
    description: "Sumérgete en la rica herencia agrícola de Perú con un viaje desde el grano hasta la taza y la barra.",
    imageUrl: "/images/dummy/huerto.jpg",
  },
  {
    title: "Cómo Evitar el Soroche (Mal de Altura) en Cusco",
    slug: "how-to-avoid-soroche-altitude-sickness-cusco",
    description: "Aprende cómo prevenir y tratar el mal de altura antes de tu viaje a los Andes.",
    imageUrl: "/images/boleto/sacsayhuaman.jpg",
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
          <a key={guide.slug} href={`/${lang}/guides/${guide.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all">
            <div className="aspect-[4/3] w-full relative overflow-hidden">
              <Image 
                src={guide.imageUrl} 
                alt={guide.title} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">{guide.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {guide.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}