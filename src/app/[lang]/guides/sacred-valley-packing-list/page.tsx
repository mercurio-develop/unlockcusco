import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AffiliateProductCard } from "@/features/guides";
import { packingListContent } from "@/features/guides/constants/packing-list-content";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === 'es' ? "Lista de Empaque para Cusco | Guías UnlockCusco" : "Cusco Packing List | UnlockCusco Guides",
    description: lang === 'es' ? "Aprende exactamente cómo empacar para sobrevivir al sol intenso, la lluvia y el frío en Cusco sin parecer un guía de safari." : "Learn exactly how to pack for Cusco's intense sun, rain, and cold without looking like a safari guide.",
  };
}

function renderMarkdownText(text: string) {
  // Regex to match markdown links: [text](url) and bold text: **text**
  const combinedRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const splitParts = text.split(combinedRegex);
  
  return splitParts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={idx}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 underline font-semibold"
          >
            {match[1]}
          </a>
        );
      }
    }
    // Handle italic markup inside the part
    if (part.includes('*')) {
      const italicRegex = /\*([^*]+)\*/g;
      const subParts = part.split(italicRegex);
      return subParts.map((subPart, subIdx) => {
        if (subIdx % 2 === 1) {
          return <em key={subIdx} className="italic">{subPart}</em>;
        }
        return subPart;
      });
    }
    return part;
  });
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
            "description": text.intro[0].substring(0, 150) + "...",
            "image": "https://unlockcusco.com/images/guides/packing-cover.jpeg",
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
             src="/images/guides/packing-cover.jpeg" 
             alt="Cusco Packing Guide Cover" 
             fill 
             className="object-cover"
             priority
           />
        </div>

        <div className="prose prose-slate prose-lg max-w-none">
          {text.intro.map((para, idx) => (
            <p key={idx} className="text-slate-600 mb-6 leading-relaxed">
              {para}
            </p>
          ))}

          {text.sections.map((section, idx) => (
            <div key={idx} className="mt-12">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{section.title}</h2>
              {section.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="text-slate-600 mb-4 leading-relaxed">
                  {para}
                </p>
              ))}
              {section.fixes && section.fixes.length > 0 && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">{section.fixTitle}</h3>
                  <ul className="space-y-2 list-disc list-inside text-slate-600">
                    {section.fixes.map((fix, fIdx) => (
                      <li key={fIdx} className="leading-relaxed">
                        {renderMarkdownText(fix)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <p className="text-xl text-slate-900 font-serif font-bold italic mt-12 mb-12">
            {text.outro}
          </p>

          <div className="space-y-8 mt-16">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 border-b pb-4">
              {isEs ? 'Resumen de Artículos Recomendados' : 'Recommended Gear Summary'}
            </h2>
            {text.products.map((product, i) => (
              <AffiliateProductCard key={i} product={{ ...product, image: undefined }} labels={labels} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}