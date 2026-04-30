export interface AgencyPackage {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  durationDays: number;
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'HARD';
  maxAltitude: number;
  imageUrl: string;
  included: string[];
  type: 'TREK' | 'DAY_EXPERIENCE';
}

export interface Agency {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  imageUrl: string;
  heroImage: string;
  specialties: string[];
  contactPhone: string;
  trekCount: number;
  experienceCount: number;
  guide: {
    name: string;
    initials: string;
    location: string;
    bio: string;
  };
  packages: AgencyPackage[];
}

export const AGENCIES: Agency[] = [
  {
    slug: "jaguar-llaqta",
    name: "Jaguar Llaqta",
    tagline: "The Pulse of the Andes",
    description: "Deeply rooted in the ancestral traditions of the Sacred Valley, Jaguar Llaqta offers more than just tours—we provide transformations. Led by native experts who carry the wisdom of the Quechua people, our expeditions take you into the heart of the living culture.",
    location: "Pisac, Sacred Valley",
    imageUrl: "/images/boleto/pisac-ruins.jpg",
    heroImage: "/images/boleto/sacsayhuaman.jpg",
    specialties: ["Ancestral Wisdom", "High-Altitude Treks", "Local Textiles"],
    contactPhone: "+51 987 654 321",
    trekCount: 5,
    experienceCount: 12,
    guide: {
      name: "Andean Native Team",
      initials: "JL",
      location: "Pisac / Sacred Valley",
      bio: "A collective of local guides dedicated to preserving and sharing the authentic heritage of our ancestors."
    },
    packages: [
      {
        id: "ausangate-trek",
        title: "Ausangate Spiritual Trek",
        description: "A 5-day journey around the sacred Apu Ausangate, visiting turquoise lagoons and high-alpine passes.",
        priceUsd: 650,
        durationDays: 5,
        difficulty: 'HARD',
        maxAltitude: 5200,
        imageUrl: "/images/boleto/sacsayhuaman.jpg",
        included: ["Private Guide", "Equipped Camping", "Horses", "Organic Meals", "Oxygen Support"],
        type: 'TREK'
      },
      {
        id: "pisac-living-culture",
        title: "Pisac Living Culture",
        description: "Spend a full day with the weavers of the Amaru community and explore the hidden trails of the ruins.",
        priceUsd: 120,
        durationDays: 1,
        difficulty: 'MODERATE',
        maxAltitude: 3400,
        imageUrl: "/images/boleto/pisac-ruins.jpg",
        included: ["Local Expert", "Textile Workshop", "Pachamanca Lunch"],
        type: 'DAY_EXPERIENCE'
      },
      {
        id: "ollantaytambo-sunrise",
        title: "Ollantaytambo Sunrise Ritual",
        description: "Witness the first light hitting the Sun Temple with a traditional coca leaf offering ceremony.",
        priceUsd: 85,
        durationDays: 1,
        difficulty: 'EASY',
        maxAltitude: 2800,
        imageUrl: "/images/boleto/ollantaytambo-ruins.jpg",
        included: ["Master Historian", "Ceremonial Elements", "Private Transport"],
        type: 'DAY_EXPERIENCE'
      },
      {
        id: "moray-lab",
        title: "Agricultural Lab of Moray",
        description: "A deep dive into the botanical intelligence of the Incas and the circular terraces of Moray.",
        priceUsd: 95,
        durationDays: 1,
        difficulty: 'EASY',
        maxAltitude: 3500,
        imageUrl: "/images/boleto/moray.jpg",
        included: ["Agronomist Guide", "Entry Fees", "Water & Snacks"],
        type: 'DAY_EXPERIENCE'
      }
    ]
  }
];
