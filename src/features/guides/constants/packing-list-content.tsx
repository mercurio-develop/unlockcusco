import { CloudRain, ThermometerSun, Sun, Footprints, Backpack, Shirt, Mountain, BatteryCharging, Check, Droplet, type LucideIcon } from "lucide-react";

export interface MistakeSection {
  title: string;
  paragraphs: string[];
  fixTitle: string;
  fixes: string[];
}

export interface AffiliateProduct {
  title: string;
  subtitle: string;
  desc: string;
  why: string;
  perf: string;
  bestUse: string;
  icon: LucideIcon;
  color: string;
  link: string;
  image?: string;
}

export interface PackingListContent {
  title: string;
  intro: string[];
  sections: MistakeSection[];
  outro: string;
  buyOnAmazon: string;
  why: string;
  perf: string;
  bestUse: string;
  products: AffiliateProduct[];
}

export const packingListContent: { en: PackingListContent; es: PackingListContent } = {
  en: {
    title: 'Packing for Cusco: How to Be Ready for Intense Sun, Rain, and Cold (Without Looking Like a Safari Guide)',
    intro: [
      'When I first traveled to South America, I did an awful job of packing. I walked into a travel shop in downtown Boulder and bought a mountain of technical “travel clothes” and a behemoth backpacking pack.',
      'Some of the clothes were okay, but most of them never felt quite like me. And that backpack? It was so violently oversized that I’m pretty sure my current chronic back pain started right then and there. I had way too much stuff, but absolutely none of the right stuff. It got so bad that every time I handed my pack over to a bus driver or a hotel bellhop, I secretly hoped someone would just steal the thing to relieve me of the burden.',
      'To save your spine—and your style—let me help you avoid making the exact same mistakes on your trip to Cusco.'
    ],
    sections: [
      {
        title: 'Mistake 1: Clothes That Don’t Feel Like "You"',
        paragraphs: [
          'I used to think buying specialized "travel gear" was a requirement. The problem is that most technical travel clothes make you feel like an undercover safari guide instead of yourself. You want to look back at your travel photos and see you, not a walking billboard for an outdoor catalog.',
          'You absolutely need sun protection, but you don\'t need head-to-toe Gore-Tex to get it.'
        ],
        fixTitle: 'The Fix:',
        fixes: [
          '**Ditch the Cargo Travel Pants:** Leave the multi-pocket hiking trousers at home. You will feel much more like yourself in your favorite jeans, a solid pair of leggings, or some comfortable joggers.',
          '**Skip the Shorts:** You won\'t see locals wearing shorts very often in Cusco; the culture is a bit more conservative than the coast or the jungle. Plus, there are tiny, annoying midges (biting bugs) that absolutely love exposed ankles.',
          '**Keep Tops Light and Breathable:** Bring a lightweight button-up shirt in a linen or cotton blend, a few tank tops, and a couple of regular t-shirts. If you’re hiking up around Machu Picchu, pack just one dedicated UPF sun shirt.',
          '**Pack One "Feel Good" Item:** Bring a comfortable dress or a jumpsuit. Choose something that you don’t mind getting a little wrinkled but makes you feel pretty when you want to dust off the trail grime for a nice dinner.'
        ]
      },
      {
        title: 'Mistake 2: The "Behemoth" Backpack',
        paragraphs: [
          'My giant Osprey backpack was a logistical nightmare. The airport in Lima is massive and requires a ton of walking, and Cusco’s historic center is a maze of steep, cobblestone stairs that taxis physically cannot drive up. Hauling a giant pack up those stairs is a quick way to ruin your first day.',
          'If you aren’t bringing a rolling suitcase, do not buy a backpack over 50 liters. If you pack carefully, you can easily go much smaller.'
        ],
        fixTitle: 'The Fix:',
        fixes: [
          '**The 50L Max Rule:** If you are unsure about the weight, pack your bag at home and do a test walk for half a mile. If you feel like collapsing, open the bag and start losing stuff immediately.',
          '**Stop the "Front-Pack" Madness:** Don\'t make the mistake of strapping a secondary daypack across your chest like a turtle shell. It destroys your posture and makes navigating crowded local buses impossible. Instead, keep your essentials—phone, passport, wallet, and sunglasses—in a simple, secure crossbody bag on your front.',
          '**What I Use Now:** I upgraded to an awesome, compact [Cotopaxi Allpa Travel Pack](https://amzn.to/4wif2E1). It forces me to pack smart, fits perfectly in overhead compartments, and keeps everything organized without the bulk.'
        ]
      },
      {
        title: 'Mistake 3: The "Only Hiking Shoes" Trap',
        paragraphs: [
          'On my first trip, I had a pair of [Salomon sneakers](https://amzn.to/3SxJ08j) that I absolutely loved (and will recommend forever for hiking), but I didn\'t bring a single pair of normal, flat shoes. Every time I wanted to go to a casual cafe or a nice restaurant, I felt like I was dressed to summit a mountain.'
        ],
        fixTitle: 'The Fix:',
        fixes: [
          '**Pack a Travel Flat (With Traction):** Bring a simple, lightweight flat shoe or canvas sneaker for city walking. *Crucial tip: Make sure it has a solid rubber sole with actual grip.* Cusco’s historic stones turn mirror-slick the second a sudden rainstorm hits, and you don’t want to accidentally ice-skate down the steep stairs of Resbalosa street.',
          '**Bring Flip-Flops:** Pack a lightweight, cheap pair of flip-flops. You\'ll want them if you\'re staying in a hostel or taking a day trip to the local hot springs.',
          '**Choose One Style:** If you are a dedicated Birkenstock fan, choose between your travel flats or your Birks—you don\'t need both taking up precious space.'
        ]
      },
      {
        title: 'Mistake 4: Awkward Outer Layers',
        paragraphs: [
          'Weather in the Andes moves fast. You will experience scorching equator-adjacent sun, sudden downpours, and freezing high-altitude nights all in the same afternoon. Layers are your best friend, but make sure they are layers you actually enjoy wearing.',
          'I spent my first trip wrapped in a bright neon-green rain jacket that was completely wrong for my skin tone, and I hated looking at myself in photos.'
        ],
        fixTitle: 'The Fix:',
        fixes: [
          '**A Neutral Rain Jacket:** Absolutely bring a rain jacket, but choose a color that actually suits you or a solid neutral tone that blends with the rest of your clothes.',
          '**Packable Down:** Cusco gets incredibly chilly the moment the sun drops below the mountains. A lightweight, packable down jacket is a total necessity. ([Packable Down](https://amzn.to/4apuc1E))',
          '**The Secret Weapon (Cashmere):** If you take only one high-quality outer layer, make it a cozy [100% Cashmere Crewneck Sweater](https://amzn.to/3Qm3i44) (brands like State Cashmere on Amazon make incredible, classic versions). Cashmere is brilliant for travel: it’s lightweight, intensely warm without causing overheating, and naturally resists odors so you can wear it repeatedly.',
          '**A Wide Shawl:** A large, soft shawl doubles as a cozy blanket on long bus rides and a temporary sun shield for your shoulders. *If you don\'t own one, don\'t buy it before you leave!* You can pick up stunning, inexpensive alpaca-blend shawls at the local markets in Cusco, Pisac, or Ollantaytambo.',
          '**A Packable Sun Hat:** The high-altitude sun here is deceptively intense. Bring your favorite sun hat, but make sure it’s a style that can be squished into your bag without losing its shape.'
        ]
      },
      {
        title: 'Mistake 5: Lugging Around Miscellaneous Junk',
        paragraphs: [
          'I am still embarrassed by the sheer volume of random stuff I dragged across South America. As a redhead, I was terrified of running out of sun protection, so I carried five full bottles of sunscreen in my pack.',
          'I quickly learned that at 11,000+ feet, the high-altitude Andean UV index is brutal, and slathering on heavy, sticky cream all day is a losing battle. A quality wide-brimmed hat and a long-sleeve linen shirt were infinitely more effective at blocking the rays (and significantly less sticky).',
          'I also hauled heavy watercolor kits, multiple journals, hardcover books, travel dictionaries, and a heavy "backpack safe" metal mesh wrap that I never used even once.'
        ],
        fixTitle: 'What You Actually Need to Pack:',
        fixes: [
          'Peru has fantastic, fully stocked pharmacies and shops everywhere you look—including Cusco, the Sacred Valley, and Aguas Calientes (Machu Picchu town). If you run out of toothpaste or need a specific cream, you can buy it there in five minutes.',
          '*Keep your miscellaneous list strictly to the essentials:*',
          'A good sun hat & sunglasses',
          'High-quality electrolytes (like [LMNT packets](https://amzn.to/3T4eYJn) to help hydrate and fight altitude sickness)',
          'Reliable [liquid probiotics](https://amzn.to/3SlXOqF) (to protect your stomach against new food bacteria)',
          'A Kindle or e-reader (instead of heavy books)',
          'Earbuds',
          'A filter water bottle (like a [Grayl or LifeStraw](https://amzn.to/3QsyxKO))',
          'Minimal, travel-sized toiletries (just enough sunscreen, shampoo, and a toothbrush to get you through the first two days)'
        ]
      }
    ],
    outro: 'And that’s it. Pack light, pack pieces that make you feel like yourself, and enjoy the cobblestones of Cusco without a massive weight on your shoulders!',
    buyOnAmazon: 'Buy on Amazon',
    why: 'Why it works',
    perf: 'Performance',
    bestUse: 'Best Use',
    products: [
      {
        title: 'The Essential Shell: Patagonia Torrentshell',
        subtitle: 'Best for Sudden Downpours',
        desc: 'A high-quality, lightweight rain jacket is non-negotiable. The Patagonia Torrentshell is a classic because it is incredibly durable, completely waterproof, and packs down into its own pocket.',
        why: 'It features a 3-layer H2No Performance Standard shell, meaning it completely blocks wind and rain while remaining breathable.',
        perf: 'Waterproof, windproof, and breathable. It won\'t make you sweat profusely while hiking up to ruins.',
        bestUse: 'Keep it stuffed in the bottom of your daypack at all times. Pull it out when the afternoon rain clouds roll over the mountains.',
        icon: CloudRain,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        link: 'https://www.amazon.com/s?k=patagonia+torrentshell&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'The Core Layer: Merino Wool Base Layers',
        subtitle: 'Best for Temperature Swings',
        desc: 'Cotton is terrible for hiking because it holds sweat and makes you cold. Merino wool is the ultimate travel fabric because it naturally regulates your body temperature and resists odors.',
        why: 'Merino wool fibers are porous, allowing sweat to evaporate as a vapor before it turns into liquid sweat, keeping you dry and warm.',
        perf: 'Odor-resistant, moisture-wicking, and incredibly soft. You can wear it multiple days in a row without washing it.',
        bestUse: 'Wear it as your base layer every single day. It keeps you warm in the chilly mornings and cool during the hot afternoons.',
        icon: ThermometerSun,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        link: 'https://www.amazon.com/s?k=icebreaker+merino+wool&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Ultimate Protection: Columbia Sun Hat',
        subtitle: 'Best for High Altitude Sun',
        desc: 'At 11,000 feet, the UV index is intense. A regular baseball cap leaves your neck exposed to severe sunburns. You need a wide-brimmed hat with UPF protection.',
        why: 'It features a wide brim and a protective neck flap, shielding your face, ears, and neck from direct solar radiation.',
        perf: 'UPF 50 sun protection, breathable mesh vents, and a sweat-wicking headband.',
        bestUse: 'Exploring exposed ruins like Sacsayhuaman, Pisac, and Machu Picchu where there is absolutely zero natural shade.',
        icon: Sun,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        link: 'https://www.amazon.com/s?k=columbia+bora+bora+booney+hat&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'The Foundation: Salomon Trail Runners',
        subtitle: 'Best for Cobblestones & Ruins',
        desc: 'Unless you are doing a multi-day technical trek with a heavy backpack, you do not need heavy, stiff hiking boots. For the Sacred Valley, trail running shoes are vastly superior.',
        why: 'They provide the aggressive grip of a hiking boot with the lightweight comfort and flexibility of a sneaker.',
        perf: 'Excellent traction on wet stones, breathable, and supportive enough for 15,000+ step days.',
        bestUse: 'Navigating the uneven, slippery cobblestone streets of Cusco and climbing the steep, irregular stone steps of Inca ruins.',
        icon: Footprints,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        link: 'https://amzn.to/3SxJ08j',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Cushioned Alternative: HOKA Speedgoat',
        subtitle: 'Best for Joint Protection',
        desc: 'If you suffer from knee or joint pain, the cobblestones in Cusco can be brutal. HOKA provides maximum cushioning.',
        why: 'The thick EVA midsole absorbs the shock of walking on hard, uneven stone surfaces all day.',
        perf: 'Incredible underfoot comfort and a Vibram Megagrip outsole for slipping prevention.',
        bestUse: 'Travelers who prioritize maximum cushioning and joint relief during long days of walking.',
        icon: Footprints,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        link: 'https://www.amazon.com/s?k=hoka+speedgoat&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'The Ultimate Travel Pack: Cotopaxi Allpa',
        subtitle: 'Best for Packing Smart',
        desc: 'A durable, organized travel pack that keeps your gear secure and easily accessible, fitting perfectly in overhead bins.',
        why: 'It features a continuous wrap-around harness and hipbelt that moves with you.',
        perf: 'Lightweight, extremely breathable back panel, and perfectly sized for day trips.',
        bestUse: 'Exploring the Sacred Valley, full-day Machu Picchu tours, and carrying your daily essentials.',
        icon: Backpack,
        color: 'bg-stone-50 text-stone-700 border-stone-200',
        link: 'https://amzn.to/4wif2E1',
        image: '/images/guides/packing-product-cotopaxi.jpeg'
      },
      {
        title: 'The Secret Weapon: Cashmere Crewneck',
        subtitle: 'Best for Weight-to-Warmth Ratio',
        desc: 'A high-quality 100% cashmere sweater is lightweight, incredibly warm, and naturally odor-resistant, making it perfect for travel.',
        why: 'It offers the aesthetic of wool with the easy care and quick-drying performance of fleece.',
        perf: 'Highly insulating, durable, and comfortable over base layers.',
        bestUse: 'Chilly mornings, evening strolls around Cusco, and layering under your rain shell.',
        icon: Shirt,
        color: 'bg-zinc-50 text-zinc-700 border-zinc-200',
        link: 'https://amzn.to/3Qm3i44',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Happy Feet: Darn Tough Merino Socks',
        subtitle: 'Best for Blister Prevention',
        desc: 'Do not ruin your trip with cheap cotton socks. Quality Merino wool socks are crucial for long days of walking.',
        why: 'Unconditional lifetime guarantee. They wick moisture, regulate temperature, and prevent friction.',
        perf: 'Seamless toe, high-density knitting, and incredibly durable.',
        bestUse: 'Every single day of your trip to keep your feet dry and blister-free.',
        icon: Footprints,
        color: 'bg-neutral-50 text-neutral-700 border-neutral-200',
        link: 'https://www.amazon.com/s?k=darn+tough+merino+wool+socks+cushion&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Knee Savers: Black Diamond Trekking Poles',
        subtitle: 'Best for Steep Inca Steps',
        desc: 'The Inca ruins are characterized by massive, uneven, and often slippery stone steps. Trekking poles save your knees from excessive strain.',
        why: 'They provide stability and distribute the impact away from your lower joints.',
        perf: 'Adjustable, lightweight aluminum, and comfortable EVA foam grips.',
        bestUse: 'Descending steep ruins like Pisac and navigating the uneven terrain of the Inca Trail.',
        icon: Mountain,
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        link: 'https://www.amazon.com/s?k=black+diamond+trail+back+trekking+poles&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Never Lose Charge: Anker Power Bank',
        subtitle: 'Best for Long Tour Days',
        desc: 'Between taking thousands of photos and using GPS, your phone battery will drain quickly. A reliable power bank is essential.',
        why: 'Anker provides high-speed charging in a very compact, travel-friendly size.',
        perf: 'Can charge a modern smartphone multiple times on a single charge.',
        bestUse: 'Full-day tours to the Sacred Valley or Machu Picchu where wall outlets are non-existent.',
        icon: BatteryCharging,
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        link: 'https://www.amazon.com/s?k=anker+powercore+10000&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=600&auto=format&fit=crop'
      }
    ]
  },
  es: {
    title: 'Empacar para Cusco: Cómo estar listo para el sol intenso, la lluvia y el frío (sin parecer un guía de safari)',
    intro: [
      'Cuando viajé a Sudamérica por primera vez, hice un trabajo terrible al empacar. Entré a una tienda de viajes en el centro de Boulder y compré una montaña de "ropa técnica de viaje" y una mochila de mochilero gigantesca.',
      'Algunas prendas estaban bien, pero la mayoría nunca se sintieron realmente como yo. ¿Y esa mochila? Era tan violentamente sobredimensionada que estoy bastante segura de que mi dolor de espalda crónico actual comenzó justo ahí. Tenía demasiadas cosas, pero absolutamente nada de lo correcto. Llegó a ser tan malo que cada vez que le entregaba mi mochila a un conductor de autobús o a un botones de hotel, en secreto esperaba que alguien se la robara para liberarme de esa carga.',
      'Para salvar tu columna, y tu estilo, déjame ayudarte a evitar cometer los mismos errores en tu viaje a Cusco.'
    ],
    sections: [
      {
        title: 'Error 1: Ropa que no se siente como "Tú"',
        paragraphs: [
          'Solía pensar que comprar "equipo de viaje" especializado era un requisito. El problema es que la mayoría de la ropa técnica de viaje te hace sentir como un guía de safari encubierto en lugar de ti mismo. Quieres mirar atrás a tus fotos de viaje y verte a ti, no a un anuncio andante para un catálogo de actividades al aire libre.',
          'Absolutamente necesitas protección solar, pero no necesitas Gore-Tex de pies a cabeza para conseguirla.'
        ],
        fixTitle: 'La Solución:',
        fixes: [
          '**Olvídate de los pantalones cargo de viaje:** Deja los pantalones de senderismo con múltiples bolsillos en casa. Te sentirás mucho más como tú mismo con tus jeans favoritos, un buen par de leggings o unos joggers cómodos.',
          '**Evita los pantalones cortos:** No verás a los locales usar pantalones cortos muy a menudo en Cusco; la cultura es un poco más conservadora que la de la costa o la selva. Además, hay pequeños y molestos jejenes (bichos que pican) que adoran los tobillos expuestos.',
          '**Mantén las partes de arriba ligeras y transpirables:** Trae una camisa ligera de botones en una mezcla de lino o algodón, algunas camisetas sin mangas y un par de camisetas normales. Si vas a caminar por Machu Picchu, empaca solo una camisa de sol UPF dedicada.',
          '**Empaca una prenda para "sentirte bien":** Trae un vestido cómodo o un mono. Elige algo que no te importe que se arrugue un poco pero que te haga sentir bonita cuando quieras quitarte la suciedad del sendero para una buena cena.'
        ]
      },
      {
        title: 'Error 2: La mochila gigante ("Behemoth")',
        paragraphs: [
          'Mi mochila gigante Osprey fue una pesadilla logística. El aeropuerto de Lima es enorme y requiere caminar un montón, y el centro histórico de Cusco es un laberinto de escaleras empinadas de adoquines por las que los taxis físicamente no pueden subir. Cargar una mochila gigante por esas escaleras es una forma rápida de arruinar tu primer día.',
          'Si no vas a traer una maleta con ruedas, no compres una mochila de más de 50 litros. Si empacas con cuidado, puedes viajar fácilmente con algo mucho más pequeño.'
        ],
        fixTitle: 'La Solución:',
        fixes: [
          '**La regla del máximo de 50L:** Si no estás seguro del peso, empaca tu mochila en casa y haz una caminata de prueba de un kilómetro. Si sientes que te vas a desmayar, abre la mochila y empieza a sacar cosas de inmediato.',
          '**Detén la locura de la "mochila frontal":** No cometas el error de colgarte una mochila secundaria en el pecho como si fuera un caparazón de tortuga. Destruye tu postura y hace que moverte en autobuses locales llenos sea imposible. En su lugar, mantén tus elementos esenciales (teléfono, pasaporte, billetera y lentes de sol) en un bolso cruzado simple y seguro en el frente.',
          '**Lo que uso ahora:** Me cambié a una mochila compacta y fantástica, la [Cotopaxi Allpa Travel Pack](https://amzn.to/4wif2E1). Me obliga a empacar de manera inteligente, cabe perfectamente en los compartimentos superiores y mantiene todo organizado sin el volumen.'
        ]
      },
      {
        title: 'Error 3: La trampa de "Solo zapatos de senderismo"',
        paragraphs: [
          'En mi primer viaje, tenía un par de [zapatillas Salomon](https://amzn.to/3SxJ08j) que me encantaban (y recomendaré por siempre para hacer senderismo), pero no traje ni un solo par de zapatos normales y planos. Cada vez que quería ir a una cafetería informal o a un buen restaurante, sentía que estaba vestida para escalar una montaña.'
        ],
        fixTitle: 'La Solución:',
        fixes: [
          '**Empaca un calzado plano de viaje (con tracción):** Trae un zapato plano simple y ligero o unas zapatillas de lona para caminar por la ciudad. *Consejo crucial: Asegúrate de que tenga una suela de gama sólida con agarre real.* Las piedras históricas de Cusco se vuelven resbaladizas como un espejo en el segundo en que cae una tormenta de lluvia repentina, y no querrás patinar accidentalmente por las empinadas escaleras de la calle Resbalosa.',
          '**Trae sandalias de playa (flip-flops):** Empaca un par ligero y económico de sandalias. Las querrás si te hospedas en un hostal o haces una excursión de un día a las aguas termales locales.',
          '**Elige un estilo:** Si eres un fanático dedicado de Birkenstock, elige entre tus planos de viaje o tus Birks; no necesitas ambos ocupando espacio precioso.'
        ]
      },
      {
        title: 'Error 4: Capas exteriores incómodas',
        paragraphs: [
          'El clima en los Andes cambia rápido. Experimentarás un sol abrasador cerca del ecuador, aguaceros repentinos y noches heladas a gran altura, todo en la misma tarde. Las capas son tus mejores aliadas, pero asegúrate de que sean capas que realmente disfrutes usar.',
          'Pasé mi primer viaje envuelta en una chaqueta impermeable de color verde neón brillante que no combinaba para nada con mi tono de piel, y odiaba verme en las fotos.'
        ],
        fixTitle: 'La Solución:',
        fixes: [
          '**Una chaqueta impermeable neutra:** Definitivamente trae una chaqueta impermeable, pero elige un color que realmente te quede bien o un tono neutro sólido que combine con el resto de tu ropa.',
          '**Chaqueta de plumón empacable:** Cusco se vuelve increíblemente frío en el momento en que el sol se oculta tras las montañas. Una chaqueta de plumón ligera y empacable es una necesidad absoluta. ([Chaqueta de Plumón](https://amzn.to/4apuc1E))',
          '**El arma secreta (Cashmere):** Si vas a llevar solo una capa exterior de alta calidad, que sea un suéter de cuello redondo de [100% cachemira](https://amzn.to/3Qm3i44) (marcas como State Cashmere en Amazon hacen versiones clásicas increíbles). La cachemira es genial para viajar: es ligera, sumamente cálida sin causar sobrecalentamiento y naturalmente resistente a los olores, por lo que puedes usarla repetidamente.',
          '**Un chal ancho:** Un chal grande y suave funciona como una manta acogedora en los viajes largos en autobús y como un protector solar temporal para tus hombros. *Si no tienes uno, ¡no lo compres antes de irte!* Puedes conseguir chales hermosos y económicos de mezcla de alpaca en los mercados locales de Cusco, Pisac u Ollantaytambo.',
          '**Un sombrero de sol empacable:** El sol de gran altitud aquí es engañosamente intenso. Trae tu sombrero de sol favorito, pero asegúrate de que sea un estilo que se pueda guardar en tu mochila sin perder su forma.'
        ]
      },
      {
        title: 'Error 5: Cargar con cosas inútiles y variadas',
        paragraphs: [
          'Todavía me avergüenza el gran volumen de cosas aleatorias que arrastré por Sudamérica. Como pelirroja, me aterrorizaba quedarme sin protección solar, así que cargaba cinco botellas llenas de protector solar en mi mochila.',
          'Rápidamente aprendí que a más de 3,300 metros de altura, el índice UV andino es brutal, y embadurnarse con crema espesa y pegajosa todo el día es una batalla perdida. Un sombrero de ala ancha de calidad y una camisa de lino de manga larga fueron infinitamente más efectivos para bloquear los rayos (y significativamente menos pegajosos).',
          'También cargué con pesados estuches de acuarelas, múltiples diarios, libros de tapa dura, diccionarios de viaje y una pesada malla metálica de seguridad para mochilas que nunca usé ni una sola vez.'
        ],
        fixTitle: 'Lo que realmente necesitas empacar:',
        fixes: [
          'Perú tiene farmacias y tiendas fantásticas y completamente abastecidas dondequiera que mires, incluidos Cusco, el Valle Sagrado y Aguas Calientes (el pueblo de Machu Picchu). Si te quedas sin pasta de dientes o necesitas una crema específica, puedes comprarla allí en cinco minutos.',
          '*Mantén tu lista de artículos varios estrictamente en lo esencial:*',
          'Un buen sombrero de sol y lentes de sol',
          'Electrolitos de alta calidad (como los [paquetes LMNT](https://amzn.to/3T4eYJn) para ayudar a hidratarte y combatir el mal de altura)',
          'Probióticos líquidos confiables (para proteger tu estómago de las bacterias de los nuevos alimentos) ([Probióticos Líquidos](https://amzn.to/3SlXOqF))',
          'Un Kindle o lector de libros electrónicos (en lugar de libros pesados)',
          'Auriculares',
          'Una botella con filtro de agua (como [Grayl o LifeStraw](https://amzn.to/3QsyxKO))',
          'Artículos de tocador mínimos de tamaño de viaje (solo suficiente protector solar, champú y un cepillo de dientes para pasar los dos primeros días)'
        ]
      }
    ],
    outro: 'Y eso es todo. ¡Empaca ligero, empaca prendas con las que te sientas tú mismo y disfruta de los adoquines de Cusco sin un peso enorme sobre tus hombros!',
    buyOnAmazon: 'Comprar en Amazon',
    why: 'Por qué funciona',
    perf: 'Rendimiento',
    bestUse: 'Mejor uso',
    products: [
      {
        title: 'La Capa Esencial: Patagonia Torrentshell',
        subtitle: 'Lo Mejor para Aguaceros Repentinos',
        desc: 'Una chaqueta impermeable ligera y de alta calidad no es negociable. La Patagonia Torrentshell es un clásico porque es increíblemente duradera, completamente impermeable y se guarda en su propio bolsillo.',
        why: 'Cuenta con un tejido H2No de 3 capas, lo que significa que bloquea completamente el viento y la lluvia sin dejar de ser transpirable.',
        perf: 'Impermeable, a prueba de viento y transpirable. No te hará sudar profusamente mientras subes a las ruinas.',
        bestUse: 'Mantenla siempre guardada en el fondo de tu mochila. Sácala cuando las nubes de lluvia de la tarde cubran las montañas.',
        icon: CloudRain,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        link: 'https://www.amazon.com/s?k=patagonia+torrentshell&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'El Núcleo: Capas Base de Lana Merino',
        subtitle: 'Lo Mejor para Cambios de Temperatura',
        desc: 'El algodón es terrible para caminar porque retiene el sudor y te enfría. La lana merino es la tela de viaje definitiva porque regula naturalmente la temperatura corporal y resiste los olores.',
        why: 'Las fibras de lana merino son porosas, lo que permite que el sudor se evapore como vapor antes de convertirse en líquido, manteniéndote seco y caliente.',
        perf: 'Resistente a los olores, absorbe la humedad e increíblemente suave. Puedes usarlo varios días seguidos sin lavarlo.',
        bestUse: 'Úsalo como tu capa base todos los días. Te mantiene caliente en las mañanas frías y fresco durante las tardes calurosas.',
        icon: ThermometerSun,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        link: 'https://www.amazon.com/s?k=icebreaker+merino+wool&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Protección Total: Sombrero Columbia',
        subtitle: 'Lo Mejor para el Sol de Altura',
        desc: 'A más de 3,300 metros, el índice UV es extremo. Una gorra de béisbol normal deja tu cuello expuesto a quemaduras graves. Necesitas un sombrero de ala ancha con protección UPF.',
        why: 'Cuenta con un ala ancha y una solapa protectora para el cuello, protegiendo tu cara, orejas y cuello de la radiación solar directa.',
        perf: 'Protección solar UPF 50, rejillas de ventilación de malla transpirable y una diadema que absorbe el sudor.',
        bestUse: 'Explorar ruinas expuestas como Sacsayhuaman, Pisac y Machu Picchu donde hay absolutamente cero sombra natural.',
        icon: Sun,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        link: 'https://www.amazon.com/s?k=columbia+bora+bora+booney+hat&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'La Base: Zapatillas de Trail Salomon',
        subtitle: 'Lo Mejor para Adoquines y Ruinas',
        desc: 'A menos que estés haciendo una caminata técnica de varios días con una mochila pesada, no necesitas botas de montaña pesadas y rígidas. Para el Valle Sagrado, las zapatillas de trail running son muy superiores.',
        why: 'Proporcionan el agarre agresivo de una bota de montaña con la comodidad ligera y la flexibilidad de una zapatilla deportiva.',
        perf: 'Excelente tracción en piedras mojadas, transpirables y con suficiente soporte para días de más de 15,000 pasos.',
        bestUse: 'Navegar por las calles empedradas desiguales y resbaladizas de Cusco y escalar los empinados e irregulares escalones de piedra de las ruinas incas.',
        icon: Footprints,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        link: 'https://amzn.to/3SxJ08j',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'El Peso Pesado: Grayl GeoPress',
        subtitle: 'Lo Mejor para Viajes Globales',
        desc: 'Si buscas una solución que cubra casi todo, el Grayl GeoPress es mi principal recomendación. Funciona con un sistema de presión: llenas el vaso exterior, presionas el cartucho interior hacia abajo y tienes agua purificada en segundos.',
        why: 'Es rápido, intuitivo y no requiere configuración ni esfuerzo de "succión".',
        perf: 'Filtra prácticamente todos los patógenos, incluyendo virus, bacterias y protozoos, así como productos químicos y metales pesados.',
        bestUse: 'Viajes generales donde deseas una botella duradera y fácil de usar que no requiera mantenimiento complejo, ya sea en una ciudad bulliciosa o al inicio de un sendero.',
        icon: Check,
        color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        link: 'https://amzn.to/3QsyxKO',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Soporte Avanzado de Hidratación: Paquetes de Electrolitos LMNT',
        subtitle: 'Lo Mejor para Altitud Extrema y Humedad',
        desc: 'Cuando te enfrentas a la intensa humedad de la Amazonía o la altitud extrema de los Andes, el agua corriente no es suficiente. Pierdes minerales vitales cuando sudas y te aclimatas.',
        why: 'Los paquetes LMNT contienen una formulación alta en sodio y sin azúcar (junto con potasio y magnesio) que te rehidrata más rápido que cualquier bebida deportiva estándar.',
        perf: 'Vienen en barras ligeras de una sola porción que puedes vaciar directamente en tu agua filtrada.',
        bestUse: 'Hidratación diaria durante caminatas, exploración de ciudades a gran altitud o recuperación de la fatiga del viaje.',
        icon: Droplet,
        color: 'bg-sky-50 text-sky-700 border-sky-200',
        link: 'https://amzn.to/3T4eYJn',
        image: '/images/guides/health-hydration-product-2.jpeg'
      },
      {
        title: 'Rescate Rápido del Intestino: Paquetes de Probióticos Líquidos',
        subtitle: 'Lo Mejor para Estómagos Sensibles adaptándose a la comida local',
        desc: 'Cuando mi madre se enfermó, fue un duro recordatorio de que viajar introduce tu estómago a cepas de bacterias completamente nuevas. Un probiótico diario construye un muro defensivo en tu flora intestinal.',
        why: 'Los probióticos líquidos se absorben mucho más rápido que las píldoras tradicionales y no requieren refrigeración si compras variedades aptas para viajes. Son un salvavidas literal para estómagos sensibles.',
        perf: 'Opciones de grado clínico altamente efectivas de marcas como Klaire Labs o Seeking Health estabilizan tu microbioma rápidamente.',
        bestUse: 'Tómalo a diario como medida preventiva o inmediatamente a la primera señal de molestia estomacal.',
        icon: Check,
        color: 'bg-teal-50 text-teal-700 border-teal-200',
        link: 'https://amzn.to/3SlXOqF',
        image: '/images/guides/health-hydration-product-3.jpeg'
      },
      {
        title: 'Protección para Alta Altitud: Protector Solar Mineral No Tóxico',
        subtitle: 'Lo Mejor para el Sol Abrasador de los Andes',
        desc: 'Debido a que Perú se encuentra cerca del ecuador y presenta cordilleras masivas, el índice UV aquí es rutinariamente extremo. Los protectores solares químicos tradicionales a menudo están llenos de ingredientes que no deseas que se absorban en tu piel todo el día.',
        why: 'Marcas como Thinkbaby (SPF 50+) y Raw Elements ofrecen protección basada en zinc, no tóxica y segura para los arrecifes. Se asientan sobre la piel para bloquear físicamente el sol abrasador.',
        perf: 'No se escurren hacia los ojos cuando sudas y son completamente seguros para toda la familia.',
        bestUse: 'Aplicación diaria para ruinas a gran altitud, caminatas o cualquier exploración al aire libre en los Andes.',
        icon: Sun,
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        link: 'https://www.amazon.com/s?k=thinkbaby+sunscreen&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Alternativa Amortiguada: HOKA Speedgoat',
        subtitle: 'Lo Mejor para Protección de Articulaciones',
        desc: 'Si sufres de dolor de rodillas o articulaciones, los adoquines en Cusco pueden ser brutales. HOKA proporciona la máxima amortiguación.',
        why: 'La gruesa entresuela de EVA absorbe el impacto de caminar sobre superficies de piedra duras e irregulares todo el día.',
        perf: 'Increíble comodidad bajo los pies y una suela Vibram Megagrip para evitar resbalones.',
        bestUse: 'Viajeros que priorizan la máxima amortiguación y el alivio de las articulaciones durante largos días de caminata.',
        icon: Footprints,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        link: 'https://www.amazon.com/s?k=hoka+speedgoat&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'La Mochila de Viaje Definitiva: Cotopaxi Allpa',
        subtitle: 'Lo Mejor para Empacar Inteligente',
        desc: 'Una mochila de viaje duradera y organizada que mantiene tu equipo seguro y de fácil acceso, cabiendo perfectamente en los compartimentos superiores.',
        why: 'Cuenta con un arnés envolvente y cinturón de cadera que se mueve contigo.',
        perf: 'Ligera, panel trasero extremadamente transpirable y de tamaño perfecto para viajes de un día.',
        bestUse: 'Explorar el Valle Sagrado, tours de todo el día en Machu Picchu y llevar tus elementos esenciales diarios.',
        icon: Backpack,
        color: 'bg-stone-50 text-stone-700 border-stone-200',
        link: 'https://amzn.to/4wif2E1',
        image: '/images/guides/packing-product-cotopaxi.jpeg'
      },
      {
        title: 'El Arma Secreta: Suéter de Cachemira',
        subtitle: 'Lo Mejor para Relación Peso-Calor',
        desc: 'Un suéter de cachemira de alta calidad es ligero, increíblemente cálido y naturalmente resistente a los olores, lo que lo hace perfecto para viajar.',
        why: 'Ofrece la estética de la lana con el cuidado fácil y secado rápido del vellón.',
        perf: 'Altamente aislante, duradero y cómodo sobre las capas base.',
        bestUse: 'Mañanas frías, paseos nocturnos por Cusco y para usar debajo de tu chaqueta impermeable.',
        icon: Shirt,
        color: 'bg-zinc-50 text-zinc-700 border-zinc-200',
        link: 'https://amzn.to/3Qm3i44',
        image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Pies Felices: Calcetines Darn Tough Merino',
        subtitle: 'Lo Mejor para Prevenir Ampollas',
        desc: 'No arruines tu viaje con calcetines de algodón baratos. Unos calcetines de lana Merino de calidad son cruciales para largos días de caminata.',
        why: 'Garantía incondicional de por vida. Absorben la humedad, regulan la temperatura y previenen la fricción.',
        perf: 'Puntera sin costuras, tejido de alta densidad e increíblemente duraderos.',
        bestUse: 'Todos los días de tu viaje para mantener tus pies secos y sin ampollas.',
        icon: Footprints,
        color: 'bg-neutral-50 text-neutral-700 border-neutral-200',
        link: 'https://www.amazon.com/s?k=darn+tough+merino+wool+socks+cushion&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Salvadores de Rodillas: Bastones Black Diamond',
        subtitle: 'Lo Mejor para Escalones Incas Empinados',
        desc: 'Las ruinas incas se caracterizan por escalones de piedra enormes, irregulares y a menudo resbaladizos. Los bastones de trekking salvan tus rodillas de un esfuerzo excesivo.',
        why: 'Proporcionan estabilidad y distribuyen el impacto lejos de tus articulaciones inferiores.',
        perf: 'Aluminio ligero ajustable y cómodas empuñaduras de espuma EVA.',
        bestUse: 'Descender ruinas empinadas como Pisac y navegar por el terreno irregular del Camino Inca.',
        icon: Mountain,
        color: 'bg-slate-50 text-slate-700 border-slate-200',
        link: 'https://www.amazon.com/s?k=black+diamond+trail+back+trekking+poles&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?q=80&w=600&auto=format&fit=crop'
      },
      {
        title: 'Nunca Sin Batería: Batería Externa Anker',
        subtitle: 'Lo Mejor para Días Largos de Tour',
        desc: 'Entre tomar miles de fotos y usar el GPS, la batería de tu teléfono se agotará rápidamente. Una batería externa confiable es esencial.',
        why: 'Anker proporciona carga de alta velocidad en un tamaño muy compacto y amigable para viajar.',
        perf: 'Puede cargar un teléfono inteligente moderno varias veces con una sola carga.',
        bestUse: 'Tours de todo el día al Valle Sagrado o Machu Picchu donde no hay enchufes de pared.',
        icon: BatteryCharging,
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        link: 'https://www.amazon.com/s?k=anker+powercore+10000&tag=unlockcusco-20',
        image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?q=80&w=600&auto=format&fit=crop'
      }
    ]
  }
};
