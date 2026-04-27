import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});
const prisma = new PrismaClient();

function mapCategory(googleCategory: string): string {
  const lowerCat = googleCategory.toLowerCase();
  if (lowerCat.match(/restaurant|cafe|food|picantería|pizza/)) return "Gastronomía";
  if (lowerCat.match(/spa|massage|yoga|wellness|therapist/)) return "Bienestar";
  if (lowerCat.match(/tour|travel|agency|hiking|atv|rafting/)) return "Aventura";
  if (lowerCat.match(/hotel|hostel|lodge|inn|camping/)) return "Descanso";
  return "Cultura";
}

function cleanWhatsApp(phone: string | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `51${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('51')) {
    return cleaned;
  }
  return null;
}

async function main() {
  const languages = ['es', 'en'];

  for (const lang of languages) {
    const input = {
      searchStringsArray: [
        "Agencias de turismo en Urubamba, Cusco",
        "Travel agencies in Urubamba, Cusco",
        "Restaurantes en Urubamba, Cusco",
        "Restaurants in Urubamba, Cusco",
        "Spas en Pisac, Cusco",
        "Spas in Pisac, Cusco",
        "Hoteles en Ollantaytambo, Cusco",
        "Hotels in Ollantaytambo, Cusco"
      ],
      maxCrawledPlacesPerSearch: 10,
      language: lang,
      maxImages: 1,
      maxReviews: 5
    };

    console.log(`\n🚀 Iniciando extraccion en Apify (Idioma: ${lang})...`);

    const run = await apifyClient.actor("compass/google-maps-extractor").call(input);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    for (const item of items) {
      try {
        const title = item.title as string;
        const categoryName = (item.categoryName as string) || '';
        const location = item.location as { lat: number; lng: number };
        const totalScore = (item.totalScore as number) || null;
        const reviewsCount = (item.reviewsCount as number) || 0;
        const phoneUnformatted = item.phoneUnformatted as string | undefined;
        const imageUrls = item.imageUrls as string[] | undefined;
        const imageUrl = (imageUrls && imageUrls.length > 0) 
          ? imageUrls[0] 
          : 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop';

        const whatsapp = cleanWhatsApp(phoneUnformatted);
        if (!whatsapp) continue;

        const mappedCategory = mapCategory(categoryName);

        const reviewsData = (item.reviews as any[] || [])
          .filter((r) => r.text && r.name && r.stars)
          .map((r) => ({
            text: String(r.text),
            author: String(r.name),
            rating: Number(r.stars)
          }));

        const existingBusiness = await prisma.business.findFirst({
          where: { name: title }
        });

        if (existingBusiness) {
          // Add new reviews if any (simple approach)
          for (const rev of reviewsData) {
            const existingReview = await prisma.review.findFirst({
              where: { businessId: existingBusiness.id, author: rev.author }
            });
            if (!existingReview) {
              await prisma.review.create({
                data: {
                  ...rev,
                  businessId: existingBusiness.id
                }
              });
            }
          }
          console.log(`✅ Reseñas añadidas a negocio existente: ${title} [${lang}]`);
          continue;
        }

        await prisma.business.create({
          data: {
            name: title,
            category: mappedCategory,
            lat: location.lat,
            lng: location.lng,
            rating: totalScore,
            reviewsCount,
            imageUrl,
            whatsapp,
            isClaimed: false,
            ...(reviewsData.length > 0 && {
              reviews: {
                create: reviewsData
              }
            })
          }
        });

        console.log(`✅ Inyectado: ${title} (${mappedCategory}) [${lang}]`);
      } catch (error) {
        console.error(`❌ Error procesando negocio:`, error);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());