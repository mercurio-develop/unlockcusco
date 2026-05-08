import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  pisac: { lat: -13.422, lng: -71.848 },
  urubamba: { lat: -13.304, lng: -72.115 },
  calca: { lat: -13.332, lng: -71.954 },
  cusco: { lat: -13.522, lng: -71.967 },
  huaran: { lat: -13.315, lng: -72.036 },
  arin: { lat: -13.317, lng: -72.052 },
  yucay: { lat: -13.319, lng: -72.088 },
  huayoccari: { lat: -13.328, lng: -72.062 }
};

const businesses = [
  { name: "ALTAR", category: "DINING", location: "Pisac", desc: "A restaurant specializing in authentic Middle Eastern cuisine, including hummus, kababs, and falafels. It also serves an all-day breakfast.", contact: "Pisac plaza, under La Ruta." },
  { name: "Kiri Bar at Tambo del Inka", category: "DINING", location: "Urubamba", desc: "A bar within a luxury hotel that features a terrace serving cocktails and light lunches such as salads, sushi, and burgers.", contact: "Central Urubamba, on the pista" },
  { name: "El Cafe Feliz", category: "DINING", location: "Pisac", desc: "A cafe in Pisac that serves Indian food like paneer and curry. They also offer all-day breakfast, veggie burgers, and a wide variety of drinks.", contact: "Centre of Pisac. Call: 946 662 938" },
  { name: "AMA", category: "DINING", location: "Urubamba", desc: "A family-friendly restaurant with a large playground, serving a healthy menu that includes falafel wraps, salads, and grilled trout. The restaurant supports a related NGO.", contact: "Av. Mariscal Castilla 563, Urubamba" },
  { name: "ALTO", category: "DINING", location: "Arin", desc: "A restaurant in Arin with a garden and playground, known for fresh doughnuts and creative Asian-inspired dishes like boa buns and pad Thai.", contact: "2nd Paradero, Arin (on the pista)" },
  { name: "Aiki", category: "DINING", location: "Yucay", desc: "A small restaurant offering 'cocina Japoandina', a fusion of Japanese and Peruvian cuisine using organic, locally sourced ingredients.", contact: "In front of the church in Yucay, right on the pista." },
  { name: "Monkey Coffee", category: "DINING", location: "Urubamba", desc: "A coffee shop that has expanded its menu to include food items like soups, falafels, and baba ganoush.", contact: "610 Huascar, just below the market in Urubamba." },
  { name: "Migas del Valley", category: "DINING", location: "Urubamba", desc: "A bakery and full restaurant offering sourdough bread, pastries, coffees, sandwiches, and pizzas. They also feature a menu of the day.", contact: "559 Calle Bolivar, near the plaza, Urubamba" },
  { name: "Viva Peru", category: "DINING", location: "Huaran", desc: "A friendly cafe known for its community atmosphere and homemade ice creams, including vegan options. They serve daily specials and are licensed to serve alcohol.", contact: "Paradero verde, Huaran, just off the pista." },
  { name: "Pakakuna", category: "DINING", location: "Urubamba", desc: "A family-friendly fusion restaurant with Peruvian roots, serving dishes like trout, gnocchi, and quinoa-based plates.", contact: "Bolivar, Urubamba, just above the church." },
  { name: "Sol Seed", category: "DINING", location: "Pisac", desc: "A community hub that offers workshops and serves healthy, fresh food with gluten-free and vegan options like burritos and tacos.", contact: "Calle Pardo 360, Pisac" },
  { name: "Apu Organic Nativo", category: "DINING", location: "Pisac", desc: "A vegan cafe near the main market offering soups, smoothies, salads, and vegan versions of Peruvian dishes like ceviche.", contact: "Calle Grau 534, Pisac, a una cuadra de la Plaza Principal., Pisac" },
  { name: "Jorge Zevallos", category: "MEDICAL", location: "Cusco", desc: "Best for fancy dental work, including veneers, crowns, root canals, aesthetic work and implants.", contact: "984 652 044" },
  { name: "Consoltoria Saya (Sra. JanMeli)", category: "MEDICAL", location: "Pisac", desc: "Best for basics, like cleaning, fillings, and extractions.", contact: "Phone: 984264707, Address: Calle Callao numero 292, near the Banco Financa Confianca" },
  { name: "Tula Oros", category: "MEDICAL", location: "Cusco", desc: "Best for braces, orthodontics, fillings, and dental surgery.", contact: "982 349 861" },
  { name: "Dr Hipolito", category: "MEDICAL", location: "Pisac", desc: "A holistic, natural dentist who speaks good English.", contact: "Phone: 995.551.668, Email: beholito@gmail.com, Directions: Go up the market road leading up to the 'ruins'." },
  { name: "Del Campo", category: "DINING", location: "Calca", desc: "A cafe that also functions as a zero-waste concept store. It offers a menu of coffees, meals, and desserts, while the store sells bulk foods and non-toxic products.", contact: "Calca, on the pista, just outside of town." },
  { name: "Sonesta Hotel Cafe", category: "DINING", location: "Yucay", desc: "A rustic cafe located in the Sonesta Hotel's garden, serving specialty coffees, teas, and lunch items like burgers and sandwiches. There is also a homemade ice-cream parlor nearby.", contact: "Plaza Manco II 123, Yucay" },
  { name: "Pisonay Coffee Roasters", category: "DINING", location: "Calca", desc: "A cafe that roasts its own coffee on-site and offers various brews, desserts, and light dishes. The property features large gardens and a quiet, shared workspace.", contact: "Calle Simon Bolivar 1020, Calca, Peru" },
  { name: "Arbol de la Vida", category: "DINING", location: "Huayoccari", desc: "A cafe, also referred to as The Raw Cafe, that serves sumptuous coffee, matcha lattes, frappes, and raw, organic desserts.", contact: "In Huayoccari, on the route to Inkaterra." },
  { name: "Ursula Boza", category: "MEDICAL", location: "Urubamba", desc: "A well-reputed veterinarian based in Urubamba. The article notes that most listed vets, including this one, will make house calls.", contact: "+51 997 538 060" },
  { name: "Anggela Harms", category: "MEDICAL", location: "Urubamba", desc: "A well-reputed veterinarian based in Urubamba. The article notes that most listed vets, including this one, will make house calls.", contact: "+51 936 822 056" },
  { name: "Patitas Blue", category: "MEDICAL", location: "Urubamba", desc: "A well-reputed veterinary clinic in Urubamba. The article notes that most listed vets will make house calls.", contact: "Av. Mariscal Castilla 474, Urubamba. Phone: +51 930 194776" },
  { name: "Goofy Vet", category: "MEDICAL", location: "Calca", desc: "A well-reputed veterinary clinic based in Calca. The article notes that most listed vets will make house calls.", contact: "+51 982 074 210" },
  { name: "24 Hour Emergency Vet", category: "MEDICAL", location: "Cusco", desc: "A 24-hour emergency veterinarian service available in Cusco.", contact: "+51 984 765 805" }
];

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🌱 Seeding Sacred Valley Expats businesses...');

  let added = 0;
  for (const b of businesses) {
    const slug = generateSlug(b.name);
    const locationSlug = b.location.toLowerCase();
    const coords = TOWN_COORDS[locationSlug] || { lat: null, lng: null };
    
    // Check if it exists
    const existing = await prisma.business.findUnique({
      where: { slug }
    });

    if (existing) {
      console.log(`   ⏭️ Skipped (already exists): ${b.name}`);
      continue;
    }

    // Add some random scatter to the coordinates so pins don't overlap completely
    const lat = coords.lat ? coords.lat + (Math.random() - 0.5) * 0.005 : null;
    const lng = coords.lng ? coords.lng + (Math.random() - 0.5) * 0.005 : null;

    await prisma.business.create({
      data: {
        name: b.name,
        slug,
        category: b.category,
        locationSlug,
        description: b.desc,
        tagline: b.desc.substring(0, 80) + '...',
        contactEmail: b.contact.includes('@') ? b.contact.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)?.[0] || "" : "",
        whatsapp: b.contact.match(/\+?\d[\d\s]{8,}/)?.[0] || null,
        lat,
        lng,
        isClaimed: false,
        isAsociado: false,
        imageUrl: "/agencies/default-hero.jpg" // placeholder
      }
    });
    
    console.log(`   ✅ Added: ${b.name} (${b.location})`);
    added++;
  }

  console.log(`\n🎉 Seeded ${added} new businesses from expats blog!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
