import { Metadata } from "next";
import { Droplet, ExternalLink, ShieldCheck, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AffiliateProductCard } from "@/features/guides/components/affiliate-product-card";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'es' ? "Salud e Hidratación Esencial en Perú | Guías UnlockCusco" : "Essential Health & Hydration in Peru | UnlockCusco Guides",
    description: lang === 'es' ? "Por qué la hidratación importa a más de 3,600 metros de altura y cómo prepararse para el clima andino." : "Why hydration matters at 12,000 feet and how to prepare for the Andean climate.",
  };
}

export default async function HealthHydrationGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';

  const content = {
    en: {
      title: 'Essential Health & Hydration in Peru',
      intro: 'The Puno Wake-Up Call: Why Hydration Matters at 12,000 Feet',
      realityTitle: 'The Reality of the Andean Climate',
      realityText: 'I’ll never forget the trip to Puno that taught me just how brutal altitude and dehydration can be. Nestled right on the edge of Lake Titicaca, Puno is breathtaking—literally. The air up there is so thin and dry that it quickly saps the moisture right out of your body without you even realizing it.\n\nOn that trip, I underestimated the climate, got severely dehydrated, and paid the price. I was stuck in bed for three straight days, absolutely miserable, watching the beautiful Peruvian landscape from a window instead of exploring it.\n\nTo make matters worse, my mom came to visit me around that same time and caught a horrible local stomach bug. She was staying in a traditional guest house where the only available bathroom was down two flights of stairs. If you’ve ever had a travel illness, you know that navigating stairs in the middle of the night is the absolute worst-case scenario. Luckily, we managed to get her some high-quality liquid probiotics, and they fixed her gut almost immediately.',
      solutionText: 'Those two experiences completely changed how I pack. Now, whenever friends or family tell me they are coming to visit me in Peru, I give them a strict list of must-haves to buy before they leave.\n\n**My Top Travel Prep Recommendations**\n\nYou can easily find all of these items online before your flight. They take up almost no space in a suitcase but will completely save your trip.\n\n**Travel Tip:** Pack these in your carry-on luggage! You do not want to be caught without an electrolyte packet if the airline loses your checked bags and you hit the ground running in Cusco or Puno.',
      buyOnAmazon: 'Buy on Amazon',
      why: 'Why I love it',
      perf: 'Performance',
      bestUse: 'Best Use',
      products: [
        {
          title: 'Advanced Hydration Support: LMNT Electrolyte Packets',
          subtitle: 'Best for Extreme Altitude & Humidity',
          desc: 'When you are dealing with the intense humidity of the Amazon or the extreme altitude of the Andes, plain water isn\'t enough. You lose vital minerals when you sweat and acclimatize.',
          why: 'LMNT packets contain a high-sodium, zero-sugar formulation (along with potassium and magnesium) that rehydrates you faster than any standard sports drink.',
          perf: 'They come in lightweight single-serve sticks that you can dump straight into your filtered water.',
          bestUse: 'Daily hydration during trekking, high-altitude city exploring, or recovering from travel fatigue.',
          icon: Droplet,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          link: 'https://www.amazon.com/s?k=lmnt+electrolyte+powder&tag=unlockcusco-20'
        },
        {
          title: 'Rapid Gut Rescue: Liquid Probiotic Packs',
          subtitle: 'Best for Sensitive Bellies adapting to local food',
          desc: 'When my mom got sick, it was a harsh reminder that traveling introduces your stomach to entirely new strains of bacteria. A daily probiotic builds a defensive wall in your gut flora.',
          why: 'Liquid probiotics absorb much faster than traditional pills and don\'t require refrigeration if you buy travel-stable varieties. They are a literal lifesaver for sensitive bellies adapting to local food.',
          perf: 'Highly effective clinical-grade options from brands like Klaire Labs or Seeking Health stabilize your microbiome rapidly.',
          bestUse: 'Take daily as a preventative measure or immediately at the first sign of stomach discomfort.',
          icon: ShieldCheck,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: 'https://www.amazon.com/s?k=travel+liquid+probiotics&tag=unlockcusco-20'
        },
        {
          title: 'High-Altitude Protection: Non-Toxic Mineral Sunscreen',
          subtitle: 'Best for the Scorching Andean Sun',
          desc: 'Because Peru sits close to the equator and features massive mountain ranges, the UV index here is routinely extreme. Traditional chemical sunscreens are often packed with ingredients you don’t want absorbing into your skin all day.',
          why: 'Brands like Thinkbaby (SPF 50+) and Raw Elements offer zinc-based, non-toxic, reef-safe protection. They sit on top of your skin to physically block the scorching Andean sun.',
          perf: 'They won\'t run into your eyes when you sweat, and they are completely safe for the whole family.',
          bestUse: 'Daily application for high-altitude ruins, hiking, or any outdoor exploration in the Andes.',
          icon: Sun,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          link: 'https://www.amazon.com/s?k=thinkbaby+sunscreen&tag=unlockcusco-20'
        }
      ]
    },
    es: {
      title: 'Salud e Hidratación Esencial en Perú',
      intro: 'La llamada de atención de Puno: Por qué importa la hidratación a 3,800 metros',
      realityTitle: 'La Realidad del Clima Andino',
      realityText: 'Nunca olvidaré el viaje a Puno que me enseñó lo brutal que puede ser la altitud y la deshidratación. Ubicado justo al borde del Lago Titicaca, Puno te deja sin aliento—literalmente. El aire allí arriba es tan fino y seco que rápidamente extrae la humedad de tu cuerpo sin que te des cuenta.\n\nEn ese viaje, subestimé el clima, me deshidraté gravemente y pagué el precio. Estuve atrapada en la cama durante tres días seguidos, sintiéndome absolutamente miserable, viendo el hermoso paisaje peruano desde una ventana en lugar de explorarlo.\n\nPara empeorar las cosas, mi madre vino a visitarme en esa misma época y contrajo un horrible virus estomacal local. Se estaba alojando en una casa de huéspedes tradicional donde el único baño disponible estaba a dos tramos de escaleras hacia abajo. Si alguna vez has tenido una enfermedad del viajero, sabes que navegar por escaleras en medio de la noche es el peor escenario posible. Por suerte, logramos conseguirle unos probióticos líquidos de alta calidad y curaron su intestino casi de inmediato.',
      solutionText: 'Esas dos experiencias cambiaron por completo cómo empaco. Ahora, cada vez que amigos o familiares me dicen que vienen a visitarme a Perú, les doy una lista estricta de artículos imprescindibles para comprar antes de irse.\n\n**Mis principales recomendaciones de preparación para el viaje**\n\nPuedes encontrar fácilmente todos estos artículos en línea antes de tu vuelo. Casi no ocupan espacio en la maleta, pero salvarán por completo tu viaje.\n\n**Consejo de Viaje:** ¡Empaca esto en tu equipaje de mano! No querrás quedarte sin un paquete de electrolitos si la aerolínea pierde tu equipaje documentado y tienes que empezar a moverte apenas llegues a Cusco o Puno.',
      buyOnAmazon: 'Comprar en Amazon',
      why: 'Por qué me encanta',
      perf: 'Rendimiento',
      bestUse: 'Mejor uso',
      products: [
        {
          title: 'Soporte Avanzado de Hidratación: Paquetes de Electrolitos LMNT',
          subtitle: 'Lo Mejor para Altitud Extrema y Humedad',
          desc: 'Cuando te enfrentas a la intensa humedad de la Amazonía o la altitud extrema de los Andes, el agua corriente no es suficiente. Pierdes minerales vitales cuando sudas y te aclimatas.',
          why: 'Los paquetes LMNT contienen una formulación alta en sodio y sin azúcar (junto con potasio y magnesio) que te rehidrata más rápido que cualquier bebida deportiva estándar.',
          perf: 'Vienen en barras ligeras de una sola porción que puedes vaciar directamente en tu agua filtrada.',
          bestUse: 'Hidratación diaria durante caminatas, exploración de ciudades a gran altitud o recuperación de la fatiga del viaje.',
          icon: Droplet,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          link: 'https://www.amazon.com/s?k=lmnt+electrolyte+powder&tag=unlockcusco-20'
        },
        {
          title: 'Rescate Rápido del Intestino: Paquetes de Probióticos Líquidos',
          subtitle: 'Lo Mejor para Estómagos Sensibles adaptándose a la comida local',
          desc: 'Cuando mi madre se enfermó, fue un duro recordatorio de que viajar introduce tu estómago a cepas de bacterias completamente nuevas. Un probiótico diario construye un muro defensivo en tu flora intestinal.',
          why: 'Los probióticos líquidos se absorben mucho más rápido que las píldoras tradicionales y no requieren refrigeración si compras variedades aptas para viajes. Son un salvavidas literal para estómagos sensibles.',
          perf: 'Opciones de grado clínico altamente efectivas de marcas como Klaire Labs o Seeking Health estabilizan tu microbioma rápidamente.',
          bestUse: 'Tómalo a diario como medida preventiva o inmediatamente a la primera señal de molestia estomacal.',
          icon: ShieldCheck,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: 'https://www.amazon.com/s?k=travel+liquid+probiotics&tag=unlockcusco-20'
        },
        {
          title: 'Protección para Alta Altitud: Protector Solar Mineral No Tóxico',
          subtitle: 'Lo Mejor para el Sol Abrasador de los Andes',
          desc: 'Debido a que Perú se encuentra cerca del ecuador y presenta cordilleras masivas, el índice UV aquí es rutinariamente extremo. Los protectores solares químicos tradicionales a menudo están llenos de ingredientes que no deseas que se absorban en tu piel todo el día.',
          why: 'Marcas como Thinkbaby (SPF 50+) y Raw Elements ofrecen protección basada en zinc, no tóxica y segura para los arrecifes. Se asientan sobre la piel para bloquear físicamente el sol abrasador.',
          perf: 'No se escurren hacia los ojos cuando sudas y son completamente seguros para toda la familia.',
          bestUse: 'Aplicación diaria para ruinas a gran altitud, caminatas o cualquier exploración al aire libre en los Andes.',
          icon: Sun,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          link: 'https://www.amazon.com/s?k=thinkbaby+sunscreen&tag=unlockcusco-20'
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
            "description": text.intro,
            "image": "https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9b?q=80&w=1200&auto=format&fit=crop",
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
             src="https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9b?q=80&w=1200&auto=format&fit=crop" 
             alt="Lake Titicaca Puno" 
             fill 
             className="object-cover"
             priority
           />
        </div>

        <div className="prose prose-slate prose-lg max-w-none">
          <p className="text-xl text-slate-900 font-serif font-bold italic mb-6">
            {text.intro}
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">{text.realityTitle}</h2>
          
          {text.realityText.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-slate-600 mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}

          {text.solutionText.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('**')) {
              return <h3 key={index} className="text-xl font-bold text-slate-900 mt-8 mb-4">{paragraph.replace(/\*\*/g, '')}</h3>;
            }
            if (paragraph.includes('**Travel Tip:**')) {
              return (
                <div key={index} className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
                  <p className="text-indigo-900 m-0">
                    <strong className="font-bold">Travel Tip:</strong> {paragraph.replace('**Travel Tip:**', '')}
                  </p>
                </div>
              );
            }
            return (
              <p key={index} className="text-slate-600 mb-6 leading-relaxed">
                {paragraph}
              </p>
            );
          })}

          <div className="space-y-8 mt-12">
            {text.products.map((product, i) => (
              <AffiliateProductCard key={i} product={product} labels={labels} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}