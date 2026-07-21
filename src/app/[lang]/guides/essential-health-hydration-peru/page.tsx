import { Metadata } from "next";
import { Droplet, ExternalLink, ShieldCheck, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AffiliateProductCard } from "@/features/guides";

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
      title: 'The Puno Wake-Up Call: Why Hydration Matters at 12,000 Feet',
      intro: 'Puno, Peru is nestled on the banks of Lake Titicaca, one of the most beautiful places I’ve ever visited. When night falls on the lake, the sky reflects in the deep purple water—half daylight and half full of stars. I’m not even kidding, you need to see it.',
      realityTitle: 'The Reality of the Andean Climate',
      realityText: 'Unfortunately, the first time I visited, I spent the entire trip stuck in the lower level of a hostel bunk bed, nauseous with my head aching, because I underestimated the altitude. In my gringa brilliance, I thought that having grown up in Colorado at 5,000 feet above sea level, I was immune. I was wrong. Lake Titicaca sits at over 12,000 feet, and the combination of extreme altitude, intense sun, and dry air means you have to take hydration seriously.\n\nAnother way to sap the fun from an amazing adventure is to succumb to traveler\'s diarrhea. The bacteria present in foods, even if you carefully avoid salads, raw fruits, and soft cheeses, can wreak havoc on your intestines. Once when my mom was visiting, she spent days trekking up and down the stairs at our guesthouse just to reach the bathroom. Luckily, we took her to the local pharmacy, and they gave her an amazing liquid probiotic called Enterogermina that got her back on her feet quickly. Now, she starts taking them a few days before visiting us, and she\'s been enjoying her time in Peru so much more.',
      solutionText: 'Those two experiences completely changed how I pack. Now, whenever friends or family tell me they are coming to visit us in Peru, I suggest they bring a few simple things to make sure they feel their best.\n\n**My Top Travel Prep Recommendations**\n\nYou can easily find all of these items online before your flight. They take up almost no space in a suitcase but could absolutely save your trip.\n\n**Travel Tip:** Pack these in your carry-on luggage! You do not want to be caught without an electrolyte packet if the airline loses your checked bags and you hit the ground running in Cusco or Puno.',
      buyOnAmazon: 'Buy on Amazon',
      why: 'Why I love it',
      perf: 'Performance',
      bestUse: 'Best Use',
      products: [
        {
          title: 'Advanced Hydration Support: LMNT Electrolyte Packets',
          subtitle: 'Best for Extreme Altitude & Dry Air',
          desc: 'When you are dealing with extreme altitude and dry mountain air, plain water isn\'t enough. You lose vital minerals much faster as your body acclimates to the thin air.',
          why: 'LMNT packets contain a high-sodium, zero-sugar formulation (along with potassium and magnesium) that rehydrates you faster than any standard sports drink.',
          perf: 'They come in lightweight, single-serve sticks that you can dump straight into your filtered water.',
          bestUse: 'Daily hydration during trekking, high-altitude city exploring, or recovering from travel fatigue.',
          icon: Droplet,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          link: 'https://amzn.to/44mbF2G'
        },
        {
          title: 'Rapid Gut Rescue: Enterogermina Liquid Probiotic Packs',
          subtitle: 'Best for Sensitive Bellies adapting to local food',
          desc: 'Traveling introduces your stomach to entirely new strains of bacteria. A daily probiotic builds a defensive wall in your gut flora. Ever since that pharmacy visit, my mom swears by Enterogermina and always starts her regimen a few days before she flies out.',
          why: 'These single-dose liquid vials absorb quickly, are completely tasteless, and don\'t require refrigeration, making them perfect for travel. They are a literal lifesaver for sensitive bellies adapting to local food.',
          perf: 'Highly effective clinical-grade options from brands like Klaire Labs or Seeking Health stabilize your microbiome rapidly.',
          bestUse: 'Take daily as a preventative measure or immediately at the first sign of stomach discomfort.',
          icon: ShieldCheck,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: 'https://amzn.to/4elC7zu'
        },
        {
          title: 'High-Altitude Protection: Non-Toxic Mineral Sunscreen',
          subtitle: 'Best for the Scorching Andean Sun',
          desc: 'Because Peru sits close to the equator and features massive mountain ranges, the UV index here is routinely extreme. Traditional chemical sunscreens are often packed with ingredients you don’t want absorbing into your skin all day.',
          why: 'I use zinc-based mineral sunscreen for my own family. It sits on top of your skin to physically block the scorching Andean sun, won\'t run into your eyes when you sweat, and is completely safe for everyone.',
          perf: 'They won\'t run into your eyes when you sweat, and they are completely safe for the whole family.',
          bestUse: 'Daily application for high-altitude ruins, hiking, or any outdoor exploration in the Andes.',
          icon: Sun,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          link: 'https://amzn.to/44mbF2G'
        }
      ]
    },
    es: {
      title: 'La llamada de atención de Puno: Por qué importa la hidratación a 3,800 metros',
      intro: 'Puno, Perú, está ubicado a orillas del Lago Titicaca, uno de los lugares más hermosos que he visitado. Cuando cae la noche sobre el lago, el cielo se refleja en el agua de color púrpura profundo: mitad luz de día y mitad lleno de estrellas. No es broma, tienes que verlo.',
      realityTitle: 'La Realidad del Clima Andino',
      realityText: 'Desafortunadamente, la primera vez que lo visité, pasé todo el viaje atrapada en la litera inferior de un hostal, con náuseas y dolor de cabeza, porque subestimé la altitud. Con mi brillantez de gringa, pensé que por haber crecido en Colorado a 1,500 metros sobre el nivel del mar, era inmune. Estaba equivocada. El Lago Titicaca se encuentra a más de 3,800 metros de altura, y la combinación de altitud extrema, sol intenso y aire seco significa que debes tomarte la hidratación muy en serio.\n\nOtra forma de arruinar una gran aventura es sucumbir a la diarrea del viajero. Las bacterias presentes en los alimentos, incluso si evitas cuidadosamente las ensaladas, frutas crudas y quesos suaves, pueden causar estragos en tus intestinos. Una vez, cuando mi madre estaba de visita, pasó días subiendo y bajando las escaleras de nuestra casa de huéspedes solo para llegar al baño. Afortunadamente, la llevamos a la farmacia local y le dieron un probiótico líquido increíble llamado Enterogermina que la recuperó rápidamente. Ahora, comienza a tomarlos unos días antes de visitarnos, y ha estado disfrutando mucho más de su tiempo en Perú.',
      solutionText: 'Esas dos experiencias cambiaron por completo cómo empaco. Ahora, cada vez que amigos o familiares me dicen que vienen a visitarnos a Perú, les sugiero que traigan algunas cosas simples para asegurarse de sentirse lo mejor posible.\n\n**Mis principales recomendaciones de preparación para el viaje**\n\nPuedes encontrar fácilmente todos estos artículos en línea antes de tu vuelo. Casi no ocupan espacio en la maleta, pero podrían salvar absolutamente tu viaje.\n\n**Consejo de Viaje:** ¡Empaca esto en tu equipaje de mano! No querrás quedarte sin un paquete de electrolitos si la aerolínea pierde tu equipaje documentado y tienes que empezar a moverte apenas llegues a Cusco o Puno.',
      buyOnAmazon: 'Comprar en Amazon',
      why: 'Por qué me encanta',
      perf: 'Rendimiento',
      bestUse: 'Mejor uso',
      products: [
        {
          title: 'Soporte Avanzado de Hidratación: Paquetes de Electrolitos LMNT',
          subtitle: 'Lo Mejor para Altitud Extrema y Aire Seco',
          desc: 'Cuando te enfrentas a la altitud extrema y al aire seco de la montaña, el agua sola no es suficiente. Pierdes minerales vitales mucho más rápido a medida que tu cuerpo se aclima al aire fino.',
          why: 'Los paquetes de LMNT contienen una formulación alta en sodio y sin azúcar (junto con potasio y magnesio) que te rehidrata más rápido que cualquier bebida deportiva estándar. Vienen en prácticas barras individuales que puedes verter directamente en tu agua filtrada.',
          perf: 'Vienen en barras ligeras de una sola porción que puedes vaciar directamente en tu agua filtrada.',
          bestUse: 'Hidratación diaria durante caminatas, exploración de ciudades a gran altitud o recuperación de la fatiga del viaje.',
          icon: Droplet,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          link: 'https://amzn.to/44mbF2G'
        },
        {
          title: 'Rescate Rápido del Intestino: Paquetes de Probióticos Líquidos Enterogermina',
          subtitle: 'Lo Mejor para Estómagos Sensibles adaptándose a la comida local',
          desc: 'Viajar introduce tu estómago a cepas de bacterias completamente nuevas. Un probiótico diario construye un muro defensivo en tu flora intestinal. Desde esa visita a la farmacia, mi mamá jura por Enterogermina y siempre comienza su régimen unos días antes de volar.',
          why: 'Estos viales líquidos de dosis única se absorben rápidamente, no tienen ningún sabor y no requieren refrigeración, lo que los hace perfectos para viajar. Son un salvavidas literal para estómagos sensibles que se adaptan a la comida local.',
          perf: 'Opciones de grado clínico altamente efectivas de marcas como Klaire Labs o Seeking Health estabilizan tu microbioma rápidamente.',
          bestUse: 'Tómalo a diario como medida preventiva o inmediatamente a la primera señal de molestia estomacal.',
          icon: ShieldCheck,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          link: 'https://amzn.to/4elC7zu'
        },
        {
          title: 'Protección para Alta Altitud: Protector Solar Mineral No Tóxico',
          subtitle: 'Lo Mejor para el Sol Abrasador de los Andes',
          desc: 'Debido a que Perú se encuentra cerca del ecuador y presenta cordilleras masivas, el índice UV aquí es rutinariamente extremo. Los protectores solares químicos tradicionales a menudo están llenos de ingredientes que no deseas que se absorban en tu piel todo el día.',
          why: 'Uso protector solar mineral a base de zinc para mi propia familia. Se asienta sobre la piel para bloquear físicamente el sol abrasador de los Andes, no se escurre en los ojos cuando sudas y es completamente seguro para todos.',
          perf: 'No se escurren hacia los ojos cuando sudas y son completamente seguros para toda la familia.',
          bestUse: 'Aplicación diaria para ruinas a gran altitud, caminatas o cualquier exploración al aire libre en los Andes.',
          icon: Sun,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          link: 'https://amzn.to/44mbF2G'
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
            "image": "https://unlockcusco.com/images/guides/health-hydration-product-1.jpeg",
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
              src="/images/rebecca-w.jpg" 
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
             src="/images/guides/health-hydration-product-1.jpeg" 
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