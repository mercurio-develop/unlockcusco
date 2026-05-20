"use server";

export async function scrapeMachuPicchuTickets(date: string) {
  if (!date) {
    throw new Error('Date is required (YYYY-MM-DD)');
  }

  try {
    const simulateScraping = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        date,
        tickets: [
          { type: 'Machu Picchu (Llaqta)', circuit: 'Circuit 1 or 2', available: Math.floor(Math.random() * 50), price: 'S/ 152.00', time: '06:00 - 07:00' },
          { type: 'Machu Picchu (Llaqta)', circuit: 'Circuit 1 or 2', available: Math.floor(Math.random() * 50), price: 'S/ 152.00', time: '07:00 - 08:00' },
          { type: 'Machu Picchu (Llaqta)', circuit: 'Circuit 1 or 2', available: 0, price: 'S/ 152.00', time: '08:00 - 09:00' },
          { type: 'Machu Picchu (Llaqta) + Huayna Picchu', circuit: 'Circuit 4', available: Math.floor(Math.random() * 10), price: 'S/ 200.00', time: '07:00 - 08:00' },
        ],
        trains: [
          { company: 'PeruRail', type: 'Expedition', route: 'Ollantaytambo -> Aguas Calientes', departure: '05:05', arrival: '06:35', available: true, price: '$65' },
          { company: 'IncaRail', type: 'The Voyager', route: 'Ollantaytambo -> Aguas Calientes', departure: '06:40', arrival: '08:01', available: true, price: '$70' },
          { company: 'PeruRail', type: 'Vistadome', route: 'Ollantaytambo -> Aguas Calientes', departure: '07:05', arrival: '08:27', available: false, price: '$95' },
        ],
        source: "simulated (live scraping blocked by Cloudflare)"
      };
    };

    const data = await simulateScraping();
    return data;
  } catch (error) {
    console.error("Scraping error:", error);
    throw new Error("Failed to scrape availability.");
  }
}
