import { Metadata } from "next";
import { Droplet, ShieldCheck, Zap, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AffiliateProductCard } from "@/features/guides/components/affiliate-product-card";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'es' ? "¿Necesito un filtro de agua en Perú? | Guías UnlockCusco" : "Do I Need a Water Filter in Peru? | UnlockCusco Guides",
    description: lang === 'es' ? "Descubre por qué un filtro de agua es esencial para viajar a Perú y cuáles son los mejores." : "Discover why a water filter is essential for traveling to Peru and which ones are the best.",
  };
}

export default async function WaterFilterGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';

  const content = {
    en: {
      title: 'Do I Need a Water Filter in Peru?',
      intro: 'I’ll never forget the time I was riding in a small boat through the Amazon, the overpowering heat, scorching sun, and thick humidity, with nothing around for miles. My friends were worried about their dwindling water supply, but I reached into my bag, pulled out my LifeStraw, and dipped it right into the river. I took a sip, passed it around, and saved the day for our whole group. My friends told me I was their hero, but really, I was just prepared.',
      realityTitle: 'The Reality of Drinking Water in Peru',
      realityText: 'After 13 years of calling Peru home—from my early days as a solo backpacker to now navigating travel with my own children—I can tell you one thing: a stomach bug is the quickest way to make a trip miserable. Peru is wonderful, but it is vastly different from the USA. You won’t always find a bathroom nearby, and when you do, toilet paper and seat lids are often luxuries. You do not want to be stuck in a hotel room in the middle of the night, wishing you hadn\'t trusted the waiter when he told you the water was safe.',
      solutionText: 'While buying bottled water is an option, it creates a massive amount of waste and gets expensive quickly; I’ve seen small bottles cost upwards of $5 at the Lima airport. Save yourself the stress and the expense by traveling with a portable filtration system. Here are my top recommendations based on my experience living and traveling through the Coast, Sierra, and Amazon.',
      buyOnAmazon: 'Buy on Amazon',
      why: 'Why it works',
      perf: 'Performance',
      bestUse: 'Best Use',
      products: [
        {
          title: 'The Heavy Hitter: Grayl GeoPress',
          subtitle: 'Best for Global Travel',
          desc: 'If you want one solution that covers almost every base, the Grayl GeoPress is my top recommendation. It operates on a press system: you fill the outer cup with water, press the inner cartridge down, and you have purified water in seconds.',
          why: 'It is fast, intuitive, and requires zero setup or "sucking" effort.',
          perf: 'Filters out virtually all pathogens, including viruses, bacteria, and protozoa, as well as chemicals and heavy metals.',
          bestUse: 'General travel where you want a durable, easy-to-use bottle that requires no complex maintenance, whether you are in a bustling city or near a trailhead.',
          icon: ShieldCheck,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          link: 'https://www.amazon.com/s?k=grayl+geopress+water+purifier&tag=unlockcusco-20'
        },
        {
          title: 'Best for Adventurers: Screw-Cap Membrane Filters',
          subtitle: 'Sawyer MINI or LifeStraw Flex',
          desc: 'If you are hiking the Inca Trail or hopping between buses, you need something that won\'t add weight to your pack. Filters like the Sawyer MINI or LifeStraw Flex are incredibly efficient.',
          why: 'They are lightweight, low-volume, and screw directly onto most standard water bottles. You can dip your bottle into a stream or tap and drink immediately via suction.',
          perf: 'These typically use a 0.1 µm pore size, which is excellent for removing bacteria and protozoa.',
          bestUse: 'Individual use during trekking, city exploring, or any scenario where you need a compact, immediate solution.',
          icon: Zap,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: 'https://www.amazon.com/s?k=sawyer+mini+water+filter&tag=unlockcusco-20'
        },
        {
          title: 'Best for Families: Platypus GravityWorks',
          subtitle: 'High-Capacity Gravity System',
          desc: 'When you are traveling with children, carrying enough water for everyone is a logistical nightmare. The Platypus GravityWorks is a fantastic system because it takes the labor out of filtering.',
          why: 'It uses gravity to do the heavy lifting. You hang a "dirty" reservoir filled with river or tap water, and it automatically filters clean water into a separate container. It is hands-free, high-capacity, and filters water much faster than you could ever pump or suck it through a straw.',
          perf: 'Effectively removes bacteria and protozoa, providing high-flow, clean water for multiple people at once.',
          bestUse: 'Family accommodation, base camps, or anywhere you need to filter larger amounts of water for drinking and cooking without individual effort.',
          icon: Droplet,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          link: 'https://www.amazon.com/s?k=platypus+gravityworks&tag=unlockcusco-20'
        },
        {
          title: 'Best for Sensitive Bellies: Solar Bags (AquaPak)',
          subtitle: 'Comprehensive Pasteurization',
          desc: 'If you or your family members have particularly reactive stomachs, you need the highest level of protection against the widest range of pathogens, including viruses. Solar bags like the AquaPak are highly effective for comprehensive safety.',
          why: 'They utilize solar and thermal energy (pasteurization) to treat water. While this takes longer than a filter, the peace of mind is worth the wait for those prone to waterborne illness.',
          perf: 'Provide comprehensive protection against bacteria, protozoa, and viruses.',
          bestUse: 'Scenarios where you have time to wait for the water to be treated, ensuring the highest safety standard for those who simply cannot afford a stomach bug.',
          icon: Sun,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          link: 'https://www.amazon.com/s?k=aquapak+solar+water+purification&tag=unlockcusco-20'
        }
      ]
    },
    es: {
      title: '¿Necesito un filtro de agua en Perú?',
      intro: 'Nunca olvidaré aquella vez que navegaba en un pequeño bote por el Amazonas: un calor sofocante, un sol abrasador y una humedad densa, sin nada alrededor en kilómetros. Mis amigos estaban preocupados porque su agua se agotaba, pero metí la mano en mi mochila, saqué mi LifeStraw y lo sumergí directamente en el río. Di un sorbo, lo pasé y salvé el día para todo el grupo. Mis amigos me dijeron que era su héroe, pero en realidad, solo estaba preparado.',
      realityTitle: 'La Realidad del Agua Potable en Perú',
      realityText: 'Después de 13 años llamando a Perú mi hogar —desde mis primeros días como mochilero solitario hasta ahora viajando con mis propios hijos— puedo decirte una cosa: una infección estomacal es la forma más rápida de arruinar un viaje. Perú es maravilloso, pero es muy diferente de Estados Unidos o Europa. No siempre encontrarás un baño cerca, y cuando lo haces, el papel higiénico y las tapas de los inodoros suelen ser lujos. No querrás estar atrapado en una habitación de hotel a mitad de la noche, deseando no haber confiado en el mesero cuando te dijo que el agua era segura.',
      solutionText: 'Aunque comprar agua embotellada es una opción, genera una gran cantidad de residuos y se encarece rápidamente; he visto botellas pequeñas costar hasta $5 en el aeropuerto de Lima. Ahórrate el estrés y el gasto viajando con un sistema de filtración portátil. Aquí tienes mis principales recomendaciones basadas en mi experiencia viviendo y viajando por la Costa, Sierra y Amazonía.',
      buyOnAmazon: 'Comprar en Amazon',
      why: 'Por qué funciona',
      perf: 'Rendimiento',
      bestUse: 'Mejor uso',
      products: [
        {
          title: 'El Peso Pesado: Grayl GeoPress',
          subtitle: 'Lo Mejor para Viajes Globales',
          desc: 'Si buscas una solución que cubra casi todo, el Grayl GeoPress es mi principal recomendación. Funciona con un sistema de presión: llenas el vaso exterior, presionas el cartucho interior hacia abajo y tienes agua purificada en segundos.',
          why: 'Es rápido, intuitivo y no requiere configuración ni esfuerzo de "succión".',
          perf: 'Filtra prácticamente todos los patógenos, incluyendo virus, bacterias y protozoos, así como productos químicos y metales pesados.',
          bestUse: 'Viajes generales donde deseas una botella duradera y fácil de usar que no requiera mantenimiento complejo, ya sea en una ciudad bulliciosa o al inicio de un sendero.',
          icon: ShieldCheck,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          link: 'https://www.amazon.com/s?k=grayl+geopress+water+purifier&tag=unlockcusco-20'
        },
        {
          title: 'Lo Mejor para Aventureros: Filtros a Rosca',
          subtitle: 'Sawyer MINI o LifeStraw Flex',
          desc: 'Si vas a caminar por el Camino Inca o viajar entre autobuses, necesitas algo que no añada peso a tu mochila. Filtros como el Sawyer MINI o LifeStraw Flex son increíblemente eficientes.',
          why: 'Son ligeros, de poco volumen y se enroscan directamente en botellas de agua. Puedes sumergir tu botella en un arroyo y beber inmediatamente por succión.',
          perf: 'Por lo general, utilizan un tamaño de poro de 0.1 µm, excelente para eliminar bacterias y protozoos.',
          bestUse: 'Uso individual durante caminatas, exploración urbana o cualquier escenario donde necesites una solución compacta e inmediata.',
          icon: Zap,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: 'https://www.amazon.com/s?k=sawyer+mini+water+filter&tag=unlockcusco-20'
        },
        {
          title: 'Lo Mejor para Familias: Platypus GravityWorks',
          subtitle: 'Sistema de Gravedad',
          desc: 'Cuando viajas con niños, llevar agua para todos es una pesadilla logística. El Platypus GravityWorks es fantástico porque elimina el trabajo de filtrado.',
          why: 'Utiliza la gravedad para hacer el trabajo pesado. Cuelgas un depósito "sucio", y automáticamente filtra agua limpia hacia otro recipiente.',
          perf: 'Elimina eficazmente bacterias y protozoos, proporcionando agua limpia de alto flujo para varias personas.',
          bestUse: 'Alojamiento familiar, campamentos o cualquier lugar donde necesites filtrar grandes cantidades de agua sin esfuerzo individual.',
          icon: Droplet,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          link: 'https://www.amazon.com/s?k=platypus+gravityworks&tag=unlockcusco-20'
        },
        {
          title: 'Para Estómagos Sensibles: Bolsas Solares (AquaPak)',
          subtitle: 'Pasteurización Completa',
          desc: 'Si tienen estómagos particularmente reactivos, necesitan el nivel más alto de protección contra virus. Las bolsas solares son muy efectivas.',
          why: 'Utilizan energía solar y térmica (pasteurización) para tratar el agua.',
          perf: 'Proporcionan protección integral contra bacterias, protozoos y virus.',
          bestUse: 'Escenarios en los que tienes tiempo para esperar a que se trate el agua, garantizando la mayor seguridad.',
          icon: Sun,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          link: 'https://www.amazon.com/s?k=aquapak+solar+water+purification&tag=unlockcusco-20'
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
            "image": "https://images.unsplash.com/photo-1544985223-958b9758cbcc?q=80&w=1200&auto=format&fit=crop",
            "author": { "@type": "Person", "name": "Rebecca W." },
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
              // REPLACE THIS URL WITH REBECCA'S ACTUAL IMAGE URL
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" 
              alt="Rebecca W." 
              fill 
              className="object-cover" 
            />
          </div>
          <div>
            <p className="font-bold text-slate-900">Rebecca W.</p>
            <p className="text-sm text-slate-500">{isEs ? 'Co-fundadora' : 'Co-founder'}, UnlockCusco</p>
          </div>
        </div>

        <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-12 shadow-sm">
           <Image 
             src="https://images.unsplash.com/photo-1544985223-958b9758cbcc?q=80&w=1200&auto=format&fit=crop" 
             alt="Drinking water in nature" 
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
