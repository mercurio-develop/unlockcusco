export const CATEGORY_COLORS: Record<string, string> = {
  DINING:     "#FF9500",
  MEAL:       "#FF9500",
  WELLNESS:   "#34C759",
  ADVENTURE:  "#5856D6",
  STAYS:      "#007AFF",
  STAY:       "#007AFF",
  CULTURE:    "#AF52DE",
  SPIRITUAL:  "#00C7BE",
  BOLETO:     "#FF2D55",
  TRANSPORT:  "#5AC8FA",
  AGENCY:     "#FFCC00",
  EXPERIENCE: "#FFCC00",
  TEXTILES:   "#E91E63",
  GUIDE:      "#FF5722",
};

export function getCategoryColor(category: string | undefined | null): string {
  if (!category) return "#8E8E93";
  return CATEGORY_COLORS[category.toUpperCase()] ?? "#8E8E93";
}
