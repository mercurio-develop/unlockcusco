import { Shield, Activity, Lock, Globe } from "lucide-react"

const features = [
  {
    name: "The Altitude-Safe Arrival",
    description:
      "Altitude sickness is the biggest mistake travelers make. We protect your health by automatically routing your arrival into the oxygen-rich, peaceful elevations of the Sacred Valley so your body adapts naturally.",
    icon: Shield,
  },
  {
    name: "The Perfect Daily Rhythm",
    description:
      "A great trip is about balance. We design your days with one breathtaking morning adventure, a meaningful cultural immersion in the afternoon, and evenings reserved for pure relaxation.",
    icon: Activity,
  },
  {
    name: "The Logistics Shield",
    description:
      "Machu Picchu tickets sell out and mountain transit is chaotic. We bypass the bureaucracy to secure your entries, sync your trains, and dispatch pre-vetted drivers. Your itinerary even works offline.",
    icon: Lock,
  },
  {
    name: "The Cultural Bridge",
    description:
      "We have a deep conscience of your needs. Built by expats and seasoned travelers, we intimately understand the friction of transitioning into a new culture. We guide you safely into our inner circle, handling the language barrier for you.",
    icon: Globe,
  },
]

export function FeaturesSection() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-rose-600 uppercase tracking-widest">
            The Vallecito Operating System
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-slate-900 sm:text-5xl font-serif">
            Everything you need to master the Sacred Valley
          </p>
          <p className="mt-6 text-lg/8 text-slate-600">
            We solve the fragmentation of Andean travel. Instead of piecing together scattered recommendations, Vallecito unifies discovery, planning, and booking into a single, cohesive intelligence.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-start">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5 mb-6">
                  <feature.icon aria-hidden="true" className="size-6 text-rose-600" />
                </div>
                <dt className="text-xl font-semibold text-slate-900 font-serif">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base/7 text-slate-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
