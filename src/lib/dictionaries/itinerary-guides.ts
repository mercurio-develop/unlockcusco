export type ItineraryGuideContent = {
  title: string;
  intro: string;
  sections: { title: string; desc: string }[];
  image: string;
};

export type GuideDictionary = Record<string, { en: ItineraryGuideContent; es: ItineraryGuideContent }>;

export const ITINERARY_GUIDES: GuideDictionary = {
  "classic-sacred-valley": {
    en: {
      title: "Classic Sacred Valley Full Day",
      intro: "The definitive route covering the absolute must-see highlights of the Sacred Valley. Perfect for those looking to maximize a single day before heading to Machu Picchu.",
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop",
      sections: [
        { title: "Morning: Alpacas & Ancient Markets", desc: "Start the day meeting Andean camelids at Awana Kancha, followed by a dive into the vibrant colors and traditions of the Pisac Artisan Market and its towering ruins." },
        { title: "Afternoon: The Living Inca Town", desc: "After a hearty lunch in Urubamba, explore the massive stone fortress of Ollantaytambo, standing exactly as it did during the Inca empire." }
      ]
    },
    es: {
      title: "Valle Sagrado Clásico (Día Completo)",
      intro: "La ruta definitiva que cubre lo mejor del Valle Sagrado. Perfecto para quienes buscan maximizar un solo día antes de dirigirse a Machu Picchu.",
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop",
      sections: [
        { title: "Mañana: Alpacas y Mercados", desc: "Comienza el día conociendo camélidos andinos en Awana Kancha, seguido de una inmersión en los colores del Mercado Artesanal de Pisac y sus ruinas." },
        { title: "Tarde: El Pueblo Inca Viviente", desc: "Después de un almuerzo en Urubamba, explora la enorme fortaleza de piedra de Ollantaytambo, que se mantiene exactamente como en la época inca." }
      ]
    }
  },
  "cusco-city-tour": {
    en: {
      title: "Cusco Classic City Tour",
      intro: "Uncover the layers of history in the imperial city, where Inca foundations seamlessly blend with colonial architecture.",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
      sections: [
        { title: "The Imperial Core", desc: "Walk through the historic Plaza de Armas and visit the Qorikancha, once the richest temple in the Inca empire, clad entirely in gold." },
        { title: "The Megalithic Outskirts", desc: "Head just outside the city to witness the sheer engineering scale of Sacsayhuaman and the mystical labyrinth of Q'enqo." }
      ]
    },
    es: {
      title: "City Tour Cusco Clásico",
      intro: "Descubre las capas de historia de la ciudad imperial, donde los cimientos incas se mezclan a la perfección con la arquitectura colonial.",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
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
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop",
      sections: [
        { title: "Textiles and Terraces", desc: "Watch master weavers in Chinchero create intricate textiles before descending into the mysterious circular terraces of Moray." },
        { title: "The Salt of the Earth", desc: "Marvel at the thousands of cascading salt pools at Maras, harvested by local families exactly as they have been for centuries." }
      ]
    },
    es: {
      title: "Maras, Moray y Chinchero",
      intro: "Una aventura fuera de lo común que muestra la increíble ciencia agrícola de los Incas y las tradiciones textiles de los Andes.",
      image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1000&auto=format&fit=crop",
      sections: [
        { title: "Textiles y Terrazas", desc: "Observa a las maestras tejedoras en Chinchero antes de descender a las misteriosas terrazas circulares de Moray." },
        { title: "La Sal de la Tierra", desc: "Maravíllate con las miles de pozas de sal en cascada en Maras, cosechadas por familias locales como hace siglos." }
      ]
    }
  },
  "machu-picchu-day": {
    en: {
      title: "Machu Picchu Complete Day",
      intro: "The culmination of your Andean journey. Explore the lost citadel of the Incas hidden deep within the cloud forest.",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
      sections: [
        { title: "The Lost Citadel", desc: "Wander through the temples, residential districts, and agricultural sectors of the world's most famous archaeological site." },
        { title: "The High Peak", desc: "For the adventurous, tackle the steep ascent of Huayna Picchu mountain for a bird's-eye view of the entire complex." }
      ]
    },
    es: {
      title: "Machu Picchu Día Completo",
      intro: "La culminación de tu viaje andino. Explora la ciudadela perdida de los Incas escondida en lo profundo del bosque nuboso.",
      image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
      sections: [
        { title: "La Ciudadela Perdida", desc: "Pasea por los templos, distritos residenciales y sectores agrícolas del sitio arqueológico más famoso del mundo." },
        { title: "La Cumbre Alta", desc: "Para los más aventureros, emprende el empinado ascenso a la montaña Huayna Picchu para obtener una vista panorámica." }
      ]
    }
  },
  "coffee-cacao-route": {
    en: {
      title: "The Route of Coffee and Cacao",
      intro: "Immerse yourself in Peru's rich agricultural heritage with a bean-to-cup and bean-to-bar journey through the valley and city.",
      image: "/images/dummy/mil.jpg",
      sections: [
        { title: "Morning: Sacred Valley Roasting", desc: "Start in Calca witnessing high-altitude beans being roasted and enjoy a guided cupping session." },
        { title: "Afternoon: Artisan Chocolate Workshop", desc: "Return to Cusco City for a hands-on workshop learning about native Cacao Chuncho and mold your own chocolate." }
      ]
    },
    es: {
      title: "La Ruta del Café y Cacao",
      intro: "Sumérgete en la rica herencia agrícola de Perú con un viaje desde el grano hasta la taza y la barra.",
      image: "/images/dummy/mil.jpg",
      sections: [
        { title: "Mañana: Tueste en el Valle Sagrado", desc: "Comienza en Calca viendo cómo se tuestan los granos a gran altitud y disfruta de una cata guiada." },
        { title: "Tarde: Taller de Chocolate Artesanal", desc: "Regresa a Cusco para un taller práctico sobre el Cacao Chuncho y elabora tu propio chocolate." }
      ]
    }
  }
};
