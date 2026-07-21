import { Sparkles, Map, Bot } from "lucide-react";
import { AffiliateCallout } from "@/components/ui/affiliate-callout";
import type { Locale } from "@/paths";
import { explorePath } from "@/paths";
import {
  getGuideContent,
} from "../content/guides-registry";
import { ITINERARY_GUIDE_SLUGS } from "../constants/guides-index";

export function DynamicGuideView({
  lang,
  slug,
}: {
  lang: Locale;
  slug: string;
}) {
  const isEs = lang === "es";
  const content = getGuideContent(slug, lang);

  if (!content) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <Bot className="w-16 h-16 mx-auto text-rose-500 mb-6" />
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">
          AI Guide Generation in Progress...
        </h1>
        <p className="text-slate-600 mb-8">
          Our AI Concierge is currently analyzing local data to generate the
          comprehensive guide for <strong>{slug}</strong>. Please check back
          later!
        </p>
      </div>
    );
  }

  return (
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

      {ITINERARY_GUIDE_SLUGS.includes(
        slug as (typeof ITINERARY_GUIDE_SLUGS)[number]
      ) && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Map className="w-5 h-5 text-slate-600" />{" "}
              {isEs ? "Ver en Mapa Interactivo" : "View on Interactive Map"}
            </h3>
            <p className="text-sm text-slate-600">
              {isEs
                ? "Explora esta ruta en nuestro mapa interactivo y conéctate con conductores locales."
                : "Explore this route on our interactive map and connect with local drivers."}
            </p>
          </div>
          <a
            href={explorePath(lang, { trip: slug })}
            className="inline-flex shrink-0 items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-rose-700 transition-colors"
          >
            {isEs ? "Cargar Ruta" : "Load Route"}{" "}
            <Sparkles className="w-4 h-4 text-rose-200" />
          </a>
        </div>
      )}

      <div className="prose prose-slate prose-lg max-w-none">
        {content.sections.map((section, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">
              {section.h2}
            </h2>
            <p className="text-slate-700 leading-relaxed">{section.p}</p>
          </div>
        ))}
      </div>

      {slug === "sacred-valley-1-day-itinerary" && (
        <AffiliateCallout
          title="Essential Gear: Rain Jacket"
          description="The weather in the Andes changes rapidly. A lightweight, packable rain jacket is absolutely essential for Machu Picchu and the Sacred Valley."
          link="https://www.amazon.com/dp/B00DQYQ28Q?tag=unlockcusco-20"
          ctaText="View on Amazon"
        />
      )}
    </div>
  );
}
