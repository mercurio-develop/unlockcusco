/**
 * Static mapping of location slugs to pre-generated Travelpayouts Klook affiliate links.
 * These links point to the Klook hotels/stays page or search page for each location.
 */
export const KLOOK_DESTINATION_HOTELS: Record<string, string> = {
  "machu-picchu": "https://klook.tpx.lv/jwLVhKyD",
  "cusco": "https://klook.tpx.lv/3W4Wm5u6",
  "urubamba": "https://klook.tpx.lv/PjPQVBYS",
  "pisac": "https://klook.tpx.lv/AlfZuZyO",
  "maras": "https://klook.tpx.lv/JqrqCUWe",
  "ollantaytambo": "https://klook.tpx.lv/0QOoJxFG",
  "chinchero": "https://klook.tpx.lv/jZSsKYwc",
  "calca": "https://klook.tpx.lv/AA6I31FI",
  "yucay": "https://klook.tpx.lv/4nyzY8SF"
};

/**
 * Returns the pre-generated Klook affiliate link for a given location slug, or null.
 */
export function getKlookDestinationHotelLink(locationSlug: string | null | undefined): string | null {
  if (!locationSlug) return null;
  const normalized = locationSlug.toLowerCase().trim();
  return KLOOK_DESTINATION_HOTELS[normalized] || null;
}
