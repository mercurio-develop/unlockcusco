import { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Map, Bot } from "lucide-react";
import { notFound } from "next/navigation";

// Define a type for the content
type GuideContent = {
  title: string;
  desc: string;
  image: string;
  sections: { h2: string; p: string }[];
};

// Content registry for English
const GUIDES_CONTENT_EN: Record<string, GuideContent> = {
  "classic-sacred-valley": {
    title: "Classic Sacred Valley: The Complete Guide",
    desc: "An AI-generated breakdown of the classic route through Pisac, Urubamba, and Ollantaytambo.",
    image: "/images/boleto/pisac-ruins.jpg",
    sections: [
      { h2: "The Essential Route", p: "The classic Sacred Valley tour is the most popular day trip from Cusco. You'll descend into the warmer climate of the valley, explore vast Inca agricultural terraces, and visit bustling artisan markets." },
      { h2: "Pisac: Markets and Mountains", p: "Start in Pisac. While the market in the plaza is famous for silver and textiles, the real treasure is the mountaintop ruin complex. The agricultural terraces here sweep around the mountain like a massive amphitheater." },
      { h2: "Ollantaytambo: The Living Inca Town", p: "End your day in Ollantaytambo. This town still uses the original Inca street grid and water channels. The massive fortress overlooking the town was the site of a major Inca victory against the Spanish conquistadors." }
    ]
  },
  "cusco-city-tour": {
    title: "Cusco City Tour: Heart of the Empire",
    desc: "Discover the hidden history beneath the colonial architecture of the Imperial City.",
    image: "/images/boleto/sacsayhuaman.jpg",
    sections: [
      { h2: "The Navel of the World", p: "Cusco was designed in the shape of a puma, with the massive fortress of Sacsayhuaman serving as its head. Today, it's a fascinating blend of perfect Inca stonework and Spanish colonial architecture." },
      { h2: "Qorikancha: The Temple of the Sun", p: "Once the richest temple in the Inca Empire, its walls were completely covered in solid gold plates. Today, the Convent of Santo Domingo is built directly on top of its flawless foundations." },
      { h2: "Sacsayhuaman", p: "Just above the city lies this megalithic marvel. Some of the stones here weigh over 100 tons, yet they fit together so perfectly that not a single piece of paper can slide between them." }
    ]
  },
  "ultimate-inca-ruins": {
    title: "The Ultimate Inca Ruins Guide",
    desc: "A deep dive into the architecture, purpose, and history of the Sacred Valley's greatest structures.",
    image: "/images/boleto/ollantaytambo-ruins.jpg",
    sections: [
      { h2: "Master Builders", p: "The Incas were master stonemasons and engineers. They didn't just build on the landscape; they integrated their structures seamlessly into the natural topography." },
      { h2: "The Trapezoidal Secret", p: "You'll notice that doors, windows, and niches in Inca buildings lean inward, forming a trapezoid. This brilliant architectural choice made their buildings highly resistant to the region's frequent earthquakes." }
    ]
  },
  "top-7-culinary-route": {
    title: "The Top 7 Culinary Route",
    desc: "An AI-curated guide to the best flavors in the Andes.",
    image: "/images/dummy/ceviche.jpg",
    sections: [
      { h2: "Andean Gastronomy", p: "The Sacred Valley is a food lover's paradise. The unique microclimates allow for the cultivation of hundreds of varieties of potatoes, corn, and quinoa." },
      { h2: "From Pachamanca to Haute Cuisine", p: "You can experience everything from a traditional Pachamanca (meat and potatoes cooked under the earth using hot stones) to world-class tasting menus at restaurants like MIL, located right next to the Moray ruins." }
    ]
  },
  "maras-moray": {
    title: "Exploring Maras & Moray",
    desc: "Salt pans and agricultural laboratories.",
    image: "/images/boleto/moray.jpg",
    sections: [
      { h2: "Moray: The Inca Greenhouse", p: "These concentric circular terraces weren't an amphitheater—they were an agricultural laboratory. The temperature difference from the top terrace to the bottom can be as much as 15°C (27°F)." },
      { h2: "Maras Salt Ponds", p: "Just a short drive away are the Salineras de Maras. Over 3,000 geometric salt pools spill down the mountainside, fed by a highly saline subterranean spring. They have been harvested by local families since pre-Inca times." }
    ]
  },
  "artisan-markets": {
    title: "Best Artisan Markets in the Valley",
    desc: "Where to find the most authentic textiles and crafts.",
    image: "/images/boleto/chinchero-ruins.jpg",
    sections: [
      { h2: "Chinchero: The Weaving Capital", p: "Chinchero is world-renowned for its textiles. Here, you can watch local women demonstrate the entire process: washing raw alpaca wool with a natural root, spinning it, dyeing it with insects and plants, and weaving complex patterns." },
      { h2: "Pisac Sunday Market", p: "While open every day, the Pisac market truly comes alive on Sundays. It's the perfect place to buy silver jewelry, ceramics, and warm alpaca sweaters." }
    ]
  },
  "machu-picchu-day": {
    title: "Machu Picchu in a Day",
    desc: "Logistics and tips for a whirlwind one-day trip to the Wonder of the World.",
    image: "/images/dummy/generic.jpg",
    sections: [
      { h2: "The Logistics", p: "Doing Machu Picchu in a single day from Cusco requires an early start. You'll need to catch a 4:00 AM bus to Ollantaytambo, board an early train to Aguas Calientes, and then take the 30-minute shuttle bus up to the ruins." },
      { h2: "Maximize Your Time", p: "Because time is tight, we highly recommend hiring a private guide to ensure you see the most important sectors (like the Temple of the Sun and the Intihuatana) without feeling rushed." }
    ]
  },
  "acclimating-altitude": {
    title: "How to Acclimate to Altitude",
    desc: "Essential medical and practical tips for beating Soroche (altitude sickness).",
    image: "/images/boleto/sacsayhuaman.jpg",
    sections: [
      { h2: "Understanding Soroche", p: "Cusco sits at an elevation of 3,399 meters (11,152 feet). The air is noticeably thinner, which can cause headaches, nausea, and shortness of breath." },
      { h2: "The Golden Rules", p: "Take it easy on your first day. Hydrate constantly. Avoid heavy meals and alcohol for the first 24 hours. Drink coca tea, a traditional Andean remedy that helps improve blood oxygenation." },
      { h2: "Sleep Low", p: "If possible, immediately head down into the Sacred Valley (around 2,800m / 9,000ft) upon arriving at the Cusco airport. Spending your first two nights lower helps your body adjust much faster." }
    ]
  },
  "packing-sacred-valley": {
    title: "Packing List for the Sacred Valley",
    desc: "What to bring for the dramatic temperature swings of the Andes.",
    image: "/images/boleto/moray.jpg",
    sections: [
      { h2: "Layers are Everything", p: "The Andes are famous for having 'four seasons in a single day'. When the sun is out, it's intense and hot. As soon as the sun drops behind the mountains, temperatures plummet toward freezing." },
      { h2: "The Essentials", p: "Pack a good sun hat, strong sunscreen (the UV index at this altitude is extreme), a lightweight rain jacket, a warm fleece or down layer, and comfortable, broken-in walking shoes." }
    ]
  },
  "boleto-turistico-explained": {
    title: "Understanding the Boleto Turistico",
    desc: "Don't get confused at the gate. Here is exactly what the Cusco Tourist Ticket covers.",
    image: "/images/boleto/cosituc-ticket-office.jpg",
    sections: [
      { h2: "What is it?", p: "The Boleto Turistico del Cusco (BTC) is a mandatory ticket that grants you access to 16 of the most important archaeological sites and museums in and around Cusco and the Sacred Valley. You cannot pay individual entrance fees at most of these sites." },
      { h2: "Partial vs. Full", p: "You can buy a partial ticket (valid for 1-2 days, covering a specific circuit of sites) or the full ticket (valid for 10 days, covering everything). If you plan to see the Sacred Valley and Cusco City ruins, the full ticket is always the best value." }
    ]
  },
  "best-time-machu-picchu": {
    title: "Best Time to Visit Machu Picchu",
    desc: "Weather, crowds, and the optimal months for your trip.",
    image: "/images/dummy/aguas-calientes.jpg",
    sections: [
      { h2: "Dry Season vs. Wet Season", p: "The dry season runs from May to October, offering clear blue skies and cold nights. The wet season is from November to April, bringing warmer nights but heavy afternoon downpours." },
      { h2: "The Sweet Spot", p: "The absolute best times to visit are the 'shoulder months' of May and September/October. You'll enjoy the lush green landscapes left over from the rains, but with mostly dry, clear days and smaller crowds than the peak months of July and August." }
    ]
  }
};

const GUIDES_CONTENT_ES: Record<string, GuideContent> = {
  "classic-sacred-valley": {
    title: "Valle Sagrado Clásico: La Guía Completa",
    desc: "Un desglose generado por IA de la ruta clásica por Pisac, Urubamba y Ollantaytambo.",
    image: "/images/boleto/pisac-ruins.jpg",
    sections: [
      { h2: "La Ruta Esencial", p: "El tour clásico del Valle Sagrado es la excursión más popular desde Cusco. Descenderás a un clima más cálido, explorarás vastas terrazas y visitarás mercados artesanales." }
    ]
  },
  "cusco-city-tour": {
    title: "City Tour Cusco: El Corazón del Imperio",
    desc: "Descubre la historia oculta bajo la arquitectura colonial de la Ciudad Imperial.",
    image: "/images/boleto/sacsayhuaman.jpg",
    sections: [
      { h2: "El Ombligo del Mundo", p: "Cusco fue diseñada con forma de puma, con la fortaleza de Sacsayhuaman como su cabeza. Hoy es una fascinante mezcla de trabajo en piedra Inca y arquitectura colonial." }
    ]
  },
  "ultimate-inca-ruins": {
    title: "La Guía Definitiva de Ruinas Incas",
    desc: "Una inmersión profunda en la arquitectura y propósito de las grandes estructuras.",
    image: "/images/boleto/ollantaytambo-ruins.jpg",
    sections: [
      { h2: "Maestros Constructores", p: "Los incas fueron maestros ingenieros. No solo construyeron sobre el paisaje; integraron sus estructuras en la topografía natural." }
    ]
  },
  "top-7-culinary-route": {
    title: "La Ruta Culinaria del Valle",
    desc: "Una guía seleccionada por IA con los mejores sabores de los Andes.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000&auto=format&fit=crop",
    sections: [
      { h2: "Gastronomía Andina", p: "El Valle Sagrado es un paraíso. Los microclimas permiten el cultivo de cientos de variedades de papas, maíz y quinua." }
    ]
  },
  "maras-moray": {
    title: "Explorando Maras y Moray",
    desc: "Salineras milenarias y laboratorios agrícolas.",
    image: "/images/boleto/moray.jpg",
    sections: [
      { h2: "Moray: El Invernadero Inca", p: "Estas terrazas concéntricas eran un laboratorio agrícola. La diferencia de temperatura de arriba a abajo puede ser de hasta 15°C." }
    ]
  },
  "artisan-markets": {
    title: "Mejores Mercados Artesanales",
    desc: "Dónde encontrar los textiles más auténticos.",
    image: "/images/boleto/chinchero-ruins.jpg",
    sections: [
      { h2: "Chinchero: Capital del Tejido", p: "Mundialmente famoso por sus textiles. Aquí puedes ver el proceso completo con tintes naturales." }
    ]
  },
  "machu-picchu-day": {
    title: "Machu Picchu en un Día",
    desc: "Logística y consejos para un viaje relámpago a la Maravilla del Mundo.",
    image: "/images/dummy/generic.jpg",
    sections: [
      { h2: "La Logística", p: "Hacerlo en un solo día desde Cusco requiere empezar a las 4:00 AM. Tomarás un bus, tren y otro bus hasta las ruinas." }
    ]
  },
  "acclimating-altitude": {
    title: "Cómo Aclimatarse a la Altura",
    desc: "Consejos médicos y prácticos para vencer el Soroche.",
    image: "/images/boleto/sacsayhuaman.jpg",
    sections: [
      { h2: "Entendiendo el Soroche", p: "Cusco está a 3,399 metros. El aire es más fino, lo que puede causar dolores de cabeza y náuseas." },
      { h2: "Las Reglas de Oro", p: "Tómatelo con calma el primer día. Hidrátate. Evita comidas pesadas. Bebe mate de coca." }
    ]
  },
  "packing-sacred-valley": {
    title: "Qué Empacar para el Valle Sagrado",
    desc: "Lo esencial para los cambios bruscos de temperatura de los Andes.",
    image: "/images/boleto/moray.jpg",
    sections: [
      { h2: "Las Capas lo son Todo", p: "Los Andes tienen 'cuatro estaciones en un día'. Empaca un buen bloqueador, chaqueta para lluvia y algo abrigador para la noche." }
    ]
  },
  "boleto-turistico-explained": {
    title: "Entendiendo el Boleto Turístico",
    desc: "Qué es y qué cubre exactamente el Boleto Turístico del Cusco.",
    image: "/images/boleto/cosituc-ticket-office.jpg",
    sections: [
      { h2: "¿Qué es?", p: "Es un boleto obligatorio que te da acceso a 16 sitios arqueológicos y museos. No puedes pagar entradas individuales en la mayoría de estos sitios." }
    ]
  },
  "best-time-machu-picchu": {
    title: "Mejor Época para Visitar Machu Picchu",
    desc: "Clima, multitudes y los meses óptimos para tu viaje.",
    image: "/images/dummy/aguas-calientes.jpg",
    sections: [
      { h2: "El Punto Exacto", p: "Los mejores meses son mayo y septiembre/octubre. Disfrutarás de paisajes verdes, días secos y menos multitudes que en julio." }
    ]
  }
};


export default async function DynamicGuidePage({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await params;
  const isEs = lang === 'es';
  
  const registry = isEs ? GUIDES_CONTENT_ES : GUIDES_CONTENT_EN;
  const content = registry[slug];

  if (!content) {
    // Return a generic fallback if slug doesn't perfectly match our hardcoded list
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <Bot className="w-16 h-16 mx-auto text-rose-500 mb-6" />
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">
          AI Guide Generation in Progress...
        </h1>
        <p className="text-slate-600 mb-8">
          Our AI Concierge is currently analyzing local data to generate the comprehensive guide for <strong>{slug}</strong>. Please check back later!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" /> {isEs ? "Guía IA" : "AI Guide"}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
          {content.title}
        </h1>
        
        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          {content.desc}
        </p>

        <div className="w-full aspect-[21/9] bg-slate-100 rounded-2xl shadow-inner overflow-hidden relative mb-12">
          <Image src={content.image} alt={content.title} fill className="object-cover" />
        </div>

        {/* Action Callout (Only for Itineraries) */}
        {[
          "classic-sacred-valley",
          "cusco-city-tour",
          "ultimate-inca-ruins",
          "top-7-culinary-route",
          "maras-moray",
          "artisan-markets",
          "machu-picchu-day",
          "coffee-cacao-route"
        ].includes(slug) && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Map className="w-5 h-5 text-slate-600" /> {isEs ? "Ver en Mapa Interactivo" : "View on Interactive Map"}
              </h3>
              <p className="text-sm text-slate-600">
                {isEs ? "Explora esta ruta en nuestro mapa interactivo y conéctate con conductores locales." : "Explore this route on our interactive map and connect with local drivers."}
              </p>
            </div>
            <a 
              href={`/${lang}/explore?trip=${slug}`}
              className="inline-flex shrink-0 items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-rose-700 transition-colors"
            >
               {isEs ? "Cargar Ruta" : "Load Route"} <Sparkles className="w-4 h-4 text-rose-200" />
            </a>
          </div>
        )}

        {/* Guide Content */}
        <div className="prose prose-slate prose-lg max-w-none">
          {content.sections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{section.h2}</h2>
              <p className="text-slate-700 leading-relaxed">{section.p}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
