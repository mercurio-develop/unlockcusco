import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, Map } from "lucide-react";
import { getItinerary } from "@/features/itinerary/queries/get-itinerary";
import { ITINERARY_GUIDES } from "@/lib/dictionaries/itinerary-guides";
import { ItineraryTimelineDisplay } from "@/features/itinerary/components/itinerary-timeline-display";
import { StoreInitializer } from "@/lib/store/store-initializer";
import type { OptimizedPlan } from "@/lib/ai/schemas/planner-schema";
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ lang: string, slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const guideData = ITINERARY_GUIDES[slug];
  if (!guideData) return { title: "Itinerary - UnlockCusco" };
  const content = lang === 'es' ? guideData.es : guideData.en;
  return {
    title: `${content.title} - UnlockCusco`,
    description: content.intro,
  };
}

export default async function DynamicItineraryPage(props: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = await props.params;
  const isEs = lang === 'es';

  // Fetch from DB
  const itineraryData = await getItinerary(slug);
  if (!itineraryData?.success || !itineraryData.state) {
    notFound();
  }

  // Fetch Static Text
  const guideData = ITINERARY_GUIDES[slug];
  if (!guideData) {
    notFound();
  }

  const content = isEs ? guideData.es : guideData.en;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const waypoints = (itineraryData.state as any).waypoints || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[60vh] w-full">
        <Image
          src={content.image}
          alt={content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            {isEs ? "Guía de Itinerario" : "Itinerary Guide"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-white text-center max-w-4xl tracking-tight">
            {content.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Col: The Story */}
        <div className="md:col-span-2 space-y-8">
          <p className="text-xl text-slate-600 font-light leading-relaxed">
            {content.intro}
          </p>

          <div className="prose prose-slate lg:prose-lg max-w-none">
            {content.sections.map((sec, i) => (
              <div key={i}>
                <h2>{sec.title}</h2>
                <p>{sec.desc}</p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-12 text-center">
            <Map className="w-8 h-8 text-rose-600 mx-auto mb-4" />
            <h3 className="font-bold text-xl text-slate-900 mb-2">
              {isEs ? "Personaliza esta Ruta" : "Customize this Route"}
            </h3>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">
              {isEs 
                ? "Abre esta ruta en nuestro mapa interactivo y haz que nuestro conserje de IA la adapte a tus necesidades."
                : "Open this route in our interactive map and have our AI concierge tailor it to your needs."}
            </p>
            <Link 
              href={`/${lang}/explore?trip=${slug}`}
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-md"
            >
              {isEs ? "Abrir en Mapa Interactivo" : "Open Interactive Map"} <Sparkles className="w-4 h-4 text-rose-400" />
            </Link>
          </div>
        </div>

        {/* Right Col: Timeline */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <h3 className="font-bold text-lg text-slate-900 mb-6 pb-4 border-b border-slate-200">
              {isEs ? "Lugares a Visitar" : "Places to Visit"}
            </h3>
            <StoreInitializer initialItinerary={{ ...(itineraryData.state as unknown as OptimizedPlan), shortId: slug }} />
            <ItineraryTimelineDisplay isEs={isEs} />
          </div>
        </div>

      </div>
    </div>
  );
}