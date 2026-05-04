import { buildItinerary } from '../src/lib/ai/tools/build-itinerary';

async function main() {
  try {
    const result = await buildItinerary.execute({
      originLocation: "Urubamba",
      destination: "Ollantaytambo",
      desires: ["hike", "vegan food"],
      constraints: "Train at 4 PM in Ollanta"
    }, {} as any);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("ERROR", err);
  }
}
main();
