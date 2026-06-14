import { Metadata } from "next";
import { CloudRain, ThermometerSun, Sun, Footprints } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AffiliateProductCard } from "@/features/guides/components/affiliate-product-card";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'es' ? "Lista de Empaque para el Valle Sagrado | Guías UnlockCusco" : "Sacred Valley Packing List | UnlockCusco Guides",
    description: lang === 'es' ? "El clima andino es impredecible. Aprende exactamente qué empacar para sobrevivir al sol intenso y la lluvia en el Valle Sagrado." : "Andean weather is unpredictable. Learn exactly what to pack to survive the intense sun and sudden rain in the Sacred Valley.",
  };
}

export default async function PackingListGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';

  const content = {
    en: {
      title: 'Sacred Valley Packing List: The Layering Rule',
      intro: 'The Sacred Valley’s weather is notoriously unpredictable. In a single day, you can experience intense sun that burns your skin, freezing winds cutting through the ruins, and sudden, torrential downpours. The secret to comfort at 9,000+ feet? Strategic layering.',
      realityTitle: 'The Reality of Andean Weather',
      realityText: 'Forget everything you know about weather apps. In the Andes, it’s not uncommon to start the morning freezing in a thick sweater, sweating in a t-shirt by 1:00 PM, and scrambling for a rain jacket by 4:00 PM. UV radiation is also significantly higher at this altitude, meaning you will burn much faster than you would at sea level, even when it feels cloudy.',
      solutionText: 'The biggest mistake tourists make is bringing heavy, bulky coats. You do not need a massive winter parka unless you are doing a high-altitude overnight trek (like Ausangate). For day-to-day exploring in Cusco, Pisac, and Ollantaytambo, you need lightweight, breathable layers that you can easily take off and stuff into a daypack. Here are the absolute essentials you need to pack.',
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
          link: 'https://www.amazon.com/s?k=patagonia+torrentshell&tag=unlockcusco-20'
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
          link: 'https://www.amazon.com/s?k=icebreaker+merino+wool&tag=unlockcusco-20'
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
          link: 'https://www.amazon.com/s?k=columbia+bora+bora+booney+hat&tag=unlockcusco-20'
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
          link: 'https://www.amazon.com/s?k=salomon+speedcross&tag=unlockcusco-20'
        }
      ]
    },
    es: {
      title: 'Lista de Empaque para el Valle Sagrado: La Regla de las Capas',
      intro: 'El clima del Valle Sagrado es notoriamente impredecible. En un solo día, puedes experimentar un sol intenso que quema tu piel, vientos helados cruzando las ruinas y aguaceros repentinos y torrenciales. ¿El secreto para estar cómodo a más de 2,700 metros de altura? Vestirse estratégicamente en capas.',
      realityTitle: 'La Realidad del Clima Andino',
      realityText: 'Olvida todo lo que sabes sobre las aplicaciones del clima. En los Andes, es muy común comenzar la mañana congelándote con un suéter grueso, sudar en camiseta a la 1:00 PM y buscar desesperadamente una chaqueta impermeable a las 4:00 PM. Además, la radiación UV es significativamente más alta a esta altitud, lo que significa que te quemarás mucho más rápido que al nivel del mar, incluso cuando parezca estar nublado.',
      solutionText: 'El mayor error que cometen los turistas es traer abrigos pesados y voluminosos. No necesitas una parka gigante de invierno a menos que vayas a hacer una caminata técnica nocturna a gran altitud (como Ausangate). Para explorar el día a día en Cusco, Pisac y Ollantaytambo, necesitas capas ligeras y transpirables que puedas quitarte fácilmente y guardar en una mochila pequeña. Aquí tienes los elementos esenciales que debes empacar.',
      buyOnAmazon: 'Comprar en Amazon',
      why: 'Por qué funciona',
      perf: 'Rendimiento',
      bestUse: 'Mejor uso',
      products: [
        {
          title: 'La Capa Esencial: Patagonia Torrentshell',
          subtitle: 'Lo Mejor para Aguaceros Repentinos',
          desc: 'Una chaqueta impermeable ligera y de alta calidad no es negociable. La Patagonia Torrentshell es un clásico porque es increíblemente duradera, completamente impermeable y se guarda en su propio bolsillo.',
          why: 'Cuenta con una capa H2No de 3 niveles, lo que significa que bloquea completamente el viento y la lluvia sin dejar de ser transpirable.',
          perf: 'Impermeable, a prueba de viento y transpirable. No te hará sudar profusamente mientras subes a las ruinas.',
          bestUse: 'Mantenla siempre guardada en el fondo de tu mochila. Sácala cuando las nubes de lluvia de la tarde cubran las montañas.',
          icon: CloudRain,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          link: 'https://www.amazon.com/s?k=patagonia+torrentshell&tag=unlockcusco-20'
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
          link: 'https://www.amazon.com/s?k=icebreaker+merino+wool&tag=unlockcusco-20'
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
          link: 'https://www.amazon.com/s?k=columbia+bora+bora+booney+hat&tag=unlockcusco-20'
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
          link: 'https://www.amazon.com/s?k=salomon+speedcross&tag=unlockcusco-20'
        }
      ]
    }
  };

  const text = isEs ? content.es : content.en;
  
  const labels = {
    why: text.why,
    perf: text.perf,
    bestUse: text.bestUse,
    buyOnAmazon: text.buyOnAmazon
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": text.title,
            "description": text.intro.substring(0, 150) + "...",
            "image": "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop",
            "author": { "@type": "Person", "name": "Alejandro F." },
            "publisher": {
              "@type": "Organization",
              "name": "UnlockCusco",
              "logo": { "@type": "ImageObject", "url": "https://unlockcusco.com/icon.svg" }
            },
            "datePublished": new Date().toISOString().split('T')[0],
          })
        }}
      />
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-8">
          <Link href={`/${lang}/guides`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors w-fit">
            &larr; {isEs ? 'Volver a Guías' : 'Back to Guides'}
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
          {text.title}
        </h1>

        {/* Author Byline */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200">
            <Image 
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" 
              alt="Alejandro F." 
              fill 
              className="object-cover" 
            />
          </div>
          <div>
            <p className="font-bold text-slate-900">Alejandro F.</p>
            <p className="text-sm text-slate-500">{isEs ? 'Fundador' : 'Founder'}, UnlockCusco</p>
          </div>
        </div>

        <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-12 shadow-sm">
           <Image 
             src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop" 
             alt="Hiking gear" 
             fill 
             className="object-cover"
             priority
           />
        </div>

        <div className="prose prose-slate prose-lg max-w-none">
          <p className="text-lg text-slate-600 leading-relaxed font-medium italic mb-10 border-l-4 border-indigo-500 pl-4">
            "{text.intro}"
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">{text.realityTitle}</h2>
          <p className="text-slate-600 mb-6">{text.realityText}</p>
          <p className="text-slate-600 mb-12">{text.solutionText}</p>

          <div className="space-y-8">
            {text.products.map((product, i) => (
              <AffiliateProductCard key={i} product={product} labels={labels} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
