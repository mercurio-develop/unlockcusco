import Image from "next/image";
import Link from "next/link";
import { Sparkles, Map } from "lucide-react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "The Route of Coffee and Cacao - UnlockCusco",
  description: "A journey through Peru's finest coffee beans in the Sacred Valley and artisan chocolate making in Cusco City.",
};

export default async function CoffeeCacaoRoutePage(props: { params: Promise<{ lang: string }> }) {
  const { lang } = await props.params;
  const isEs = lang === 'es';

  const content = isEs ? {
    title: "La Ruta del Café y Cacao",
    intro: "Sumérgete en la rica herencia agrícola de Perú con un viaje desde el grano hasta la taza y la barra.",
    interactiveMap: "Mapa de Ruta Interactivo",
    interactiveMapDesc: "Carga esta ruta en nuestro mapa interactivo y conéctate con conductores.",
    openInMap: "Abrir en Mapa de UnlockCusco",
    section1: "Mañana: Tueste en el Valle Sagrado",
    desc1: "Comienza en Calca viendo cómo se tuestan los granos a gran altitud y disfruta de una cata guiada.",
    section2: "Tarde: Taller de Chocolate Artesanal",
    desc2: "Regresa a Cusco para un taller práctico sobre el Cacao Chuncho y elabora tu propio chocolate.",
  } : {
    title: "The Route of Coffee and Cacao",
    intro: "Immerse yourself in Peru's rich agricultural heritage with a bean-to-cup and bean-to-bar journey.",
    interactiveMap: "Interactive Route Map",
    interactiveMapDesc: "Load this route into our interactive map and connect with drivers.",
    openInMap: "Open in UnlockCusco Map",
    section1: "Morning: Sacred Valley Roasting",
    desc1: "Start in Calca witnessing high-altitude beans being roasted and enjoy a guided cupping session.",
    section2: "Afternoon: Artisan Chocolate Workshop",
    desc2: "Return to Cusco City for a hands-on workshop learning about native Cacao Chuncho and mold your own chocolate.",
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[60vh] w-full">
        <Image
          src="/images/dummy/mil.jpg" // Placeholder for coffee/cacao image
          alt={content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white text-center px-4 max-w-4xl tracking-tight">
            {content.title}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8 md:mt-12">
        <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed mb-8 md:mb-12">
          {content.intro}
        </p>

        {/* Interactive Map Box */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-lg md:text-xl text-slate-900 flex items-center gap-2">
                <Map className="w-5 h-5 text-rose-600" /> {content.interactiveMap}
              </h3>
              <p className="text-slate-600">
                {content.interactiveMapDesc}
              </p>
            </div>
            <Link 
              href={`/${lang}/explore?trip=coffee-cacao-route`}
              className="bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shrink-0 flex items-center gap-2 w-full md:w-auto justify-center shadow-md shadow-rose-600/20"
            >
              {content.openInMap} <Sparkles className="w-4 h-4 text-rose-400" />
            </Link>
          </div>
        </div>

        <div className="prose prose-slate lg:prose-lg max-w-none">
          <h2>{content.section1}</h2>
          <p>{content.desc1}</p>

          <h2>{content.section2}</h2>
          <p>{content.desc2}</p>
        </div>
      </div>
    </div>
  );
}
