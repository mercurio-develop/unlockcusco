"use client"

import { Map, Link, MapPin, Bot, Waypoints, MessageSquare } from "lucide-react"

export function FeaturesSection() {
  return (
    <div id="features-section" className="bg-slate-50 py-24 sm:py-32 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:text-center mb-16 sm:mb-20">
          <h2 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4">
            Discover the Sacred Valley
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl font-serif">
            Authentic Experiences.<br/>Direct Connections.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Vallecito is an AI-powered local discovery platform connecting you directly with authentic businesses, reliable transport, and trusted services in the Sacred Valley, Peru.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Interactive Exploration */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="rounded-full bg-rose-50 p-4">
                <Map className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">Interactive Exploration</h3>
            </div>
            <p className="text-slate-600 mb-10 leading-relaxed text-lg">
              Explore the Sacred Valley through an immersive 3D map. Find exactly what you need with distinct category markers and connect directly with local business owners.
            </p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <Link className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Direct WhatsApp Access</h4>
                  <p className="text-base text-slate-600 mt-2 leading-relaxed">Skip the middlemen. Tap to instantly open a WhatsApp conversation with verified local guides and businesses.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Curated Categories</h4>
                  <p className="text-base text-slate-600 mt-2 leading-relaxed">Easily filter between transport hubs, trusted agencies, local dining, and wellness retreats using intuitive map markers.</p>
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
              <h3 className="text-2xl font-serif font-bold text-white">AI Concierge</h3>
            </div>
            <p className="text-slate-300 mb-10 leading-relaxed text-lg">
              Your personal guide to the Andes. Our intelligent assistant helps you generate custom multi-stop itineraries based on your exact location and preferences.
            </p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <Waypoints className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">Smart Routing</h4>
                  <p className="text-base text-slate-400 mt-2 leading-relaxed">Automatically calculates distances and travel times to suggest logically ordered stops for your day trips.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MessageSquare className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-white text-lg">Contextual Advice</h4>
                  <p className="text-base text-slate-400 mt-2 leading-relaxed">Ask questions about altitude, local customs, or hidden gems and receive instant, localized recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
