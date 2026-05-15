const CATEGORIES = [
  { label: "Templates", value: "Template", theme: "bg-slate-50 text-slate-700 border-slate-200/50" },
  { label: "Tourist Ticket", value: "Boleto", theme: "bg-sky-50 text-sky-700 border-sky-200/50" },
  { label: "Adventure", value: "Adventure", theme: "bg-emerald-50 text-emerald-700 border-emerald-200/50" },
  { label: "Dining", value: "Dining", theme: "bg-amber-50 text-amber-700 border-amber-200/50" },
];
function getCategoryData(categoryValue) {
  if (!categoryValue) return { label: "Unknown", value: "Unknown", theme: "bg-rose-50 text-rose-600 border-rose-100/50" };
  const cat = CATEGORIES.find(c => c.value.toLowerCase() === categoryValue.toLowerCase());
  return cat || { label: categoryValue, value: categoryValue, theme: "bg-rose-50 text-rose-600 border-rose-100/50" };
}
const catData = getCategoryData("DINING");
console.log(catData.theme.match(/text-\w+-\d+/)?.[0]);
