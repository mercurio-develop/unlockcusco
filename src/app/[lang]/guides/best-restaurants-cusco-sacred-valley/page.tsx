import { Metadata } from "next";
import { Sparkles, Map } from "lucide-react";

export const metadata: Metadata = {
  title: "7 Best Restaurants in Cusco & The Sacred Valley",
  description: "From world-class tasting menus at MIL to hidden local gems in Urubamba, discover where to eat in the Andes.",
};

export default async function GuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEs = lang === 'es';
  
  const content = isEs ? {
    title: "Los 7 Mejores Restaurantes en Cusco y el Valle Sagrado",
    desc: "Perú es reconocido a nivel mundial como una potencia culinaria. Si bien Lima recibe la mayor parte de la atención, los Andes ofrecen increíbles experiencias de la granja a la mesa, menús de degustación de altura y clásicos locales reconfortantes.",
    viewMap: "Ver en Mapa",
    viewMapDesc: "Hemos guardado estos 7 restaurantes en un mapa listo para usar. Haz clic abajo para ver sus ubicaciones exactas y obtener detalles de contacto.",
    openRoute: "Abrir Ruta en UnlockCusco",
    h2_1: "1. MIL Centro (Moray)",
    p1_1: "Creado por Virgilio Martínez (de Central en Lima), MIL se encuentra justo encima de las ruinas de Moray. Es una experiencia inmersiva con un menú de degustación de 8 platos de altura que destaca los ingredientes de diferentes elevaciones andinas.",
    h2_2: "2. Chicha por Gastón Acurio (Cusco)",
    p2_1: "Ubicado cerca de la Plaza de Armas en Cusco, Chicha ofrece cocina regional elevada. Es el lugar perfecto para probar versiones de alta cocina de clásicos locales como el carpaccio de alpaca o el ceviche tradicional.",
    h2_3: "3. El Albergue (Ollantaytambo)",
    p3_1: "Una hermosa experiencia de la granja a la mesa ubicada directamente en la estación de tren de Ollantaytambo. También ofrecen una experiencia tradicional de Pachamanca donde la comida se cocina bajo tierra usando piedras calientes.",
    h2_4: "4. Cervecería del Valle Sagrado (Urubamba)",
    p4_1: "La mejor cerveza artesanal de Perú. Siéntate en su hermoso jardín junto al río Urubamba, bebe IPAs galardonadas y disfruta de excelente comida estilo food-truck.",
    h2_5: "5. Iskay (Pisac)",
    p5_1: "Una joya escondida en Pisac que ofrece impresionantes vistas del valle y espectaculares platos gourmet.",
    h2_6: "6. Tunupa (Urubamba)",
    p6_1: "Perfecto para grupos grandes o familias, ofrece un buffet amplio y de alta calidad justo a orillas del río.",
    h2_7: "7. Limbus Resto Bar (Cusco)",
    p7_1: "Prepárate para una empinada subida hasta el barrio de San Blas, pero serás recompensado con la mejor vista panorámica absoluta de la ciudad de Cusco y cócteles altamente creativos y dignos de Instagram."
  } : {
    title: "7 Best Restaurants in Cusco & The Sacred Valley",
    desc: "Peru is recognized globally as a culinary powerhouse. While Lima gets most of the spotlight, the Andes offer incredible farm-to-table experiences, high-altitude tasting menus, and comforting local classics.",
    viewMap: "View on Map",
    viewMapDesc: "We've saved all 7 of these restaurants into a ready-to-use map. Click below to see their exact locations and get contact details.",
    openRoute: "Open Route in UnlockCusco",
    h2_1: "1. MIL Centro (Moray)",
    p1_1: "Created by Virgilio Martínez (of Central in Lima), MIL sits right above the Moray ruins. It's an immersive, 8-course high-altitude tasting menu that highlights ingredients from different Andean elevations.",
    h2_2: "2. Chicha por Gastón Acurio (Cusco)",
    p2_1: "Located near the Plaza de Armas in Cusco, Chicha offers elevated regional cuisine. It's the perfect place to try high-end versions of local classics like Alpaca carpaccio or traditional Ceviche.",
    h2_3: "3. El Albergue (Ollantaytambo)",
    p3_1: "A beautiful farm-to-table experience located directly at the Ollantaytambo train station. They also offer a traditional Pachamanca experience where food is cooked underground using hot stones.",
    h2_4: "4. Cervecería del Valle Sagrado (Urubamba)",
    p4_1: "The best craft beer in Peru. Sit in their beautiful garden next to the Urubamba river, drink award-winning IPAs, and enjoy excellent food-truck style dining.",
    h2_5: "5. Iskay (Pisac)",
    p5_1: "A hidden gem in Pisac offering stunning views of the valley and spectacular gourmet dishes.",
    h2_6: "6. Tunupa (Urubamba)",
    p6_1: "Perfect for large groups or families, offering an expansive and high-quality buffet right on the river banks.",
    h2_7: "7. Limbus Resto Bar (Cusco)",
    p7_1: "Prepare for a steep climb up to the San Blas neighborhood, but you will be rewarded with the absolute best panoramic view of Cusco city and highly creative, Instagram-worthy cocktails."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isEs ? "Los 7 Mejores Restaurantes en Cusco y el Valle Sagrado" : metadata.title,
            "description": isEs ? content.desc : metadata.description,
            "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop",
            "author": { "@type": "Organization", "name": "UnlockCusco" },
            "publisher": {
              "@type": "Organization",
              "name": "UnlockCusco",
              "logo": { "@type": "ImageObject", "url": "https://unlockcusco.com/icon.svg" }
            },
            "datePublished": "2026-05-15",
          })
        }}
      />
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
          {content.title}
        </h1>
        
        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          {content.desc}
        </p>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-center shadow-sm">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Map className="w-5 h-5 text-rose-600" /> {content.viewMap}
            </h3>
            <p className="text-sm text-slate-700 mb-4">
              {content.viewMapDesc}
            </p>
            <a 
              href={`/${lang}/explore?trip=top-7-culinary-route`}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
            >
              {content.openRoute} <Sparkles className="w-4 h-4 text-rose-400" />
            </a>
          </div>
        </div>

        <div className="prose prose-slate prose-lg max-w-none">
          <h2>{content.h2_1}</h2>
          <p>{content.p1_1}</p>

          <h2>{content.h2_2}</h2>
          <p>{content.p2_1}</p>

          <h2>{content.h2_3}</h2>
          <p>{content.p3_1}</p>

          <h2>{content.h2_4}</h2>
          <p>{content.p4_1}</p>
          
          <h2>{content.h2_5}</h2>
          <p>{content.p5_1}</p>

          <h2>{content.h2_6}</h2>
          <p>{content.p6_1}</p>

          <h2>{content.h2_7}</h2>
          <p>{content.p7_1}</p>
        </div>

      </div>
    </>
  );
}