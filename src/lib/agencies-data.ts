export type AgencyTrek = {
  id: string
  title: string
  subtitle: string
  price: number
  difficulty: string
  maxAltitude: string
  photo: string
  summary: string
  includes: string[]
}

export type AgencyExperience = {
  id: string
  title: string
  subtitle: string
  price: number
  duration: string
  difficulty: string
  photo: string
  summary: string
}

export type Agency = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  guide: string
  location: string
  specialty: string[]
  coverPhoto: string
  treks: AgencyTrek[]
  dayExperiences: AgencyExperience[]
}

const COVER = "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2400&auto=format&fit=crop"

export const AGENCIES: Agency[] = [
  {
    id: "jaguar-llaqta",
    slug: "jaguar-llaqta",
    name: "Jaguar Llaqta",
    tagline: "Sacred Valley's Premier Off-Path Expedition Guide",
    description:
      "Founded by Álvaro Mauricio Ugarte Forno, Jaguar Llaqta specialises in off-the-beaten-path trekking, Andean spiritual experiences, and deep community encounters. Every route is chosen for its raw authenticity — the kind that disappears when the masses arrive.",
    guide: "Álvaro Mauricio Ugarte Forno",
    location: "Sacred Valley, Cusco Region",
    specialty: ["Off-path trekking", "Spiritual ceremonies", "Community tourism", "Amazon expeditions"],
    coverPhoto: COVER,
    treks: [
      {
        id: "lares",
        title: "Lares Trek",
        subtitle: "3 Days · 2 Nights",
        price: 450,
        difficulty: "Moderate – Challenging",
        maxAltitude: "4,800 m",
        photo: "/images/boleto/chinchero-ruins.jpg",
        summary:
          "Cross the Urubamba mountain range through high-Andean forests, lagoons, condor sightings, and traditional communities. Concludes at the famous medicinal hot springs of Lares.",
        includes: ["Round-trip transport", "Full board 3D/2N", "Camping + local lodges", "Mountaineering equipment", "Lares hot springs entry"],
      },
      {
        id: "ausangate",
        title: "Ausangate Trek",
        subtitle: "3 Days · 2 Nights",
        price: 450,
        difficulty: "Moderate – Challenging",
        maxAltitude: "4,800 m",
        photo: "/images/boleto/tambomachay.jpg",
        summary:
          "Circumnavigate the sacred Apu Ausangate (6,385 m). Seven high-altitude lakes, hot springs at Pacchanta, and the living textile traditions of highland families.",
        includes: ["Private transport", "Professional guide", "Full board 3D/2N", "Family accommodation", "Conservation area entry"],
      },
      {
        id: "choquequirao",
        title: "Choquequirao Trek",
        subtitle: "4 Days · 3 Nights",
        price: 600,
        difficulty: "Challenging",
        maxAltitude: "3,900 m",
        photo: "/images/boleto/pisac-ruins.jpg",
        summary:
          "62 km round-trip to the sacred sister of Machu Picchu — one of the least-visited Inca citadels in Peru. Deep canyon crossings, cloud-forest ecosystems, zero crowds.",
        includes: ["Private transport", "Full board 4D/3N", "Professional guide", "Site entrance"],
      },
      {
        id: "manu",
        title: "Manu Rainforest",
        subtitle: "5 Days · 4 Nights",
        price: 600,
        difficulty: "Moderate",
        maxAltitude: "4,000 m → 300 m",
        photo: "/images/boleto/tipon.jpg",
        summary:
          "Descend from the Andes into one of Earth's most biodiverse parks. Rafting, jungle treks with a Harakbut family, thermomedicinal hot springs, and the legend of Paititi.",
        includes: ["Professional guide", "Full board 5D/4N", "Land + river transport", "Harakbut community night"],
      },
    ],
    dayExperiences: [
      {
        id: "inti-punku",
        title: "Inti Punku — Sun Gate",
        subtitle: "Full Day",
        price: 150,
        duration: "6–7 hours",
        difficulty: "Moderate",
        photo: "/images/boleto/ollantaytambo-ruins.jpg",
        summary:
          "Ascend above Ollantaytambo to the Inca Sun Gate — a sacred portal with panoramic views of the Wilkamayu River and Apu Veronica. Traditional Andean offering at the summit.",
      },
      {
        id: "pumamarca",
        title: "Pumamarca Ruins",
        subtitle: "Full Day",
        price: 85,
        duration: "5 hours round trip",
        difficulty: "Moderate",
        photo: "/images/boleto/q-enqo.jpg",
        summary: "Pre-Inca fortress on the outskirts of Ollantaytambo. Gradual ascent through ancient terraces with views over multiple valleys. Zero tourist crowds.",
      },
      {
        id: "cancha-cancha",
        title: "Cancha Cancha Community",
        subtitle: "Full Day",
        price: 100,
        duration: "5 hours",
        difficulty: "Moderate",
        photo: "/images/boleto/moray.jpg",
        summary: "Trek through the Huaran Valley to a high Andean community. Traditional lunch with a local family, livestock herding, and live ancestral textile demonstrations.",
      },
      {
        id: "spiritual",
        title: "Temazcal + Despacho",
        subtitle: "Full Day",
        price: 100,
        duration: "Full day",
        difficulty: "Spiritual",
        photo: "/images/boleto/puka-pukara.jpg",
        summary: "Andean offering to Pachamama followed by a 3-hour Temazcal steam ceremony in Arin village. Cleansing of body, mind, and spirit using fire and volcanic stones.",
      },
      {
        id: "naupa-waka",
        title: "Naupa Waka",
        subtitle: "Half Day",
        price: 80,
        duration: "Half day",
        difficulty: "Easy",
        photo: "/images/boleto/sacsayhuaman.jpg",
        summary: "One of the most enigmatic sacred sites in the Sacred Valley — an ancient portal carved into rock with precise astronomical alignment. Guided spiritual interpretation.",
      },
      {
        id: "pumawanka",
        title: "Pumawanka Circuit",
        subtitle: "Full Day",
        price: 90,
        duration: "Full day",
        difficulty: "Moderate",
        photo: "/images/boleto/pikillaqta.jpg",
        summary: "A rarely-visited sacred circuit above the Sacred Valley combining Inca engineering, natural springs, and deep spiritual significance. Traditional coca ceremony included.",
      },
    ],
  },
]

export function getAgencyBySlug(slug: string): Agency | undefined {
  return AGENCIES.find(a => a.slug === slug)
}
