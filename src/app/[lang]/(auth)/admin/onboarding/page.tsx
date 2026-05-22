'use client'

import { useState } from "react"
import { submitPremiumOnboarding } from "./actions"

export default function OnboardingPage() {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })
  const [loading, setLoading] = useState(false)

  // Quick default JSON for pillars & packages to make copy-pasting easier
  const defaultPillars = JSON.stringify([
    { title: "Example Pillar", description: "This is an example pillar.", icon: "Star" }
  ], null, 2)

  const defaultPackages = JSON.stringify([
    {
      title: "Example Tour",
      tagline: "Unforgettable experience",
      description: "A wonderful journey.",
      durationDays: 1,
      difficulty: "EASY",
      pace: "Relaxed",
      basePriceUsd: 100,
      included: JSON.stringify(["Guide"]),
      highlights: JSON.stringify(["Sightseeing"]),
      itinerary: JSON.stringify(["Day 1: Start"]),
      gallery: JSON.stringify(["https://example.com/image.jpg"])
    }
  ], null, 2)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: null, message: '' })

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await submitPremiumOnboarding(formData)
      if (res.success) {
        setStatus({ type: 'success', message: res.message })
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatus({ type: 'error', message: res.message })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit";
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-3xl font-bold mb-8 font-serif">Premium Business Onboarding</h1>
      
      {status.type && (
        <div className={`p-4 rounded-lg mb-8 ${status.type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-800' : 'bg-red-900/50 text-red-200 border border-red-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">1. Core Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Business Name</label>
              <input name="name" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-zinc-400">URL Slug</label>
              <input name="slug" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Category</label>
              <select name="category" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white">
                <option value="AGENCY">Agency (Expeditions)</option>
                <option value="WELLNESS">Wellness (Sanctuary)</option>
                <option value="DINING">Dining</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Location Slug</label>
              <input name="locationSlug" required defaultValue="cusco" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-zinc-400">WhatsApp Number</label>
              <input name="whatsapp" required placeholder="51912345678" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Tagline</label>
            <input name="tagline" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Description</label>
            <textarea name="description" rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Main Image URL</label>
            <input name="imageUrl" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
          </div>
        </div>

        {/* Premium Profile */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">2. Premium Profile & Branding</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Logo URL</label>
              <input name="logoUrl" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Cover Photo URL</label>
              <input name="coverPhotoUrl" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Primary Color (Hex)</label>
              <input name="primaryColor" defaultValue="#09090B" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Accent Color (Hex)</label>
              <input name="accentColor" defaultValue="#D4AF37" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1 text-zinc-400">Fonts</label>
              <input name="fonts" defaultValue="Inter, Playfair Display" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Vision/Mission Statement</label>
            <textarea name="visionStatement" rows={2} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Pillars (JSON Array)</label>
            <textarea name="pillars" defaultValue={defaultPillars} rows={5} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs" />
          </div>
        </div>

        {/* Packages */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">3. Offerings / Packages</h2>
          <div>
            <label className="block text-sm mb-1 text-zinc-400">Tour Packages (JSON Array)</label>
            <textarea name="tourPackages" defaultValue={defaultPackages} rows={10} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-xs" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating Profile..." : "Generate Premium Business Profile"}
        </button>
      </form>
    </div>
  )
}
