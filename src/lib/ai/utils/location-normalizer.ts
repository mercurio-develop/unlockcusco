import Fuse from 'fuse.js';

export const SACRED_VALLEY_LOCATIONS = [
  "cusco",
  "urubamba",
  "pisac",
  "ollantaytambo",
  "chinchero",
  "calca",
  "maras",
  "moray",
  "machupicchu"
];

// Initialize Fuse with the list of locations
const locationFuse = new Fuse(SACRED_VALLEY_LOCATIONS, {
  includeScore: true,
  threshold: 0.4, // 0.0 is a perfect match, 1.0 is no match. 0.4 allows for reasonable typos (e.g., "Olyantaytambo" -> "ollantaytambo")
});

/**
 * Takes an unformatted, potentially misspelled location string from the user
 * and returns the closest matching official location slug.
 * 
 * @param input The raw location string (e.g., "Pizac", "Olyantaytambo")
 * @returns The normalized location slug, or null if no confident match is found.
 */
export function normalizeLocation(input: string): string | null {
  if (!input) return null;
  
  const parts = input.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    const results = parts.map(p => {
      const normalized = p.toLowerCase();
      if (SACRED_VALLEY_LOCATIONS.includes(normalized)) return normalized;
      const res = locationFuse.search(normalized);
      return res.length > 0 && res[0].item ? res[0].item : null;
    }).filter(Boolean);
    return results.length > 0 ? results.join(',') : null;
  }
  
  const normalizedInput = input.trim().toLowerCase();
  
  // Exact match fast-path
  if (SACRED_VALLEY_LOCATIONS.includes(normalizedInput)) {
    return normalizedInput;
  }

  // Fuzzy match
  const results = locationFuse.search(normalizedInput);
  
  if (results.length > 0 && results[0].item) {
    return results[0].item;
  }

  return null;
}
