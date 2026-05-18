import { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Map } from "lucide-react";

export const metadata: Metadata = {
  title: "The Ultimate 1-Day Sacred Valley Itinerary",
  description: "Short on time? Here is the perfect 1-day route hitting Pisac, Urubamba, and Ollantaytambo before catching the train to Machu Picchu.",
};

export default async function GuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';
  
  const content = isEs ? {
    title: "El Itinerario Definitivo de 1 Día en el Valle Sagrado",
    desc: "Si solo tienes un día para explorar el Valle Sagrado antes de tomar el tren a Machu Picchu, debes ser estratégico. Esta ruta clásica visita los lugares imprescindibles sin que te sientas demasiado apresurado.",
    interactiveMap: "Mapa de Ruta Interactivo",
    interactiveMapDesc: "No solo leas al respecto. Carga esta misma ruta en nuestro mapa interactivo, ajusta las paradas y conéctate con conductores.",
    openInMap: "Abrir en Mapa de Vallecito",
    h2_1: "Mañana: Las Alpacas y Pisac",
    p1_1: "Comienza tu día temprano saliendo de Cusco. Tu primera parada debería ser <strong>Awana Kancha</strong>, un hermoso santuario donde puedes conocer llamas, alpacas y vicuñas, y aprender sobre técnicas de tejido tradicionales.",
    p1_2: "Continúa bajando hacia el valle hasta el pueblo de <strong>Pisac</strong>. Si es domingo, martes o jueves, el famoso mercado artesanal estará en pleno apogeo. No olvides subir la montaña en auto para ver las impresionantes <strong>Ruinas de Pisac</strong>—algunas de las terrazas agrícolas más impresionantes de todo el imperio Inca.",
    h2_2: "Almuerzo: Urubamba",
    p2_1: "Sigue por el río hasta Urubamba. Te recomendamos encarecidamente hacer una parada en el <strong>Restaurante Tunupa</strong> para disfrutar de un elegante almuerzo buffet justo a orillas del río Urubamba. Es el lugar perfecto para descansar y reponer energías.",
    h2_3: "Tarde: Ollantaytambo",
    p3_1: "Termina tu tarde en <strong>Ollantaytambo</strong>, conocido como el último pueblo Inca viviente. La enorme fortaleza aquí fue el sitio de una de las mayores victorias incas contra los españoles. Sube las terrazas para obtener una vista increíble del valle.",
    h2_4: "Noche: Tren a Aguas Calientes",
    p4_1: "La mayoría de los viajeros tomarán su tren de PeruRail o IncaRail desde la estación de Ollantaytambo a última hora de la tarde o temprano en la noche, en dirección a Aguas Calientes (Machu Picchu Pueblo) para dormir antes de su gran caminata al día siguiente."
  } : {
    title: "The Ultimate 1-Day Sacred Valley Itinerary",
    desc: "If you only have one day to explore the Sacred Valley before catching your train to Machu Picchu, you need to be strategic. This classic route hits the absolute must-see highlights without feeling too rushed.",
    interactiveMap: "Interactive Route Map",
    interactiveMapDesc: "Don't just read about it. Load this exact route into our interactive map, adjust the stops, and connect with drivers.",
    openInMap: "Open in Vallecito Map",
    h2_1: "Morning: The Alpacas and Pisac",
    p1_1: "Start your day early leaving Cusco. Your first stop should be <strong>Awana Kancha</strong>, a beautiful sanctuary where you can meet llamas, alpacas, and vicuñas, and learn about traditional weaving techniques.",
    p1_2: "Continue down into the valley to the town of <strong>Pisac</strong>. If it's a Sunday, Tuesday, or Thursday, the famous artisan market will be in full swing. Don't forget to drive up the mountain to see the breathtaking <strong>Pisac Ruins</strong>—some of the most impressive agricultural terraces in the entire Inca empire.",
    h2_2: "Lunch: Urubamba",
    p2_1: "Head along the river to Urubamba. We highly recommend stopping at <strong>Tunupa Restaurant</strong> for an elegant buffet lunch right on the banks of the Urubamba River. It's the perfect place to rest and refuel.",
    h2_3: "Afternoon: Ollantaytambo",
    p3_1: "End your afternoon in <strong>Ollantaytambo</strong>, known as the last living Inca town. The massive fortress here was the site of one of the greatest Inca victories against the Spanish. Climb the terraces for an incredible view of the valley.",
    h2_4: "Evening: Train to Aguas Calientes",
    p4_1: "Most travelers will catch their PeruRail or IncaRail train from the Ollantaytambo station in the late afternoon or early evening, heading to Aguas Calientes (Machu Picchu Pueblo) to sleep before their big hike the next day."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isEs ? "El Itinerario Definitivo de 1 Día en el Valle Sagrado" : metadata.title,
            "description": isEs ? content.desc : metadata.description,
            "image": "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop",
            "author": {
              "@type": "Organization",
              "name": "Vallecito"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Vallecito",
              "logo": {
                "@type": "ImageObject",
                "url": "https://vallecito.app/icon.svg"
              }
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

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center shadow-sm">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Map className="w-5 h-5 text-rose-600" /> {content.interactiveMap}
            </h3>
            <p className="text-sm text-slate-700 mb-4">
              {content.interactiveMapDesc}
            </p>
            <a 
              href={`/${lang}/explore?trip=classic-sacred-valley`}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
            >
              {content.openInMap} <Sparkles className="w-4 h-4 text-rose-400" />
            </a>
          </div>
          <div className="w-full md:w-48 aspect-video bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden shrink-0 relative">
            <Image src="https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=500&auto=format&fit=crop" alt="Sacred Valley" fill className="object-cover" />
          </div>
        </div>

        <div className="prose prose-slate prose-lg max-w-none">
          <h2>{content.h2_1}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p1_1 }} />
          <p dangerouslySetInnerHTML={{ __html: content.p1_2 }} />

          <h2>{content.h2_2}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p2_1 }} />

          <h2>{content.h2_3}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p3_1 }} />

          <h2>{content.h2_4}</h2>
          <p dangerouslySetInnerHTML={{ __html: content.p4_1 }} />
        </div>

      </div>
    </>
  );
}