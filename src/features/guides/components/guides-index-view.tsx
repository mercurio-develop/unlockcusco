import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/paths";
import { guidePath } from "@/paths";
import {
  GUIDES_INDEX_EN,
  GUIDES_INDEX_ES,
} from "../constants/guides-index";

export function GuidesIndexView({ lang }: { lang: Locale }) {
  const isEs = lang === "es";
  const guides = isEs ? GUIDES_INDEX_ES : GUIDES_INDEX_EN;

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
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={guidePath(lang, guide.slug)}
            className="group block bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {guide.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {guide.description}
              </p>
            </div>
            <div className="text-indigo-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
              {isEs ? "Leer Guía" : "Read Guide"}{" "}
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
