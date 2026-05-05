export interface TherapistService {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  durationMins: number;
  imageUrl?: string;
}

export interface Business {
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  location: string;
  imageUrl: string;
  heroImage: string;
  specialties: string[];
  whatsapp: string;
  rating: number;
  reviewsCount: number;
  services: TherapistService[];
}

export const THERAPISTS: Business[] = [
  {
    slug: "alma-sanadora",
    name: "Alma Sanadora",
    tagline: "Sacred Healing through Sound & Touch",
    bio: "With over 15 years of experience in the ancestral healing arts of the Andes, Alma combines modern massage therapy with ancient vibration techniques. Her sanctuary in Urubamba is a space of pure silence and restoration, where every session is a ritual of returning to the self.",
    location: "Urubamba, Sacred Valley",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800",
    heroImage: "https://images.unsplash.com/photo-1590483736622-39818817daaa?q=80&w=1200",
    specialties: ["Deep Tissue", "Sound Healing", "Registros Akáshicos", "Aromatherapy"],
    whatsapp: "+51 999 888 777",
    rating: 4.9,
    reviewsCount: 42,
    services: [
      {
        id: "deep-tissue-ritual",
        title: "Andean Deep Tissue Ritual",
        description: "A transformative physical session using local essential oils and deep pressure to release mountain-trek tension.",
        priceUsd: 85,
        durationMins: 90,
        imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800"
      },
      {
        id: "akashic-reading",
        title: "Registros Akáshicos",
        description: "A deep spiritual inquiry into your soul's journey, providing clarity and alignment for your time in the valley.",
        priceUsd: 120,
        durationMins: 60,
        imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800"
      },
      {
        id: "sound-bath",
        title: "Vibrational Sound Bath",
        description: "Experience the resonance of Tibetan bowls and Andean flutes in a private immersive session.",
        priceUsd: 70,
        durationMins: 45,
        imageUrl: "https://images.unsplash.com/photo-1602058474246-8805f8cc4ec2?q=80&w=800"
      }
    ]
  }
];
