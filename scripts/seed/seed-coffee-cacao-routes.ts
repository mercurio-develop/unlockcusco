import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AGENCY_SLUG = 'unlock-cusco-experiences';

async function main() {
  console.log('Seeding Coffee & Cacao Routes...');

  // 1. Ensure the Host Agency exists
  let agency = await prisma.business.findUnique({ where: { slug: AGENCY_SLUG } });
  if (!agency) {
    agency = await prisma.business.create({
      data: {
        name: 'Unlock Cusco Experiences',
        slug: AGENCY_SLUG,
        category: 'AGENCY',
        description: 'Exclusive, AI-powered immersive experiences crafted by Unlock Cusco.',
        isClaimed: true,
      }
    });
    console.log('+ Created Unlock Cusco Experiences Agency');
  } else {
    console.log('* Found existing Unlock Cusco Experiences Agency');
  }

  // 2. Define the Packages
  const packages = [
    {
      title: 'The Coffee Route (Half-Day Morning)',
      description: 'A morning journey into the Sacred Valley exploring the bean-to-cup process, featuring on-site roasting and high-altitude cupping tailored by AI.',
      durationDays: 1, // Using 1 to represent a day-trip portion
      basePriceUsd: 85.00,
      difficulty: 'Easy',
      pace: 'Relaxed',
      highlights: JSON.stringify([
        "On-site roasting demonstration at Pisonay Coffee Roasters",
        "AI-tailored cupping and tasting session",
        "Audio-guided storytelling of Peruvian agriculture",
        "Visit to specialty cafe Arbol de la Vida"
      ]),
      included: JSON.stringify([
        "Private transport",
        "Expert guide",
        "Coffee cupping session",
        "Morning snacks",
        "Pre-tour AI flavor profiling"
      ]),
      itinerary: JSON.stringify([
        { time: "08:30 AM", title: "Depart Cusco", description: "Private transport from your hotel with AI Concierge audio briefing." },
        { time: "09:30 AM", title: "Pisonay Coffee Roasters", description: "Roasting demonstration and guided cupping session." },
        { time: "11:30 AM", title: "Arbol de la Vida", description: "Signature brew and light morning snack in Huayoccari." },
        { time: "12:30 PM", title: "Return", description: "Drop-off or transition to lunch." }
      ])
    },
    {
      title: 'The Cacao Route (Half-Day Afternoon)',
      description: 'An immersive afternoon in Cusco City exploring artisan chocolate making, the history of native Cacao Chuncho, and premium pairings.',
      durationDays: 1,
      basePriceUsd: 75.00,
      difficulty: 'Easy',
      pace: 'Relaxed',
      highlights: JSON.stringify([
        "Hands-on chocolate tempering and molding workshop",
        "Pairing session with local spirits or fruits",
        "Digital Tasting Passport powered by AI"
      ]),
      included: JSON.stringify([
        "Expert guide",
        "Chocolate workshop materials",
        "Pairing tastings",
        "Post-tour digital passport"
      ]),
      itinerary: JSON.stringify([
        { time: "02:00 PM", title: "Meet Guide in Cusco", description: "Briefing on Cacao Chuncho via AI Concierge." },
        { time: "02:30 PM", title: "Artisan Chocolate Workshop", description: "Learn tempering and mold your own chocolate." },
        { time: "04:30 PM", title: "Pairing Session", description: "Curated tasting of chocolate with local spirits." },
        { time: "05:30 PM", title: "Tour Concludes", description: "Receive your AI-generated Tasting Passport." }
      ])
    },
    {
      title: 'The Master Taster: Coffee & Cacao (Full-Day)',
      description: 'The ultimate immersion combining the Sacred Valley coffee experience in the morning with the Cusco City chocolate experience in the afternoon.',
      durationDays: 1,
      basePriceUsd: 145.00,
      difficulty: 'Easy',
      pace: 'Relaxed',
      highlights: JSON.stringify([
        "Complete bean-to-bar and bean-to-cup journey",
        "On-site coffee roasting in the Sacred Valley",
        "Hands-on chocolate workshop in Cusco City",
        "AI-managed lunch recommendations",
        "Final 'Master Taster' unified profile"
      ]),
      included: JSON.stringify([
        "Private transport (morning)",
        "Expert guide",
        "All workshop and tasting fees",
        "AI Concierge continuous management"
      ]),
      itinerary: JSON.stringify([
        { time: "08:30 AM", title: "The Coffee Route", description: "Depart for the Sacred Valley for roasting and cupping." },
        { time: "12:30 PM", title: "Lunch Transition", description: "AI Concierge dynamically recommends a lunch spot between the valley and city." },
        { time: "02:30 PM", title: "The Cacao Route", description: "Hands-on artisan chocolate workshop and pairings in Cusco City." },
        { time: "05:30 PM", title: "Tour Concludes", description: "Drop-off and receipt of the Master Taster profile." }
      ])
    }
  ];

  for (const pkg of packages) {
    const existing = await prisma.tourPackage.findFirst({
      where: { businessId: agency.id, title: pkg.title }
    });

    if (!existing) {
      await prisma.tourPackage.create({
        data: {
          ...pkg,
          businessId: agency.id
        }
      });
      console.log(`+ Added Package: ${pkg.title}`);
    } else {
      await prisma.tourPackage.update({
        where: { id: existing.id },
        data: pkg
      });
      console.log(`* Updated Package: ${pkg.title}`);
    }
  }

  console.log('✅ Finished seeding Coffee & Cacao routes.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
