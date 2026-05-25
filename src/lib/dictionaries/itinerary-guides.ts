export type ItineraryGuideContent = {
  title: string;
  intro: string;
  sections: { title: string; desc: string }[];
  image: string;
};

export type GuideDictionary = Record<string, { en: ItineraryGuideContent; es: ItineraryGuideContent }>;

export const ITINERARY_GUIDES: GuideDictionary = {
  "cusco-city-tour": {
    en: {
      title: "Cusco Classic City Tour",
      intro: "Uncover the layers of history in the imperial city, where Inca foundations seamlessly blend with colonial architecture.",
      image: "/images/boleto/sacsayhuaman.jpg",
      sections: [
        { title: "The Imperial Core", desc: "Walk through the historic Plaza de Armas and visit the Qorikancha, once the richest temple in the Inca empire, clad entirely in gold." },
        { title: "The Megalithic Outskirts", desc: "Head just outside the city to witness the sheer engineering scale of Sacsayhuaman and the mystical labyrinth of Q'enqo." }
      ]
    },
    es: {
      title: "City Tour Cusco Clásico",
      intro: "Descubre las capas de historia de la ciudad imperial, donde los cimientos incas se mezclan a la perfección con la arquitectura colonial.",
      image: "/images/boleto/sacsayhuaman.jpg",
      sections: [
        { title: "El Núcleo Imperial", desc: "Camina por la Plaza de Armas y visita el Qorikancha, que alguna vez fue el templo más rico del imperio Inca." },
        { title: "Las Afueras Megalíticas", desc: "Sal de la ciudad para presenciar la asombrosa ingeniería de Sacsayhuaman y el laberinto de Q'enqo." }
      ]
    }
  },
  "maras-moray": {
    en: {
      title: "Maras, Moray & Chinchero",
      intro: "An off-the-beaten-path adventure showcasing the incredible agricultural science of the Incas and the timeless weaving traditions of the Andes.",
      image: "/images/boleto/moray.jpg",
      sections: [
        { title: "Textiles and Terraces", desc: "Watch master weavers in Chinchero create intricate textiles before descending into the mysterious circular terraces of Moray." },
        { title: "The Salt of the Earth", desc: "Marvel at the thousands of cascading salt pools at Maras, harvested by local families exactly as they have been for centuries." }
      ]
    },
    es: {
      title: "Maras, Moray y Chinchero",
      intro: "Una aventura fuera de lo común que muestra la increíble ciencia agrícola de los Incas y las tradiciones textiles de los Andes.",
      image: "/images/boleto/moray.jpg",
      sections: [
        { title: "Textiles y Terrazas", desc: "Observa a las maestras tejedoras en Chinchero antes de descender a las misteriosas terrazas circulares de Moray." },
        { title: "La Sal de la Tierra", desc: "Maravíllate con las miles de pozas de sal en cascada en Maras, cosechadas por familias locales como hace siglos." }
      ]
      }
      },
      "ultimate-inca-ruins": {
      en: {
      title: "The Ultimate Inca Ruins Tour",
      intro: "A deep dive into the megalithic architecture and history of the Inca Empire's most impressive remaining structures.",
      image: "/images/boleto/ollantaytambo-ruins.jpg",
      sections: [
        { title: "Sacred Megaliths", desc: "Explore the towering stones of Sacsayhuaman and the intricate water temples of Tambomachay." },
        { title: "Living History", desc: "Walk the original Inca streets of Ollantaytambo and climb the formidable fortress defending the valley." }
      ]
    },
    es: {
      title: "El Tour Definitivo de Ruinas Incas",
      intro: "Una inmersión profunda en la arquitectura megalítica y la historia de las estructuras más impresionantes que quedan del Imperio Inca.",
      image: "/images/boleto/ollantaytambo-ruins.jpg",
      sections: [
        { title: "Megalitos Sagrados", desc: "Explora las imponentes piedras de Sacsayhuaman y los intrincados templos de agua de Tambomachay." },
        { title: "Historia Viva", desc: "Camina por las calles incas originales de Ollantaytambo y sube a la formidable fortaleza que defiende el valle." }
      ]
    }
  },
  "top-7-culinary-route": {
    en: {
      title: "Top 7 Culinary Route in Cusco",
      intro: "A gastronomic journey through the imperial city, featuring the best Novo-Andean cuisine, traditional courtyard dining, and innovative cocktails.",
      image: "/images/dummy/ceviche.jpg",
      sections: [
        { title: "Gourmet Mastery", desc: "Experience elevated Peruvian cuisine at spots like Chicha and MAP Café, where traditional ingredients meet modern technique." },
        { title: "Traditional & Rustic", desc: "Savor the authentic flavors of the Andes in cozy settings like Pachapapa and Uchu Peruvian Steakhouse." }
      ]
    },
    es: {
      title: "Ruta Culinaria Top 7 en Cusco",
      intro: "Un viaje gastronómico por la ciudad imperial, presentando la mejor cocina novoandina, cenas en patios tradicionales y cócteles innovadores.",
      image: "/images/dummy/ceviche.jpg",
      sections: [
        { title: "Maestría Gourmet", desc: "Experimenta la alta cocina peruana en lugares como Chicha y MAP Café, donde los ingredientes tradicionales se encuentran con la técnica moderna." },
        { title: "Tradicional y Rústico", desc: "Saborea los auténticos sabores de los Andes en ambientes acogedores como Pachapapa y Uchu Peruvian Steakhouse." }
      ]
    }
  }
};