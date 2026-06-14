import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AffiliateProductCard } from "@/features/guides/components/affiliate-product-card";
import { packingListContent } from "@/features/guides/constants/packing-list-content";

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

  const text = isEs ? packingListContent.es : packingListContent.en;
  
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