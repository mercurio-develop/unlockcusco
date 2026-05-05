export type ActivityCategory = "rutas" | "comunidad" | "ceremonias";

export interface DayItinerary {
  day: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  highlights?: string[];
  highlightsEn?: string[];
  meals?: string;
  mealsEn?: string;
  accommodation?: string;
  accommodationEn?: string;
}

export interface Package {
  id: string;
  categories: ActivityCategory[];
  name: string;
  nameEn: string;
  /**
   * Optional explicit hero image for this package.
   * If provided, it will be used in ActivityHero and package cards
   * before falling back to the first gallery image or category defaults.
   */
  heroImage?: string;
  /**
   * Optional CSS object-position for the hero image.
   * e.g., "center 25%" or "top center".
   */
  heroImagePosition?: string;
  tagline: string;
  taglineEn: string;
  duration: string;
  durationEn?: string;
  difficulty?: string;
  difficultyEn?: string;
  maxPeople?: string;
  elevation?: string;
  bestSeason?: string;
  bestSeasonEn?: string;
  price: number;
  description: string;
  descriptionEn: string;
  note?: string;
  noteEn?: string;
  highlights: string[];
  highlightsEn: string[];
  includes: string[];
  includesEn: string[];
  notIncludes: string[];
  notIncludesEn: string[];
  requirements: string[];
  requirementsEn: string[];
  itinerary: DayItinerary[];
}

export const packages: Package[] = [
  {
    id: "cancha-cancha",
    categories: ["comunidad", "rutas"],
    name: "Cancha Cancha",
    nameEn: "Cancha Cancha",
    heroImage: "/agencies/jaguarllaqta/hero.jpg",
    tagline: "Caminata y Encuentro con una Comunidad Altoandina",
    taglineEn: "Hike and encounter with a high Andean community",
    duration: "Día completo",
    durationEn: "Full day",
    difficulty: "Moderado",
    difficultyEn: "Moderate",
    elevation: "3,200m. - 4,000m.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 100,
    description: "Esta caminata de día completo se realiza en el valle de Huaran, dentro de la cordillera del Urubamba. El recorrido ofrece paisajes naturales, flora nativa y ecosistemas altoandinos. La experiencia culmina en la comunidad altoandina de Cancha Cancha, donde una familia local recibe a los visitantes para compartir un almuerzo tradicional y conocer su forma de vida, agricultura, ganadería y textiles ancestrales.",
    descriptionEn: "This full-day trek takes place in the Huaran Valley, located in the Urubamba mountain range. The route offers scenic landscapes with native plants, high-Andean ecosystems, and traditional rural life. The experience culminates in the high Andean community of Cancha Cancha, where visitors are welcomed by a local family to share a traditional lunch and learn about daily life, agriculture, livestock, and traditional textiles.",
    highlights: ["Comunidad Cancha Cancha", "Almuerzo tradicional", "Textiles ancestrales", "Ecosistemas altoandinos"],
    highlightsEn: ["Cancha Cancha community", "Traditional lunch", "Ancestral textiles", "High-Andean ecosystems"],
    includes: [
      "Guía profesional",
      "Almuerzo local tradicional",
      "Experiencia cultural con familia local"
    ],
    includesEn: [
      "Professional guide",
      "Traditional local lunch",
      "Cultural experience with a local family"
    ],
    notIncludes: [
      "Transporte privado ida y vuelta",
      "Snacks personales",
      "Equipo personal de montaña"
    ],
    notIncludesEn: [
      "Private round-trip transportation",
      "Personal snacks",
      "Personal mountain equipment"
    ],
    requirements: [
      "Sombrero o gorra",
      "Bloqueador solar",
      "Botella de agua",
      "Dinero en efectivo",
      "DNI o Pasaporte",
      "Cámara fotográfica",
      "Ropa para Lluvia",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Sun hat or cap",
      "Sunscreen",
      "Water bottle",
      "Cash for souvenirs",
      "ID / Passport",
      "Camera",
      "Rain gear",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Cancha Cancha – Valle Sagrado",
        titleEn: "Sacred Valley – Cancha Cancha – Sacred Valley",
        description: "07:15 AM – Recojo desde su alojamiento en el Valle Sagrado y traslado a Saywapata (3,200 m s. n. m.). 08:30 AM – Inicio de la caminata. Ascenso aproximado de 3 horas. 11:30 AM – Llegada a la comunidad de Cancha Cancha. Recepción y almuerzo tradicional. 02:00 PM – Caminata de retorno (aprox. 2 horas en descenso). 04:30 PM – Traslado de retorno al Valle Sagrado.",
        descriptionEn: "07:15 AM – Pick-up from your accommodation in the Sacred Valley and transfer to Saywapata (3,200 m a.s.l.). 08:30 AM – Start of the hike. Approx. 3-hour ascent. 11:30 AM – Arrival at Cancha Cancha community. Welcome and traditional lunch. 02:00 PM – Return hike (approx. 2 hours downhill). 04:30 PM – Transfer back to the Sacred Valley.",
        highlights: ["Cancha Cancha", "Almuerzo tradicional"],
        highlightsEn: ["Cancha Cancha", "Traditional lunch"],
        meals: "Almuerzo",
        mealsEn: "Lunch",
        accommodation: "N/A",
        accommodationEn: "N/A"
      }
    ],
  },

  {
    id: "inti-punku",
    categories: ["rutas"],
    name: "Inti Punku",
    nameEn: "Inti Punku",
    heroImage: "/agencies/jaguarllaqta/inti-punku/inti-punku-hero.jpg",
    tagline: "Camina hacia el portal sagrado de los incas",
    taglineEn: "Hike to the sacred Inca portal",
    duration: "Día completo",
    durationEn: "Full day",
    difficulty: "Moderado a Desafiante",
    difficultyEn: "Moderate to Challenging",
    elevation: "3000m - 3900m max.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 125,
    description: "Esta caminata de día completo se realiza en los alrededores del histórico pueblo inca de Ollantaytambo. Un transporte nos lleva hasta la comunidad andina de Cacchicata, punto de inicio de la caminata. El recorrido incluye aproximadamente cuatro horas de ascenso a través de paisajes con flora y fauna nativa. La caminata conduce a un sitio arqueológico enigmático y culmina en Inti Punku, conocido por los incas como la Puerta del Sol, un portal sagrado con una de las mejores vistas del Valle Sagrado, el río Wilkamayu y la montaña sagrada Apu Waqay Willka (Apu Verónica).",
    descriptionEn: "This full-day hike takes place just outside the historic Inca town of Ollantaytambo. Transportation takes us to the Andean community of Cacchicata, where the trek begins. The route includes approximately four hours of ascent through landscapes rich in native flora and fauna. The hike leads to an enigmatic archaeological site and culminates at Inti Punku, known by the Incas as the Sun Gate — a sacred portal offering one of the most impressive panoramic views of the Sacred Valley, the Wilkamayu River, and the sacred mountain Apu Waqay Willka (Apu Veronica).",
    highlights: ["Comunidad de Cacchicata", "Puerta del Sol (Inti Punku)", "Vistas del Apu Waqay Willka", "Canteras Incas"],
    highlightsEn: ["Cacchicata Community", "Sun Gate (Inti Punku)", "Views of Apu Waqay Willka", "Inca Quarries"],
    includes: [
      "Guía profesional",
      "Refrigerio",
      "Interpretación cultural e histórica"
    ],
    includesEn: [
      "Professional guide",
      "Box Lunch",
      "Cultural and historical interpretation"
    ],
    notIncludes: [
      "Snacks personales",
      "Equipo personal de montaña",
      "Transporte privado ida y vuelta desde el Valle Sagrado"
    ],
    notIncludesEn: [
      "Private round-trip transportation from the Sacred Valley",
      "Personal snacks",
      "Personal mountain equipment"
    ],
    requirements: [
      "Sombrero o gorra",
      "Bloqueador solar",
      "Botella de agua",
      "Dinero en efectivo",
      "DNI o Pasaporte",
      "Cámara fotográfica",
      "Ropa para Lluvia",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Sun hat or cap",
      "Sunscreen",
      "Water bottle",
      "Cash for souvenirs",
      "ID / Passport",
      "Camera",
      "Rain gear",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Ollantaytambo– Cacchicata – Inti Punku",
        titleEn: "Ollantaytamboy – Cacchicata – Inti Punku",
        description: "06:30 AM – Recojo desde su alojamiento en el Valle Sagrado y traslado a la comunidad de Cacchicata. 08:00 AM – Inicio de la caminata. Ascenso de aproximadamente 3 a 4 horas. 12:00 PM – Llegada a Inti Punku. Tiempo de descanso, apreciación del paisaje y picnic. 02:00 PM – Inicio del descenso, visitando las antiguas canteras incas de Cacchicata. 05:00 PM – Fin de la caminata y traslado privado de retorno.",
        descriptionEn: "06:30 AM – Pick-up from your accommodation in the Sacred Valley and transfer to Cacchicata. 08:00 AM – Start of the hike. Ascent of approximately 3 to 4 hours. 12:00 PM – Arrival at Inti Punku. Time to rest, enjoy the views and enjoy a luch box. 02:00 PM – Start of the descent, passing by the ancient Inca quarries of Cacchicata. 05:00 PM – End of the hike and private transfer back to your accommodation.",
        highlights: ["Inti Punku", "Canteras Incas", "Ofrenda de hojas de coca"],
        highlightsEn: ["Inti Punku", "Inca Quarries","Coca leaf offering"],
        meals: "Almuerzo",
        mealsEn: "Lunch",
        accommodation: "",
        accommodationEn: ""
      }
    ],
  },

  {
    id: "naupa-waka",
    categories: ["rutas"],
    name: "Ñaupa Waka",
    nameEn: "Ñaupa Waka",
    heroImage: "/agencies/jaguarllaqta/naupa-waka/naupa-waka-hero.jpg",
    tagline: "Centro ceremonial Inca",
    taglineEn: "Inca ceremonial center",
    duration: "Medio día",
    durationEn: "Half day",
    difficulty: "Fácil",
    difficultyEn: "Easy",
    elevation: "2800m max.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 80,
    description: "Esta experiencia de medio día se desarrolla en el Valle Sagrado de los Incas, cerca del pueblo de Pacchar, ubicado antes de Ollantaytambo. El recorrido conduce a un extraordinario sitio ceremonial inca oculto en la montaña. Tras una corta caminata en ascenso, se llega a Ñaupa Waka, un oráculo sagrado utilizado como centro ceremonial y observatorio estelar. En el interior de una cueva se encuentra un altar de piedra tallado con formas geométricas relacionadas con la Chakana inca, símbolo de gran importancia espiritual. Es un lugar único y especial, ideal para quienes buscan una conexión profunda con la cultura andina.",
    descriptionEn: "This half-day experience takes place in the Sacred Valley of the Incas, near the town of Pacchar, located before Ollantaytambo. The journey leads to an extraordinary Inca ceremonial site hidden within the mountain. After a short uphill walk, visitors reach Ñaupa Waka, a sacred Inca oracle believed to have been used as a ceremonial center and stellar observatory. Inside a cave, a carved stone altar displays geometric shapes closely related to the Inca Chakana, a symbol of great spiritual importance. This is a unique and powerful place, ideal for travelers seeking a deep cultural and spiritual connection.",
    highlights: ["Altar de piedra tallado", "Observatorio estelar Inca", "Ofrenda de hojas de coca", "Cervecería del Valle Sagrado (opcional)"],
    highlightsEn: ["Carved stone altar", "Inca stellar observatory", "Coca leaf offering", "Sacred Valley Brewery (optional)"],
    includes: [
      "Guía profesional e interpretación",
      "Ofrenda andina tradicional",
      "Snack"
    ],
    includesEn: [
      "Professional guide and interpretation",
      "Traditional Andean offering",
      "Snack"
    ],
    notIncludes: [
      "Transporte privado",
      "Consumos en la cervecería",
      "Gastos personales"
    ],
    notIncludesEn: [
      "Private transportation",
      "Meals at the brewery",
      "Personal expenses"
    ],
    requirements: [
      "Sombrero o gorra",
      "Cámara fotográfica",
      "Botella de agua",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Sun hat or cap",
      "Camera",
      "Water bottle",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Pacchar – Ñaupa Waka",
        titleEn: "Sacred Valley – Pacchar – Ñaupa Waka",
        description: "08:30 AM – Recojo desde su hotel en el Valle Sagrado y traslado al pueblo de Pacchar (aprox. 45 minutos). 09:30 AM – Llegada al punto de inicio y caminata corta de 25–30 minutos en ascenso hacia las terrazas incas y el templo. 10:00 AM – Visita al templo sagrado de Ñaupa Waka. Ofrenda andina tradicional con hojas de coca, acompañada de música intuitiva para conectar con el lugar. Tiempo libre para recorrer y disfrutar del sitio (aprox. 2 horas). 12:00 PM – Descenso hacia Pacchar y visita a la Cervecería del Valle Sagrado, donde se puede disfrutar de cerveza artesanal y comida local (opcional). 01:00 PM – Traslado privado de retorno a su hotel.",
        descriptionEn: "08:30 AM – Pick-up from your hotel in the Sacred Valley and transfer to the town of Pacchar (approx. 45 minutes). 09:30 AM – Arrival at the starting point. Short uphill walk of approximately 25–30 minutes towards the Inca terraces and temple. 10:00 AM – Visit to the sacred temple of Ñaupa Waka. Traditional Andean offering using coca leaves, accompanied by intuitive music to connect with the place. Free time to explore and enjoy the site (approx. 2 hours). 12:00 PM – Descent back to Pacchar and visit to the Sacred Valley Brewery, where you can enjoy handmade beer and local food (optional). 01:00 PM – Private transport back to your hotel.",
        highlights: ["Ñaupa Waka", "Ofrenda de hojas de coca"],
        highlightsEn: ["Ñaupa Waka", "Coca leaf offering"],
        meals: "Snack",
        mealsEn: "Snack",
        accommodation: "",
        accommodationEn: ""
      }
    ]
  },

  {
    id: "pumamarca",
    categories: ["rutas"],
    name: "Pumamarca",
    nameEn: "Pumamarca",
    heroImage: "/agencies/jaguarllaqta/pumamarca/pumamarca-hero.jpg",
    tagline: "Explora un sitio preinca con vistas impresionantes",
    taglineEn: "Explore a pre-Inca site with stunning views",
    duration: "Día completo",
    durationEn: "Full day",
    difficulty: "Moderado",
    difficultyEn: "Moderate",
    elevation: "3600m max.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 100,
    description: "Esta hermosa caminata de día completo se realiza en los alrededores del histórico pueblo de Ollantaytambo. El recorrido atraviesa un valle con gran diversidad de plantas nativas, riachuelos y antiguos sistemas de terrazas agrícolas. La caminata inicia en Munaypata, una pequeña comunidad andina ubicada a unos 10 minutos de Ollantaytambo. Tras un ascenso gradual de aproximadamente tres horas, se llega al sitio arqueológico preinca de Pumamarca, donde es posible apreciar la magnitud de su construcción, su ubicación estratégica y su notable ingeniería, todo ello acompañado de vistas impresionantes de los valles y montañas circundantes.",
    descriptionEn: "This beautiful full-day hike takes place on the outskirts of the historic town of Ollantaytambo. The route crosses a scenic valley rich in native plants, streams, and ancient agricultural terrace systems. The hike begins in Munaypata, a small Andean community located approximately 10 minutes from Ollantaytambo. After a gradual ascent of about three hours, we reach the pre-Inca archaeological site of Pumamarca, where visitors can appreciate its impressive architecture, strategic location, and advanced engineering, all surrounded by spectacular views of the surrounding valleys and mountains.",
    highlights: ["Comunidad de Munaypata", "Sitio arqueológico de Pumamarca", "Terrazas Incas y Pre-Incas", "Vistas del Valle Sagrado"],
    highlightsEn: ["Munaypata community", "Pumamarca archaeological site", "Inca and Pre-Inca terraces", "Sacred Valley views"],
    includes: [
      "Guía profesional",
      "Refrigerio",
      "Boleto de ingreso al sitio arqueológico"
    ],
    includesEn: [
      "Professional guide",
      "Box Lunch",
      "Entrance ticket to the archaeological site"
    ],
    notIncludes: [
      "Transporte privado ida y vuelta desde el Valle Sagrado",
      "Snacks personales",
      "Equipo personal de montaña"
    ],
    notIncludesEn: [
      "Private round-trip transportation from the Sacred Valley",
      "Personal snacks",
      "Personal mountain equipment"
    ],
    requirements: [
      "Sombrero o gorra",
      "Bloqueador solar",
      "Botella de agua",
      "Dinero en efectivo",
      "DNI o Pasaporte",
      "Cámara fotográfica",
      "Ropa para Lluvia",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Sun hat or cap",
      "Sunscreen",
      "Water bottle",
      "Cash for souvenirs",
      "ID / Passport",
      "Camera",
      "Rain gear",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Munaypata – Pumamarca",
        titleEn: "Sacred Valley – Munaypata – Pumamarca",
        description: "07:00 AM – Recojo desde su hotel en el Valle Sagrado y traslado al punto de inicio en Munaypata, Ollantaytambo. 08:30 AM – Inicio de la caminata. Durante el ascenso se observan antiguas terrazas incas y paisajes impresionantes. 11:30 AM – Llegada al sitio arqueológico de Pumamarca. Tiempo para descansar, recorrer el complejo preinca, disfrutar de las vistas panorámicas y refrigerio. 01:30 PM – Inicio de la caminata de retorno hacia Ollantaytambo (aprox. 3 horas). 04:00 PM – Llegada a Ollantaytambo and traslado de retorno a su hotel.",
        descriptionEn: "07:00 AM – Pick-up from your hotel in the Sacred Valley and transfer to the starting point in Munaypata, Ollantaytambo. 08:30 AM – Start of the hike. During the ascent, we observe ancient Inca terraces and enjoy stunning landscapes. 11:30 AM – Arrival at the archaeological site of Pumamarca. Time to rest, explore the pre-Inca ruins, enjoy panoramic views, and have a box lunch. 01:30 PM – Start of the return hike to Ollantaytambo (approx. 3 hours). 04:00 PM – Arrival in Ollantaytambo and transfer back to your hotel.",
        highlights: ["Sitio Pumamarca", "Vistas panorámicas"],
        highlightsEn: ["Pumamarca site", "Panoramic views"],
        meals: "Refrigerio",
        mealsEn: "Lunch",
        accommodation: "",
        accommodationEn: ""
      }
    ]
  },

  {
    id: "pumawanka",
    categories: ["rutas"],
    name: "Pumawanka",
    nameEn: "Pumawanka",
    heroImage: "/agencies/jaguarllaqta/pumawanka/pumawanka-hero.jpg",
    tagline: "Camino Inca  entre los Andes y la selva",
    taglineEn: "Ancient Inca trail connecting the Andes to the jungle",
    duration: "Día completo",
    durationEn: "Full day",
    difficulty: "Moderado a Fácil",
    difficultyEn: "Moderate to Easy",
    elevation: "3150.m - 3700m max.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 100,
    description: "Esta hermosa caminata de día completo se realiza en el valle de Pumawanka, ubicado en la cordillera del Urubamba. Es una experiencia ideal para quienes buscan una conexión profunda con la naturaleza. La ruta sigue un antiguo camino inca a través de ecosistemas altoandinos, bosques, plantas nativas y ríos. Durante el recorrido se visita un sitio arqueológico enigmático antes de llegar a la comunidad altoandina de Sutoc Paccha. Históricamente, este camino fue una de las rutas más importantes del Imperio Inca, conectando los Andes con la selva.",
    descriptionEn: "This beautiful full-day trek takes place in the Pumawanka Valley, located within the Urubamba mountain range. It is an ideal experience for travelers seeking a deep connection with nature. The hike follows an ancient Inca trail through high-Andean ecosystems, forests, native plants, and rivers. Along the way, we visit an enigmatic archaeological site before reaching the high-Andean community of Sutoc Paccha. Historically, this route was one of the most important Inca paths connecting the Andes with the jungle regions.",
    highlights: ["Camino inca ancestral", "Sitio arqueológico Inca Raqay", "Comunidad Sutoc Paccha", "Cascadas"],
    highlightsEn: ["Ancient Inca trail", "Inca Raqay archaeological site", "Sutoc Paccha community", "Waterfalls"],
    includes: [
      "Guía profesional",
      "Almuerzo tipo box lunch"
    ],
    includesEn: [
      "Professional guide",
      "Box lunch"
    ],
    notIncludes: [
      "Snacks personales",
      "Equipo personal de montaña",
      "Transporte desde su ubicación hasta Chupani (punto de inicio)"
    ],
    notIncludesEn: [
      "Transportation from your location to Chupani (starting point)",
      "Personal snacks",
      "Personal mountain equipment"
    ],
    requirements: [
      "Sombrero o gorra",
      "Bloqueador solar",
      "Botella de agua",
      "Dinero en efectivo",
      "DNI o Pasaporte",
      "Cámara fotográfica",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Sun hat or cap",
      "Sunscreen",
      "Water bottle",
      "Cash for souvenirs",
      "ID / Passport",
      "Camera",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Chupani – Inca Raqay – Sutoc Paccha – Cascadas – Chupani",
        titleEn: "Chupani – Inca Raqay – Sutoc Paccha – Waterfalls – Chupani",
        description: "08:00 AM – Recojo desde su alojamiento en el Valle Sagrado y traslado a Chupani. 09:00 AM – Inicio de la caminata, ascendiendo por el valle (aprox. 2 horas). 11:00 AM – Llegada al sitio arqueológico Inca Raqay y posterior caminata hacia la comunidad alto andina Sutoc Paccha. Ofrenda tradicional con hojas de coca. 01:00 PM – Continuamos una hora más hasta las cascadas. Refrigerio y tiempo de descanso con vistas espectaculares. 02:30 PM – Inicio del descenso de retorno. 04:00 PM – Llegada a Chupani y traslado de retorno a su hotel.",
        descriptionEn: "08:00 AM – Pick-up from your accommodation in the Sacred Valley and transfer to Chupani. 09:00 AM – Start of the hike, ascending through the valley (approximately 2 hours). 11:00 AM – Arrival at Inca Raqay archaeological site, followed by a walk to Sutoc Paccha community. Traditional offering with coca leaves. 01:00 PM – Continue one more hour to the waterfalls. Lunch and rest with spectacular views. 02:30 PM – Begin the descent. 04:00 PM – Arrival in Chupani. Transfer back to your hotel.",
        highlights: ["Inca Raqay", "Sutoc Paccha", "Cascadas"],
        highlightsEn: ["Inca Raqay", "Sutoc Paccha", "Waterfalls"],
        meals: "Refrigerio",
        mealsEn: "Box Lunch",
        accommodation: "",
        accommodationEn: ""
      }
    ]
  },

  {
    id: "ausangate-trek-3d2n",
    categories: ["comunidad", "rutas"],
    name: "Ausangate",
    nameEn: "Ausangate",
    heroImage: "/agencies/jaguarllaqta/ausangate-trek-3d2n/ausangate-trek-3d2n-hero.jpg",
    tagline: "Descubre al Apu más importante de la region andina, sus hermosas lagunas y paisajes alto andinos.",
    taglineEn: "Discover the most important Apu of Andean region, its beautiful lagoons and high Andean landscapes.",
    duration: "3 días / 2 noches",
    durationEn: "3 days / 2 nights",
    difficulty: "Moderado a Desafiante",
    difficultyEn: "Moderate to Challenging",
    elevation: "4,800m máx.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 450,
    description: "El Ausangate es la montaña más alta de la región Cusco y la quinta más alta del Perú, con una altitud de 6,385 metros sobre el nivel del mar. Se encuentra aproximadamente a 84 kilómetros al sureste de la ciudad del Cusco. Esta montaña sagrada es una de las más importantes dentro de la cosmovisión andina. El Apu Ausangate es considerado el padre de todas las montañas circundantes y un poderoso espíritu protector de la región. La zona también es reconocida por sus tradicionales textiles andinos, un conocimiento ancestral que se mantiene vivo y se transmite de generación en generación.",
    descriptionEn: "Ausangate is the highest mountain in the Cusco region and the fifth highest in Peru, reaching 6,385 meters above sea level. It is located approximately 84 kilometers southeast of Cusco. This sacred mountain is one of the most important in Andean culture. Apu Ausangate is considered the father of all surrounding mountains and a powerful protector spirit of the region. The area is also renowned for its traditional Andean textiles—ancestral knowledge that remains alive and is passed down through local families.",
    note: "APU: Palabra quechua que significa Dios o Espíritu Sagrado de la Montaña.",
    noteEn: "APU: Quechua word meaning God or Sacred Mountain Spirit.",
    highlights: ["Siete Lagunas del Ausangate", "Aguas termales de Pacchanta", "Comunidad local", "Nevado Ausangate"],
    highlightsEn: ["Seven Lakes of Ausangate", "Pacchanta hot springs", "Local community", "Ausangate snow peak"],
    includes: [
      "Transporte privado (ida y vuelta)",
      "Guía profesional",
      "Alimentación completa por 3 días / 2 noches",
      "Una noche de alojamiento en casa de familia local",
      "Boleto de ingreso al Área de Conservación Ausangate",
      "Equipo de montaña para una noche (carpa y bolsa de dormir)"
    ],
    includesEn: [
      "Private transportation (round trip)",
      "Professional guide",
      "All meals for 3 days / 2 nights (lunch, dinner, breakfast, lunch)",
      "One night accommodation with a local family",
      "Entrance ticket to the Ausangate Conservation Area",
      "Mountain equipment for one night (tent and sleeping bag)"
    ],
    notIncludes: [
      "Snacks personales",
      "Equipo personal de montaña"
    ],
    notIncludesEn: [
      "Personal snacks",
      "Personal mountain equipment"
    ],
    requirements: [
      "Sombrero para el sol",
      "Bloqueador solar",
      "Botella de agua",
      "Dinero en efectivo para souvenirs",
      "DNI o Pasaporte",
      "Cámara fotográfica",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Sun hat",
      "Sunscreen",
      "Water bottle",
      "Cash for souvenirs",
      "ID / Passport",
      "Camera",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Pacchanta",
        titleEn: "Sacred Valley – Pacchanta",
        description: "12:00 PM – Recojo desde el Valle Sagrado y traslado al pueblo de Pacchanta (4,200 m s. n. m.). Tiempo aproximado de viaje: 4 horas en vehículo privado. 4:00 PM – Llegada a Pacchanta. Alojamiento en casa de una familia local, con alimentación incluida. La tarde está dedicada a la aclimatación, con una caminata suave por la zona y tiempo para relajarse en las aguas termales naturales. Cena y pernocte.",
        descriptionEn: "12:00 PM – Pick-up from the Sacred Valley and transfer to the village of Pacchanta (4,200 m a.s.l.). Approximate travel time: 4 hours by private vehicle. 4:00 PM – Arrival in Pacchanta. Overnight stay with a local family, including meals and basic accommodation. The afternoon is dedicated to acclimatization, including a gentle walk and time to relax in the natural hot springs. Dinner and overnight stay.",
        highlights: ["Pacchanta", "Aguas termales","Nevado Ausangate"],
        highlightsEn: ["Pacchanta", "hot springs","Ausangate Glaciar"],
        meals: "Almuerzo, Cena",
        mealsEn: "Lunch, Dinner",
        accommodation: "Casa de familia local",
        accommodationEn: "Local family home"
      },
      {
        day: 2,
        title: "Siete Lagunas del Ausangate",
        titleEn: "Seven Lakes of Ausangate",
        description: "7:00 AM – Caminata de día completo para visitar las Siete Lagunas del Ausangate y sus hermosos paisajes. Ofrenda Andina con hojas de coca. Picnic y por la tarde retorno a Pacchanta para disfrutar de las aguas termales. Cena y descanso.",
        descriptionEn: "7:00 AM – Full-day hike to visit the Seven Lakes of Ausangate and its beautiful landscapes. Andean Offering with coca leaves. Luch Box and in the afternoon return to Pacchanta to enjoy the hot springs. Dinner and rest.",
        highlights: ["Siete Lagunas", "Vista del Apu Ausangate"],
        highlightsEn: ["Seven Lakes", "Apu Ausangate View"],
        meals: "Desayuno, Almuerzo, Cena",
        mealsEn: "Breakfast, Lunch, Dinner",
        accommodation: "Casa de familia ",
        accommodationEn: "Local family home"
      },
      {
        day: 3,
        title: "Pacchanta – Cusco",
        titleEn: "Pacchanta – Cusco",
        description: "7:00 AM – Retorno en vehículo privado al Valle Sagrado de los Incas. Tiempo aproximado de viaje: 4 horas.",
        descriptionEn: "7:00 AM – Departure by private vehicle back to the Sacred Valley of the Incas. Approximate travel time: 4 hours.",
        highlights: ["Retorno"],
        highlightsEn: ["Return"],
        meals: "Desayuno",
        mealsEn: "Breakfast",
        accommodation: "Fin del tour",
        accommodationEn: "End of tour"
      }
    ]
  },

  {
    id: "lares-trek-3d2n",
    categories: ["rutas", "comunidad"],
    name: "Lares",
    nameEn: "Lares",
    heroImage: "/agencies/jaguarllaqta/lares-trek-3d2n/lares-trek-3d2n-hero.jpg",
    tagline: "Explora la cordillera de Urubamba en contacto con comunidades nativas y la cultura viva de los andes del Perú.",
    taglineEn: "Explore the Urubamba mountain range in contact with native communities and the living culture of the Peruvian Andes.",
    duration: "3 días / 2 noches",
    durationEn: "3 days / 2 nights",
    difficulty: "Moderado a Desafiante",
    difficultyEn: "Moderate to Challenging",
    elevation: "4,800m máx.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 450,
    description: "El Lares Trek es una de las rutas de montaña más atractivas de la región Cusco. Atraviesa la cordillera del Urubamba, considerada tropical por su cercanía a la selva amazónica. Durante la caminata se recorren diversos ecosistemas andinos como ríos, bosques altoandinos, lagunas, cascadas y montañas nevadas, además de visitar comunidades tradicionales donde se mantienen vivas prácticas ancestrales. El recorrido finaliza en el pueblo de Lares, conocido por sus aguas termales y medicinales.",
    descriptionEn: "The Lares Trek is one of the most scenic mountain routes in the Cusco region. It crosses the Urubamba mountain range, a tropical range in the Peruvian Andes due to its proximity to the rainforest. Along the trek, travelers experience diverse Andean ecosystems including rivers, high-Andean forests, lagoons, waterfalls, snow-capped peaks, and traditional communities. The route also offers opportunities to observe local wildlife such as condors, deer, eagles, viscachas, and hummingbirds. The journey concludes in the town of Lares, famous for its thermal and medicinal hot springs.",
    highlights: ["Apu Sawasiray","Apu Sirihuani", "Comunidades Alto Andinas", "Bosques Alto Andinos", "Aguas termales de Lares", "Paso de montaña 4,800m"],
    highlightsEn: ["Yanaqocha Lagoon", "Traditional communities", "High-Andean forests", "Lares hot springs", "Mountain pass 4,800m"],
    includes: [
      "Transporte ida y vuelta",
      "Alimentación completa (3 días / 2 noches)",
      "Alojamiento y campamento",
      "Equipo de montaña (carpas, colchonetas y bolsas de dormir)",
      "Guiado y acompañamiento profesional",
      "Ingreso a las aguas termales de Lares"
    ],
    includesEn: [
      "Round-trip transportation",
      "Full board (3 days / 2 nights)",
      "Camping and lodging",
      "Mountaineering equipment (tents, sleeping mats, sleeping bags)",
      "Professional guiding and support",
      "Entrance to the Lares hot springs"
    ],
    notIncludes: [
      "Equipo personal de montaña",
      "Snacks personales"
    ],
    notIncludesEn: [
      "Personal mountaineering equipment",
      "Personal snacks"
    ],
    requirements: [
      "Ropa abrigadora e impermeable",
      "Botella personal de agua",
      "Documentos personales",
      "Dinero en efectivo",
      "Artículos de aseo",
      "Ropa de baño y toalla",
      "Sombrero o gorra",
      "Bloqueador solar",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Warm and rain clothing",
      "Personal water bottle",
      "Personal documents",
      "Cash for souvenirs",
      "Toiletries kit",
      "Swimsuit and towel",
      "Sun hat or cap",
      "Sunscreen",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Huaran – Saywapata – Cancha Cancha",
        titleEn: "Huaran – Saywapata – Cancha Cancha",
        description: "07:30 AM – Recojo en transporte privado hacia Huaran y luego a Saywapata (3,200 m s. n. m.). 08:30 AM – Inicio de la caminata. Ascenso de aproximadamente 3 horas. 11:30 AM – Llegada a la comunidad de Cancha Cancha. Descanso, mate de coca y snacks locales. 12:30 PM – Continuación del ascenso y campamento cerca de la laguna Yanaqocha. 06:00 PM – Cena y pernocte.",
        descriptionEn: "07:30 AM – Pick-up by private transport to Huaran, continuing to Saywapata (3,200 m a.s.l.). 08:30 AM – Start of the hike. Approx. 3-hour ascent through ravines, rivers, and high-Andean forests. 11:30 AM – Arrival at the community of Cancha Cancha. Rest, coca tea, and local snacks with a host family. 12:30 PM – Continued ascent to higher elevations and camp setup near Yanaqocha Lagoon. 06:00 PM – Dinner and overnight camping.",
        highlights: ["Cancha Cancha", "Laguna Yanaqocha"],
        highlightsEn: ["Cancha Cancha", "Yanaqocha Lagoon"],
        meals: "Almuerzo, Cena",
        mealsEn: "Lunch, Dinner",
        accommodation: "Campamento o Casa Comunal",
        accommodationEn: "Camping or mountain refugee"
      },
      {
        day: 2,
        title: "Yanaqocha – Abra Pachacutec – Quishuarani",
        titleEn: "Yanaqocha – Mountain Pass – Quishuarani",
        description: "07:00 AM – Desayuno y desmontaje del campamento. 08:00 AM – Caminata hacia el abra Pachacutec. 01:00 PM – Llegada a la comunidad de Quishuarani. 02:30 PM – Almuerzo en casa local y armado de campamento. 04:00 PM – Caminata opcional por la comunidad. 07:00 PM – Cena.",
        descriptionEn: "07:00 AM – Breakfast and camp packing. 08:00 AM – Trek to the mountain pass (4,800 m a.s.l.), enjoying panoramic views. Approx. 4–5 hours of hiking. 01:00 PM – Arrival at the community of Quishuarani. 02:30 PM – Lunch with a local family and camp setup. 04:00 PM – Optional community walk. 07:00 PM – Dinner.",
        highlights: ["Paso de montaña 4,800m", "Comunidad Quishuarani"],
        highlightsEn: ["Mountain pass 4,800m", "Quishuarani Community"],
        meals: "Desayuno, Almuerzo, Cena",
        mealsEn: "Breakfast, Lunch, Dinner",
        accommodation: "Campamento o Casa Comunal",
        accommodationEn: "Camping or mountain refugee"
      },
      {
        day: 3,
        title: "Quishuarani – Cuncani – Lares",
        titleEn: "Quishuarani – Cuncani – Lares",
        description: "06:00 AM – Desayuno. 07:30 AM – Caminata de 4 horas hacia la comunidad de Cuncani. 11:00 AM – Refrigerio. 12:00 PM – Traslado en transporte privado a las aguas termales de Lares (45 minutos). Tiempo libre para relajarse (2 horas). 03:00 PM – Transporte hacia el Valle Sagrado (aprox. 2.5 horas). 05:30 PM – Llegada a Calca.",
        descriptionEn: "06:00 AM – Breakfast. 07:30 AM – 4-hour hike to the community of Cuncani. 11:00 AM – Box Lunch. 12:00 PM – Transfer to the Lares Hot Springs (45 minutes). Relaxation time: 2 hours. 03:00 PM – Business to the Sacred Valley (approx. 2.5 hours). 05:30 PM – Arrival to Calca.",
        highlights: ["Aguas termales de Lares"],
        highlightsEn: ["Lares Hot Springs"],
        meals: "Desayuno, Almuerzo",
        mealsEn: "Breakfast, Lunch",
        accommodation: "Fin del tour",
        accommodationEn: "End of tour"
      }
    ]
  },
  {
    id: "manu-rainforest-5d4n",
    categories: ["rutas"],
    name: "Selva del Manu",
    nameEn: "Manu Rainforest",
    heroImage: "/agencies/jaguarllaqta/manu-rainforest-5d4n/manu-rainforest-5d4n-hero.jpg",
    tagline: "Aventura en una de las zonas con mayor biodiversidad del planeta",
    taglineEn: "Adventure in one of the most biodiverse areas on Earth",
    duration: "5 días / 4 noches",
    durationEn: "5 days / 4 nights",
    difficulty: "Moderado",
    difficultyEn: "Moderate",
    elevation: "300m – 4,000m",
    bestSeason: "",
    bestSeasonEn: "",
    price: 600,
    description: "La selva del Manu es un área natural protegida ubicada en el sureste del Perú, entre las regiones de Cusco y Madre de Dios. Con una extensión de más de 1.9 millones de hectáreas, abarca desde los 300 m s. n. m. en la Amazonía hasta más de 4,000 m s. n. m. en los Andes. Este territorio alberga una de las mayores biodiversidades del planeta y conserva zonas prácticamente vírgenes. La tradición oral menciona que en sus profundidades podría encontrarse el mítico Paititi, la ciudad perdida de los Incas.",
    descriptionEn: "The manu jungle is a protected natural area located in southeastern Peru, between the regions of Cusco and Madre de Dios. Covering more than 1.9 million hectares, it extends from 300 m a.s.l. in the Amazon rainforest to over 4,000 m a.s.l. in the Andes. This territory shelters one of the highest levels of biodiversity on Earth and preserves vast pristine areas. According to oral tradition, the legendary lost Inca city of Paititi may lie hidden deep within this jungle.",
    highlights: ["Selva del Manu", "Bosque Nublado", "Comunidad nativa Harakbut", "Aguas termales de Shintuya", "Pantiaqoya","Cataratas y piscinas naturales"],
    highlightsEn: ["Manu Jungle", "Cloud forest", "Harakbut native community", "Shintuya hot springs", "Pantiaqoya","Waterfalls and natural pools"],
    includes: [
      "Guiado y acompañamiento profesional",
      "Alojamiento y alimentación completa por 5 días / 4 noches",
      "Transporte vehicular y fluvial",
      "Logística general del viaje"
    ],
    includesEn: [
      "Professional guiding and assistance",
      "Accommodation and full meals for 5 days / 4 nights",
      "Land and river transportation",
      "Trip logistics"
    ],
    notIncludes: [
      "Equipo personal",
      "Snacks personales"
    ],
    notIncludesEn: [
      "Personal equipment",
      "Personal snacks"
    ],
    requirements: [
      "Ropa para lluvia y calor",
      "Repelente de insectos",
      "Botella reutilizable de agua",
      "Cámara fotográfica",
      "Documentos personales",
      "Dinero en efectivo",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Clothing for rain and heat",
      "Insect repellent",
      "Refillable water bottle",
      "Camera",
      "Personal documents",
      "Cash",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Salvación – Reserva Qocha Wasi",
        titleEn: "Sacred Valley – Salvación – Qocha Wasi Reserve",
        description: "Salida desde el valle sagrado en transporte privado hacia el poblado de Salvación (aprox. 7 horas). Parada técnica en Paucartambo. En el camino se atraviesan paisajes altoandinos y bosques nublados al ingreso a la selva alta. Llegada a Salvación por la tarde. Alojamiento en cabañas ubicadas en una colina con vistas panorámicas. Visita a la reserva natural Qocha Wasi, paseo en balsa y caminata por senderos de selva. Cena y descanso.",
        descriptionEn: "Departure from the sacred valley to the town of Salvación by private transport (approx. 7 hours). Technical stop in Paucartambo. Along the way, travelers enjoy high-Andean landscapes and cloud forests entering the high jungle. Arrival in Salvación in the afternoon. Overnight stay in hillside cabins with panoramic views. Visit to Qocha Wasi Nature Reserve, including a rafting activity and jungle walk. Dinner and rest.",
        highlights: ["Paucartambo", "Bosque nublado", "Reserva Qocha Wasi"],
        highlightsEn: ["Paucartambo", "Cloud forest", "Qocha Wasi Reserve"],
        meals: "Cena",
        mealsEn: "Dinner",
        accommodation: "Cabañas en Salvación",
        accommodationEn: "Cabins in Salvación"
      },
      {
        day: 2,
        title: "Shintuya – Excursión con comunidad Harakbut",
        titleEn: "Shintuya – Harakbut Community Excursion",
        description: "Traslado al poblado de Shintuya. Excursión en la selva de un día y una noche junto a una familia de la comunidad nativa Harakbut. Caminata de aproximadamente 4 horas hacia el interior de la selva, conociendo ríos, cascadas, plantas medicinales y fauna local. Noche en campamento rústico.",
        descriptionEn: "Transfer to Shintuya village. One-day and one-night excursion into the rainforest with a local Harakbut family. Approximately 4-hour hike into the jungle, learning about rivers, waterfalls, medicinal plants and wildlife. Overnight in a rustic jungle camp.",
        highlights: ["Comunidad Harakbut", "Selva virgen", "Plantas medicinales", "Pantiaqoya"],
        highlightsEn: ["Harakbut community", "Virgin rainforest", "Medicinal plants", "Pantiaqoya"],
        meals: "Desayuno, Almuerzo, Cena",
        mealsEn: "Breakfast, Lunch, Dinner",
        accommodation: "Campamento rústico en la selva",
        accommodationEn: "Rustic jungle camp"
      },
      {
        day: 3,
        title: "Retorno a Shintuya – Apu Pantiaqoya",
        titleEn: "Return to Shintuya – Apu Pantiaqoya",
        description: "Desayuno y caminata de retorno (aprox. 3 horas) hasta Shintuya. Traslado en bote hacia las aguas termales de Shintuya. Descanso en un complejo local y disfrute de aguas termomedicinales. Cena y pernocte.",
        descriptionEn: "Breakfast and return hike (approx. 3 hours) to Shintuya. A short boat ride to the hot springs of Shintuya. Time to relax in local thermomedicinal hot springs. Dinner and overnight stay.",
        highlights: ["Aguas termomedicinales", "Viaje en bote"],
        highlightsEn: ["Thermomedicinal hot springs", "Boat ride"],
        meals: "Desayuno, Almuerzo, Cena",
        mealsEn: "Breakfast, Lunch, Dinner",
        accommodation: "Hospedaje rustico",
        accommodationEn: "Rustic Accommodation"
      },
      {
        day: 4,
        title: "Cataratas y piscinas naturales – Salvación",
        titleEn: "Waterfalls and Natural Pools – Salvación",
        description: "Caminata de 45 minutos hacia cataratas y piscinas naturales. Tiempo para nadar y disfrutar de la naturaleza. Almuerzo y retorno en bote a Shintuya. Traslado por la tarde al poblado de Salvación para pasar la última noche.",
        descriptionEn: "45-minute hike to waterfalls and natural pools. Time to swim and enjoy the nature. Lunch and boat return to Shintuya. Afternoon transfer to Salvación for the final overnight stay.",
        highlights: ["Cataratas", "Piscinas naturales", "Río Madre de Dios"],
        highlightsEn: ["Waterfalls", "Natural pools", "Madre de Dios River"],
        meals: "Desayuno, Almuerzo, Cena",
        mealsEn: "Breakfast, Lunch, Dinner",
        accommodation: "Cabañas en Salvación",
        accommodationEn: "Cabins in Salvación"
      },
      {
        day: 5,
        title: "Salvación – Valle Sagrado",
        titleEn: "Salvación – Sacred Valle",
        description: "Retorno desde Salvación hasta el Valle Sagrado durante todo el día. Llegada por la tarde.",
        descriptionEn: "Full-day return journey from Salvación to Sacred Valley. Arrival in Cusco in the afternoon.",
        highlights: ["Paisajes andinos", "Bosque nublado"],
        highlightsEn: ["Andean landscapes", "Cloud forest"],
        meals: "Desayuno",
        mealsEn: "Breakfast",
        accommodation: "Fin del tour",
        accommodationEn: "End of tour"
      }
    ]
  },

  {
    id: "choquequirao-trek",
    categories: ["rutas"],
    name: "Choquequirao",
    nameEn: "Choquequirao",
    heroImage: "/agencies/jaguarllaqta/choquequirao-trek/choquequirao-trek-hero.jpg",
    tagline: "Descubre la mitica ciudad perdida de los Incas y su misterio ancestral.",
    taglineEn: "Discover the mythical lost city of the Incas and its ancestral mystery.",
    duration: "4 días / 3 noches",
    durationEn: "4 days / 3 nights",
    difficulty: "Desafiante a Alta Exigencia",
    difficultyEn: "Challenging to High Demand",
    elevation: "3,900 m máx.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 600,
    description: "Este trekking de 4 días conduce a uno de los complejos arqueológicos más impresionantes y menos visitados del Perú: Choquequirao. La ruta atraviesa profundos cañones, paisajes andinos y ecosistemas diversos, ofreciendo una experiencia auténtica de conexión con la naturaleza y la historia. Conocido como la hermana sagrada de Machu Picchu, Choquequirao destaca por su magnitud, misterio y ubicación estratégica. Es una experiencia ideal para viajeros que buscan aventura, reto físico y conexión cultural.",
    descriptionEn: "This 4-day trek leads to one of the most impressive and least visited archaeological sites in Peru: Choquequirao. The route crosses deep canyons, Andean landscapes, and diverse ecosystems. Known as the sacred sister of Machu Picchu, Choquequirao stands out for its scale, mystery, and strategic location. It is ideal for travelers seeking adventure, physical challenge, and cultural connection.",
    highlights: ["Complejo arqueológico de Choquequirao", "Cañón del Apurímac" ],
    highlightsEn: ["Choquequirao archaeological complex", "Apurimac Canyon" ],
    includes: [
      "Transporte privado ida y vuelta",
      "Alimentación y Hospedaje",
      "Guía profesional",
      "Ingreso a Choquequirao"
    ],
    includesEn: [
      "Private transportation",
      "Full meals",
      "Professional guide",
      "Entrance ticket"
    ],
    notIncludes: [
      "Snacks personales",
      "Equipo personal de trekking"
    ],
    notIncludesEn: [
      "Personal snacks",
      "Personal trekking equipment"
    ],
    requirements: [
      "Botas de trekking",
      "Bloqueador solar",
      "Botella de agua",
      "Casaca de lluvia",
      "Ropa de cambio",
      "Cámara fotográfica",
      "Bastones de trekking"
    ],
    requirementsEn: [
      "Trekking boots",
      "Sunscreen",
      "Water bottle",
      "Rain jacket",
      "Change of clothes",
      "Camera",
      "Trekking poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Cusco – Capuliyoc – Chiquisqa",
        titleEn: "Cusco – Capuliyoc – Chiquisqa",
        description: "11:30 AM - Traslado desde Cusco hacia Capuliyoc y caminata en descenso durante aproximadamente 3 horas hasta Chiquisqa.",
        descriptionEn: "Transfer and descent hike to Chiquisqa.",
        highlights: ["Capuliyoc"],
        highlightsEn: ["Capuliyoc"],
        meals: "Almuerzo, Cena",
        mealsEn: "Lunch, Dinner",
        accommodation: "Refugio en Chiquisqa",
        accommodationEn: "Refugee in Chiquisqa"
      },
      {
        day: 2,
        title: "Chiquisqa – Playa Rosalinas – Marampata",
        titleEn: "Chiquisqa – Playa Rosalinas – Marampata",
        description: "Descenso hacia el río Apurímac y posterior ascenso exigente hasta Marampata.",
        descriptionEn: "Descent to Apurimac River and ascent to Marampata.",
        highlights: ["Río Apurímac", "Marampata"],
        highlightsEn: ["Apurimac River", "Marampata"],
        meals: "Desayuno, Almuerzo, Cena",
        mealsEn: "Breakfast, Lunch, Dinner",
        accommodation: "Refugio en Marampata",
        accommodationEn: "Refugee in Marampata"
      },
      {
        day: 3,
        title: "Marampata – Choquequirao – Marampata",
        titleEn: "Marampata – Choquequirao – Marampata",
        description: "Caminata hacia el complejo arqueológico de Choquequirao y exploración completa del lugar.",
        descriptionEn: "Visit and exploration of the archaeological site.",
        highlights: ["Choquequirao"],
        highlightsEn: ["Choquequirao"],
        meals: "Desayuno, Almuerzo, Cena",
        mealsEn: "Breakfast, Lunch, Dinner",
        accommodation: "Refugio en Marampata",
        accommodationEn: "Refugee in Marampata"
      },
      {
        day: 4,
        title: "Marampata – Capuliyoc – Cusco",
        titleEn: "Marampata – Capuliyoc – Cusco",
        description: "Retorno por la misma ruta y traslado hacia Cusco o Valle Sagrado.",
        descriptionEn: "Return hike and transfer back.",
        highlights: ["Capuliyoc"],
        highlightsEn: ["Capuliyoc"],
        meals: "Desayuno, Almuerzo",
        mealsEn: "Breakfast, Lunch",
        accommodation: "Fin del tour",
        accommodationEn: "End of tour"
      }
    ]
  },
  {
    id: "quishuarani-2d1n",
    categories: ["comunidad", "rutas"],
    name: "Quishuarani",
    nameEn: "Quishuarani",
    heroImage: "/agencies/jaguarllaqta/quishuarani-2d1n/quishuarani-2d1n-hero.jpg",
    tagline: "Se parte de una experiencia autentica con familias de comunidades alto andinas.",
    taglineEn: "Be part of an authentic experience with families from high Andean communities.",
    duration: "2 días / 1 noche",
    durationEn: "2 days / 1 night",
    difficulty: "Moderado",
    difficultyEn: "Moderate",
    elevation: "3900m - 4,400 m máx.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 350,
    description: "Quishuarani es una comunidad alto andina ubicada en la cordillera de Urubamba, en la región de Lares. Esta experiencia permite un contacto directo con familias locales, sus costumbres, tradiciones y su forma de vida. Durante dos días y una noche, los viajeros conviven con una familia local, participando en actividades como la textilería tradicional, la ganadería y la vida comunitaria. Además, el recorrido incluye caminatas hacia lagunas y cataratas, así como la realización de una ofrenda andina con hojas de coca.",
    descriptionEn: "Quishuarani is a high Andean community located in the Urubamba mountain range, in the Lares region. This experience offers direct contact with local families, their traditions, and way of life. For two days and one night, travelers live with a local family, participating in activities such as traditional textile making, livestock care, and daily community life. The experience also includes hikes to lagoons and waterfalls, as well as a traditional Andean offering using coca leaves.",
    highlights: ["Convivencia familiar", "Textilería tradicional", "Laguna Qoyalay", "Cataratas de Quishuarani"],
    highlightsEn: ["Family coexistence", "Traditional textiles", "Qoyalay lagoon", "Quishuarani waterfalls"],
    includes: [
      "Transporte ida y vuelta",
      "Alimentación completa",
      "Alojamiento y campamento",
      "Guía profesional"
    ],
    includesEn: [
      "Round-trip transportation",
      "Full meals",
      "Accommodation and camping",
      "Professional guide"
    ],
    notIncludes: [
      "Equipo personal",
      "Snacks personales",
      "Equipo de montaña",
    ],
    notIncludesEn: [
      "Personal equipment",
      "Personal snacks",
      "Mountain equipment",
    ],
    requirements: [
      "Ropa abrigadora e impermeable",
      "Botella de agua",
      "Documentos personales",
      "Dinero en efectivo",
      "Artículos de aseo",
      "Sombrero o gorra",
      "Bloqueador solar",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Warm and waterproof clothing",
      "Water bottle",
      "Personal documents",
      "Cash",
      "Toiletries",
      "Hat or cap",
      "Sunscreen",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Quishuarani",
        titleEn: "Sacred Valley – Quishuarani",
        description: "08:00 AM – Recojo en transporte privado desde el Valle Sagrado hacia la comunidad de Quishuarani. 11:00 AM – Llegada. 11:30 AM – Recepción por una familia local. 12:00 PM – Demostración de textilería tradicional. 01:00 PM – Almuerzo. 02:30 PM – Caminata hacia las cataratas de Quishuarani y la laguna Qoyalay con ofrenda simbólica. 06:00 PM – Retorno, cena y convivencia.",
        descriptionEn: "08:00 AM – Pick-up from the Sacred Valley and transfer to Quishuarani. 11:00 AM – Arrival. 11:30 AM – Welcome by a local family. 12:00 PM – Traditional textile demonstration. 01:00 PM – Lunch. 02:30 PM – Hike to waterfalls and Qoyalay lagoon with coca leaf offering. 06:00 PM – Return, dinner and time with family.",
        highlights: ["Textilería", "Laguna Qoyalay"],
        highlightsEn: ["Textiles", "Qoyalay Lagoon"],
        meals: "Almuerzo, Cena",
        mealsEn: "Lunch, Dinner",
        accommodation: "Casa de familia local",
        accommodationEn: "Local family home"
      },
      {
        day: 2,
        title: "Quishuarani – Calca – Valle Sagrado",
        titleEn: "Quishuarani – Calca – Sacred Valley",
        description: "06:00 AM – Desayuno. 07:00 AM – Caminata de aproximadamente 3 horas atravesando quebradas, lagunas y miradores naturales. 01:00 PM – Retorno a la comunidad y almuerzo. 02:00 PM – Traslado en transporte hacia Calca. 04:30 PM – Llegada al Valle Sagrado.",
        descriptionEn: "06:00 AM – Breakfast. 07:00 AM – Hike of approximately 3 hours through valleys, lagoons, and viewpoints. 01:00 PM – Return and lunch. 02:00 PM – Transfer to Calca. 04:30 PM – Arrival at the Sacred Valley.",
        highlights: ["Quebradas y lagunas"],
        highlightsEn: ["Valleys and lagoons"],
        meals: "Desayuno, Almuerzo",
        mealsEn: "Breakfast, Lunch",
        accommodation: "Fin del tour",
        accommodationEn: "End of tour"
      }
    ]
  },
  {
    id: "cancha-cancha-2d1n",
    categories: ["comunidad", "rutas"],
    name: "Cancha Cancha - 2 dias 1 Noche",
    nameEn: "Cancha Cancha 2D1N",
    heroImage: "/agencies/jaguarllaqta/cancha-cancha-2d1n/cancha-cancha-2d1n-hero.jpg",
    tagline: "Se parte de una experiencia autentica con familias de comunidades alto andinas.",
    taglineEn: "Be part of an authentic experience with families from high Andean communities.",
    duration: "2 días / 1 noche",
    durationEn: "2 days / 1 night",
    difficulty: "Moderado",
    difficultyEn: "Moderate",
    elevation: "3,200m - 4,400m max.",
    bestSeason: "",
    bestSeasonEn: "",
    price: 290,
    description: "Hermosa caminata por el valle de Huarán, en la cordillera de Urubamba. Iniciamos en Saywapata, recorriendo un bello valle con bosques nativos por unas 4 horas de ascenso hasta llegar a la comunidad altoandina de Cancha Cancha. Aquí seremos recibidos por una familia local, con un delicioso almuerzo, conoceremos su casa, textileria tradicional, agricultura, ganadería y compartiremos una auténtica experiencia con la naturaleza y la cultura andina. El segundo día visitamos la laguna sagrada de Wasan Qocha.",
    descriptionEn: "Beautiful trekking over the Huaran valley, located in the Urubamba mountain range. We start from Saywapata, going through a beautiful valley with native plants and trees for about 4 hours of ascent until we reach the high Andean community of Cancha Cancha. Here we will be received by one of the local families, with a delicious local lunch, we will get to know the family house, traditional textiles, agriculture, livestock, and we will share an authentic experience with nature and Andean culture. The next day we visit Wasan Qocha sacred lake.",
    highlights: ["Comunidad Cancha Cancha", "Laguna Wasan Qocha", "Convivencia cultural","Laguna Yanacocha"],
    highlightsEn: ["Cancha Cancha community", "Wasan Qocha Lagoon", "Cultural coexistence","Yanacocha Lagoon"],
    includes: [
      "Transporte privado ida y vuelta",
      "Guía profesional",
      "Alimentación completa",
      "Recepción en casa de familia local",
      "Carga de equipaje"
    ],
    includesEn: [
      "Private transportation round trip",
      "Professional guide",
      "Full meals",
      "Reception in a local family house",
      "Luggage load"
    ],
    notIncludes: [
      "Snacks personales",
      "Equipo personal de montaña"
    ],
    notIncludesEn: [
      "Personal snacks",
      "Personal mountain equipment"
    ],
    requirements: [
      "Sombrero o gorra",
      "Bloqueador solar",
      "Botella de agua",
      "Dinero en efectivo",
      "DNI o Pasaporte",
      "Cámara fotográfica",
      "Ropa para Lluvia",
      "Bastones de Trekking"
    ],
    requirementsEn: [
      "Sun hat",
      "Sunscreen",
      "Water bottle",
      "Cash for souvenirs",
      "ID",
      "Camera",
      "Rain equipment",
      "Trekking Poles"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Saywapata – Cancha Cancha",
        titleEn: "Sacred Valley – Saywapata – Cancha Cancha",
        description: "08:00 AM – Recojo en transporte hacia Saywapata. 08:30 AM – Inicio de la caminata de ascenso (aprox. 4 horas). 12:30 PM – Llegada a Cancha Cancha y recepción en casa de familia local. Almuerzo y descanso. 03:00 PM – Compartir con la familia, aprender de su agricultura, textiles y animales. Posible visita a la laguna Yanaqocha para una ofrenda andina. 06:00 PM – Cena y descanso.",
        descriptionEn: "08:00 AM – Pick-up and transfer to Saywapata. 08:30 AM – Start of the hike (approx. 4 hours). 12:30 PM – Arrival at Cancha Cancha and reception in a local family house. Lunch and rest. 03:00 PM – Share with the local family, learn about agriculture, textiles and animals. Optional visit to Yanaqocha lagoon for an Andean offering. 06:00 PM – Dinner and rest.",
        highlights: ["Llegada a comunidad", "Experiencia cultural"],
        highlightsEn: ["Arrival at community", "Cultural experience"],
        meals: "Almuerzo, Cena",
        mealsEn: "Lunch, Dinner",
        accommodation: "Casa de familia local",
        accommodationEn: "Local family home"
      },
      {
        day: 2,
        title: "Cancha Cancha – Wasan Qocha – Valle Sagrado",
        titleEn: "Cancha Cancha – Wasan Qocha – Sacred Valley",
        description: "07:00 AM – Desayuno e inicio de caminata hacia la laguna sagrada Wasan Qocha (2 horas). 10:00 AM – Llegada a la laguna, descanso y ofrenda andina. 11:00 AM – Retorno a la casa de familia (1h 20m). 12:30 PM – Almuerzo y descanso. 02:00 PM – Descenso hacia el Valle Sagrado. 04:30 PM – Fin de la caminata.",
        descriptionEn: "07:00 AM – Breakfast and hike to Wasan Qocha sacred lake (2 hours). 10:00 AM – Arrival at the lake, rest and Andean offering. 11:00 AM – Return to family house (1h 20m). 12:30 PM – Lunch and rest. 02:00 PM – Descent to the Sacred Valley. 04:30 PM – End of hike.",
        highlights: ["Laguna Wasan Qocha", "Ofrenda Andina"],
        highlightsEn: ["Wasan Qocha Lake", "Andean Offering"],
        meals: "Desayuno, Almuerzo",
        mealsEn: "Breakfast, Lunch",
        accommodation: "Fin del tour",
        accommodationEn: "End of tour"
      }
    ]
  },
  {
    id: "full-day-spiritual",
    categories: ["ceremonias"],
    name: " Ofrenda Andina y Temazcali",
    nameEn: "Temezcali and Andean Offering",
    heroImage: "/agencies/jaguarllaqta/full-day-spiritual/full-day-spiritual-hero.jpg",
    heroImagePosition: "center 25%",
    tagline: "Conecta con rituales ancestrales de purificación y conexión con el mundo espiritual de los Andes.",
    taglineEn: "Connect with ancestral purification rituals and the spiritual world of the Andes.",
    duration: "Día completo",
    durationEn: "Full day",
    difficulty: "",
    difficultyEn: "",
    elevation: "",
    bestSeason: "",
    bestSeasonEn: "",
    price: 100,
    description: "Esta experiencia espiritual de día completo integra dos poderosos rituales: la ofrenda andina o “Despacho” y la ceremonia de temazcal. La ofrenda andina es uno de los rituales más importantes de la cosmovisión andina, mediante el cual se pide permiso y bendiciones a la Pachamama, los Apus y las energías del universo. La ceremonia de temazcal, de origen mesoamericano, es un baño de vapor tradicional que busca la limpieza y renovación del cuerpo, la mente y el espíritu.",
    descriptionEn: "This full-day spiritual experience combines two powerful rituals: the Andean offering, known as “Despacho”, and the temazcal ceremony. The Andean offering is one of the most important rituals in Andean cosmology, performed to ask for permission and blessings from Pachamama, the Apus, and the universe. The temazcal ceremony, of Mesoamerican origin, is a traditional steam bath aimed at cleansing and renewing the body, mind, and spirit.",
    highlights: ["Ofrenda andina (Despacho)", "Ceremonia de temazcal", "Conexión profunda"],
    highlightsEn: ["Andean offering (Despacho)", "Temazcal ceremony", "Deep connection"],
    includes: [
      "Ofrenda andina (Despacho)",
      "Ceremonia de temazcal",
      "Alimentación"
    ],
    includesEn: [
      "Andean offering (Despacho)",
      "Temazcal ceremony",
      "Food"
    ],
    notIncludes: [
      "Transporte",
      "Artículos personales (toalla, traje de baño)"
    ],
    notIncludesEn: [
      "Transportation",
      "Personal items (towel, swimsuit)"
    ],
    requirements: [
      "Ropa de cambio",
      "Ropa cómoda",
      "Traje de baño",
      "Toalla",
      "Botella de agua",
      "Mochila pequeña"
    ],
    requirementsEn: [
      "Change of clothes",
      "Comfortable clothing",
      "Swimsuit",
      "Towel",
      "Water bottle",
      "Small backpack"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Arin – Temazcal – Valle Sagrado",
        titleEn: "Sacred Valley – Arin – Temazcal – Sacred Valley",
        description: "08:00 AM – Recojo desde su alojamiento y traslado hacia el pueblo de Arin. 09:00 AM – Inicio de la ofrenda andina. 11:30 AM – Quema de la ofrenda. 12:00 PM – Ingreso al temazcali para iniciar la ceremonia. 03:00 PM – Finalización, almuerzo y tiempo de descanso. 05:00 PM – Retorno.",
        descriptionEn: "08:00 AM – Pick-up from your accommodation and transfer to Arin village. 09:00 AM – Start of the Andean offering (approx. 1.5 hours). 11:30 AM – Burning of the offering in the sacred fire. 12:00 PM – Entry into the temazcali (sweat lodge) to begin the ceremony (approx. 3 hours). 03:00 PM – End of the ceremony, lunch, and relaxation time. 05:00 PM – Return transfer to your accommodation.",
        highlights: ["Ofrenda Andina", "Temazcali"],
        highlightsEn: ["Andean Offering", "Temazcali"],
        meals: "Almuerzo",
        mealsEn: "Lunch",
        accommodation: "",
        accommodationEn: ""
      }
    ]
  },
  {
    id: "half-day-spiritual",
    categories: ["ceremonias"],
    name: "Ofrenda Ancestral Andina",
    nameEn: "Ancestral Andean Offering",
    heroImage: "/agencies/jaguarllaqta/half-day-spiritual/half-day-spiritual-hero.jpg",
    tagline: "Se parte de una ceremonia ancestral de conexión con el mundo andino.",
    taglineEn: "Be part of an ancestral ceremony of connection with the Andean world.",
    duration: "Medio día",
    durationEn: "Half day",
    difficulty: "",
    difficultyEn: "",
    elevation: "",
    bestSeason: "",
    bestSeasonEn: "",
    price: 100,
    description: "Esta experiencia espiritual de medio día se centra en uno de los rituales más importantes de la cosmovisión andina: la ofrenda andina o “Despacho”. La ceremonia es guiada por un líder espiritual perteneciente a las comunidades Q’eros, consideradas descendientes directos de la tradición inca. Durante la experiencia también se realiza la lectura de hojas de coca, un ritual ancestral que permite hacer consultas sobre la vida y el camino personal.",
    descriptionEn: "This half-day spiritual experience focuses on one of the most important rituals in Andean cosmology: the Andean offering, also known as “Despacho”. The ceremony is guided by a spiritual leader from the Q’eros communities, considered direct descendants of the Inca tradition. The experience also includes a coca leaf reading, an ancient ritual that allows participants to ask questions about life and their personal path.",
    highlights: ["Ofrenda andina y limpieza energética", "Lectura de hojas de coca", "Guía espiritual Q'ero"],
    highlightsEn: ["Andean offering and energy cleansing", "Coca leaf reading", "Q'ero spiritual guide"],
    includes: [
      "Ofrenda andina y limpieza energética",
      "Lectura de hojas de coca",
      "Refrigerio"
    ],
    includesEn: [
      "Andean offering and energy cleansing",
      "Coca leaf reading",
      "Visit to a natural setting",
      "Box Lunch"
    ],
    notIncludes: [
      "Transporte"
    ],
    notIncludesEn: [
      "Transportation"
    ],
    requirements: [
      "Ropa cómoda",
      "Botella de agua",
      "Cámara fotográfica"
    ],
    requirementsEn: [
      "Comfortable clothing",
      "Water bottle",
      "Camera"
    ],
    itinerary: [
      {
        day: 1,
        title: "Valle Sagrado – Templo Ancestral – Valle Sagrado",
        titleEn: "Sacred Valley – Ancient Temple – Sacred Valley",
        description: "08:00 AM – Recojo desde su alojamiento y traslado en transporte hacia un templo ancestral en el Valle Sagrado de los Incas. 09:00 AM – Inicio de la experiencia con la lectura de hojas de coca, seguida de la preparación de la ofrenda andina guiada por el líder espiritual. 12:30 PM – Finalización de la experiencia y retorno.",
        descriptionEn: "08:00 AM – Pick-up from your accommodation and transfer to an ancient temple in the Sacred Valley of the Incas. 09:00 AM – Start of the experience with coca leaf reading, followed by the preparation of the Andean offering guided by the spiritual leader. 12:30 PM – End of the experience and return.",
        highlights: ["Lectura de Coca", "Ofrenda Andina"],
        highlightsEn: ["Coca Reading", "Andean Offering"],
        meals: "Refrigerio",
        mealsEn: "Box Lunch",
        accommodation: "",
        accommodationEn: ""
      }
    ]
  },

];

const categoryOrder: Record<ActivityCategory, string[]> = {
  rutas: [
    "naupa-waka",
    "cancha-cancha",
    "inti-punku",
    "lares-trek-3d2n",
    "pumawanka",
    "ausangate-trek-3d2n",
    "pumamarca",
    "quishuarani-2d1n",
    "cancha-cancha-2d1n",
    "choquequirao-trek",
    "manu-rainforest-5d4n",
  ],
  comunidad: [
    "cancha-cancha",
    "cancha-cancha-2d1n",
    "lares-trek-3d2n",
    "quishuarani-2d1n",
    "ausangate-trek-3d2n",
  ],
  ceremonias: [
    "half-day-spiritual",
    "full-day-spiritual",
  ],
};

const allOrder = [
  "naupa-waka",
  "cancha-cancha",
  "inti-punku",
  "lares-trek-3d2n",
  "pumawanka",
  "ausangate-trek-3d2n",
  "pumamarca",
  "quishuarani-2d1n",
  "cancha-cancha-2d1n",
  "choquequirao-trek",
  "manu-rainforest-5d4n",
  "half-day-spiritual",
  "full-day-spiritual",
];

export const getPackagesByCategory = (category: ActivityCategory) => {
  const order = categoryOrder[category];
  const filtered = packages.filter((p) => p.categories.includes(category));
  if (!order.length) return filtered;
  return filtered.sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    const aPos = ai === -1 ? Infinity : ai;
    const bPos = bi === -1 ? Infinity : bi;
    return aPos - bPos;
  });
};

export const getAllPackagesSorted = () =>
  [...packages].sort((a, b) => {
    const ai = allOrder.indexOf(a.id);
    const bi = allOrder.indexOf(b.id);
    const aPos = ai === -1 ? Infinity : ai;
    const bPos = bi === -1 ? Infinity : bi;
    return aPos - bPos;
  });

export const getPackageById = (id: string) =>
  packages.find((p) => p.id === id);
