import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, Map } from "lucide-react";
import { getItinerary } from "@/features/itinerary/queries/get-itinerary";
import { ITINERARY_GUIDES } from "@/lib/dictionaries/itinerary-guides";
import { ItineraryTimelineDisplay } from "@/features/itinerary/components/itinerary-timeline-display";
import { ItineraryMapPreview } from "@/features/itinerary/components/itinerary-map-preview";
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

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <StoreInitializer initialItinerary={{ ...(itineraryData.state as unknown as OptimizedPlan), shortId: slug }} />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[70vh] w-full">
        <Image
          src={content.image}
          alt={content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 mt-12">
          <span className="bg-rose-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            {isEs ? "Guía de Itinerario" : "Itinerary Guide"}
          </span>
          <h1 className="text-4xl md:text-7xl font-serif text-white text-center max-w-5xl tracking-tight leading-tight">
            {content.title}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-16 md:mt-24">
        {/* The Story */}
        <div className="space-y-12 text-center mb-16">
          <p className="text-2xl md:text-3xl text-slate-600 font-light leading-relaxed max-w-3xl mx-auto">
            &ldquo;{content.intro}&rdquo;
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-16 pt-16 border-t border-slate-200">
            {content.sections.map((sec, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-4">{sec.title}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Preview Call to Action (Full Width) */}
      <ItineraryMapPreview slug={slug} lang={lang} isEs={isEs} />

      <div className="max-w-5xl mx-auto px-4">
        {/* Timeline Header */}
        <div className="text-center mb-8">
          <h3 className="font-serif text-4xl font-bold text-slate-900 mb-4">
            {isEs ? "Tu Ruta Paso a Paso" : "Your Step-by-Step Route"}
          </h3>
          <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">
             {isEs ? "Lugares, Tiempos y Logística" : "Places, Times & Logistics"}
          </p>
        </div>

        {/* The New Serpentine Timeline */}
        <ItineraryTimelineDisplay isEs={isEs} />
      </div>
    </div>
  );
}