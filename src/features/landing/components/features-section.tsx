"use client"

import { Map, Link, MapPin, Bot, Waypoints, MessageSquare } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FeaturesSection({ dict }: { dict: Record<string, any> }) {
  return (
    <div id="features-section" className="bg-slate-50 py-24 sm:py-32 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:text-center mb-16 sm:mb-20">
          <h2 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4">
            {dict.featuresTag}
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-serif" dangerouslySetInnerHTML={{ __html: dict.featuresTitle }}>
          </p>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            {dict.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Interactive Exploration */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-full bg-rose-50 p-4">
                <Map className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">{dict.feat1Title}</h3>
            </div>
            <p className="text-slate-600 mb-10 leading-relaxed text-lg">
              {dict.feat1Desc}
            </p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <Link className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{dict.feat1Sub1Title}</h4>
                  <p className="text-base text-slate-600 mt-2 leading-relaxed">{dict.feat1Sub1Desc}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{dict.feat1Sub2Title}</h4>
                  <p className="text-base text-slate-600 mt-2 leading-relaxed">{dict.feat1Sub2Desc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Concierge */}
          <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 shadow-xl border border-slate-800 text-white">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-full bg-slate-800 p-4 border border-slate-700">
                <Bot className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">{dict.feat2Title}</h3>
            </div>
            <p className="text-slate-300 mb-10 leading-relaxed text-lg">
              {dict.feat2Desc}
            </p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <Waypoints className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">{dict.feat2Sub1Title}</h4>
                  <p className="text-base text-slate-400 mt-2 leading-relaxed">{dict.feat2Sub1Desc}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MessageSquare className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">{dict.feat2Sub2Title}</h4>
                  <p className="text-base text-slate-400 mt-2 leading-relaxed">{dict.feat2Sub2Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
