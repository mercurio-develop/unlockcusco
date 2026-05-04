import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mockToken = "tx_complex_" + Math.random().toString(36).substring(2, 8);

  await prisma.trip.create({
    data: {
      tripTitle: "The Grand Andean Odyssey",
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2026-06-05T00:00:00.000Z"),
      paxCount: 2,
      baseCampStrategy: "CUSTOM",
      shareToken: mockToken,
      status: "PROPOSED",
      travelers: {
        create: [
          {
            isLeadGuest: true,
            firstName: "Alex",
            lastName: "Rivera",
            passportNumber: "P8923471",
            nationality: "Canadian",
            dateOfBirth: new Date("1985-05-15T00:00:00.000Z"),
            whatsappNumber: "+1 555 999 8888",
            dietaryRestrictions: "Strict Vegan",
            medicalNotes: "Mild asthma, requires frequent breaks at high altitude"
          },
          {
            isLeadGuest: false,
            firstName: "Sam",
            lastName: "Rivera",
            passportNumber: "P8923472",
            nationality: "Canadian",
            dateOfBirth: new Date("1988-08-22T00:00:00.000Z")
          }
        ]
      },
      days: {
        create: [
          {
            dayNumber: 1,
            date: new Date("2026-06-01T00:00:00.000Z"),
            sleepTown: "Pisac",
            dayTheme: "Arrival & Acclimatization",
            guideNotes: "Take it very easy today. Drink coca tea upon arrival.",
            startTime: "10:00",
            meetingPoint: "Cusco Airport",
            eventsJson: JSON.stringify([
              {
                id: "e1-1",
                type: "TRANSPORT",
                startTime: "10:30",
                method: "Private SUV",
                from: "Cusco Airport",
                to: "Awanacancha",
                fromLat: -13.5350, fromLng: -71.9389,
                toLat: -13.4475, toLng: -71.8778,
                details: "Driver waiting with name sign."
              },
              {
                id: "e1-2",
                type: "EXPERIENCE",
                startTime: "11:30",
                title: "Awanacancha Llama Farm",
                location: "Awanacancha",
                locationLat: -13.4475, locationLng: -71.8778,
                imageUrl: "https://images.unsplash.com/photo-1583204780513-d023920fb669?auto=format&fit=crop&w=800&q=80",
                description: "A living museum of the Andes. You will see alpacas, llamas, and vicuñas up close, and learn about the traditional weaving techniques from local artisans."
              },
              {
                id: "e1-3",
                type: "TRANSPORT",
                startTime: "13:00",
                method: "Private SUV",
                from: "Awanacancha",
                to: "Pisac",
                fromLat: -13.4475, fromLng: -71.8778,
                toLat: -13.4217, toLng: -71.8483
              },
              {
                id: "e1-4",
                type: "MEAL",
                startTime: "13:30",
                name: "Vegan Lunch at Cuchara de Palo",
                location: "Pisac",
                locationLat: -13.4217, locationLng: -71.8483,
                notes: "Confirmed vegan menu with chef. The quinoa soup is highly recommended.",
                imageUrl: "https://images.unsplash.com/photo-1542314831-c6a4d14d83f1?auto=format&fit=crop&w=800&q=80",
                description: "Located in the heart of Pisac, offering traditional Andean ingredients with a modern, healthy twist."
              },
              {
                id: "e1-5",
                type: "NOTE",
                startTime: "15:00",
                content: "Check-in to hotel and rest for the afternoon."
              },
              {
                id: "e1-6",
                type: "ACCOMMODATION",
                startTime: "15:30",
                name: "Pisac Inn",
                location: "Pisac Plaza",
                locationLat: -13.4217, locationLng: -71.8483,
                imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80",
                description: "A charming boutique hotel right on the main plaza. Features a lovely courtyard and cozy rooms to help you acclimate in peace."
              }
            ])
          },
          {
            dayNumber: 2,
            date: new Date("2026-06-02T00:00:00.000Z"),
            sleepTown: "Ollantaytambo",
            dayTheme: "The Valley of the Incas",
            guideNotes: "Active day. Wear comfortable hiking shoes.",
            startTime: "08:00",
            meetingPoint: "Hotel Lobby (Pisac)",
            eventsJson: JSON.stringify([
              {
                id: "e2-1",
                type: "TRANSPORT",
                startTime: "08:30",
                method: "Car",
                from: "Pisac",
                to: "Maras",
                fromLat: -13.4217, fromLng: -71.8483,
                toLat: -13.3333, toLng: -72.1500
              },
              {
                id: "e2-2",
                type: "EXPERIENCE",
                startTime: "10:00",
                title: "Maras Salt Mines Tour",
                location: "Maras",
                locationLat: -13.3333, locationLng: -72.1500,
                imageUrl: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=800&q=80",
                description: "Thousands of salt pans terraced into the hillside, actively harvested by local families just as they were in pre-Inca times."
              },
              {
                id: "e2-3",
                type: "TRANSPORT",
                startTime: "12:00",
                method: "ATV",
                from: "Maras",
                to: "Moray",
                fromLat: -13.3333, fromLng: -72.1500,
                toLat: -13.3297, toLng: -72.1969,
                details: "Guided ATV ride across the plateau."
              },
              {
                id: "e2-4",
                type: "EXPERIENCE",
                startTime: "13:00",
                title: "Moray Agricultural Terraces",
                location: "Moray",
                locationLat: -13.3297, locationLng: -72.1969,
                imageUrl: "https://images.unsplash.com/photo-1600577916048-804c9191e36c?auto=format&fit=crop&w=800&q=80",
                description: "An incredible feat of Incan engineering. The circular terraces create microclimates that were likely used as an agricultural laboratory."
              },
              {
                id: "e2-5",
                type: "MEAL",
                startTime: "14:30",
                name: "Late Lunch at MIL",
                location: "Moray",
                locationLat: -13.3297, locationLng: -72.1969,
                notes: "World-renowned dining experience. Reservation confirmed."
              },
              {
                id: "e2-6",
                type: "TRANSPORT",
                startTime: "16:30",
                method: "Car",
                from: "Moray",
                to: "Ollantaytambo",
                fromLat: -13.3297, fromLng: -72.1969,
                toLat: -13.2583, toLng: -72.2633
              }
            ])
          },
          {
            dayNumber: 3,
            date: new Date("2026-06-03T00:00:00.000Z"),
            sleepTown: "Machu Picchu",
            dayTheme: "The Citadel",
            guideNotes: "Bring passports! Train leaves strictly on time.",
            startTime: "06:00",
            meetingPoint: "Ollantaytambo Train Station",
            eventsJson: JSON.stringify([
              {
                id: "e3-1",
                type: "TRANSPORT",
                startTime: "06:10",
                method: "Train",
                from: "Ollantaytambo",
                to: "Aguas Calientes",
                fromLat: -13.2583, fromLng: -72.2633,
                toLat: -13.1547, toLng: -72.5250,
                details: "Vistadome Observatory Train"
              },
              {
                id: "e3-2",
                type: "TRANSPORT",
                startTime: "08:00",
                method: "Bus",
                from: "Aguas Calientes",
                to: "Machu Picchu Entrance",
                fromLat: -13.1547, fromLng: -72.5250,
                toLat: -13.1631, toLng: -72.5450
              },
              {
                id: "e3-3",
                type: "EXPERIENCE",
                startTime: "08:30",
                title: "Machu Picchu Guided Tour",
                location: "Machu Picchu",
                locationLat: -13.1631, locationLng: -72.5450
              },
              {
                id: "e3-4",
                type: "NOTE",
                startTime: "12:30",
                content: "Take the bus back down to Aguas Calientes when ready."
              },
              {
                id: "e3-5",
                type: "MEAL",
                startTime: "13:30",
                name: "Lunch at Indio Feliz",
                location: "Aguas Calientes",
                locationLat: -13.1547, locationLng: -72.5250,
                notes: "Casual dining, vegan options available."
              }
            ])
          }
        ]
      }
    }
  });

  console.log("Trip created! Share token: " + mockToken);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
