export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];

export function parseLocale(value: string | undefined): Locale {
  return value === "es" ? "es" : "en";
}

export type ExploreSearchParams = {
  q?: string;
  id?: string;
  loc?: string;
  cat?: string;
  rad?: number;
  lat?: number;
  lng?: number;
  sort?: string;
  trip?: string;
  filter?: string;
  ai_prompt?: string;
  data?: string;
};

export const langPath = (lang: Locale, path: string) =>
  `/${lang}${path.startsWith("/") ? path : `/${path}`}`;

function appendSearchParams(
  basePath: string,
  params?: ExploreSearchParams
): string {
  if (!params) return basePath;

  const search = new URLSearchParams();
  const entries: [keyof ExploreSearchParams, string | number | undefined][] = [
    ["q", params.q],
    ["id", params.id],
    ["loc", params.loc],
    ["cat", params.cat],
    ["rad", params.rad],
    ["lat", params.lat],
    ["lng", params.lng],
    ["sort", params.sort],
    ["trip", params.trip],
    ["filter", params.filter],
    ["ai_prompt", params.ai_prompt],
    ["data", params.data],
  ];

  for (const [key, value] of entries) {
    if (value === undefined || value === "") continue;
    if (key === "sort" && value === "recommended") continue;
    search.set(key, String(value));
  }

  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export const homePath = (lang: Locale) => langPath(lang, "/");

export const explorePath = (lang: Locale, params?: ExploreSearchParams) =>
  appendSearchParams(langPath(lang, "/explore"), params);

export const exploreLocationPath = (lang: Locale, locationSlug: string) =>
  langPath(lang, `/explore/${locationSlug}`);

export const exploreCategoryPath = (
  lang: Locale,
  locationSlug: string,
  category: string
) => langPath(lang, `/explore/${locationSlug}/${category}`);

export const businessPath = (lang: Locale, slug: string) =>
  langPath(lang, `/business/${slug}`);

export const itineraryPath = (lang: Locale, slug: string) =>
  langPath(lang, `/itinerary/${slug}`);

export const guidesPath = (lang: Locale) => langPath(lang, "/guides");

export const guidePath = (lang: Locale, slug: string) =>
  langPath(lang, `/guides/${slug}`);

export const gearPath = (lang: Locale) => langPath(lang, "/gear");

export const contactPath = (lang: Locale) => langPath(lang, "/contact");

export const verifyPath = (lang: Locale, token?: string) => {
  const base = langPath(lang, "/verify");
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
};

export const sandboxPath = (lang: Locale) =>
  langPath(lang, "/sandbox/dispatch");

/** @deprecated Use businessPath(lang, slug) — agencies/healers are business categories */
export const agencyPath = (lang: Locale, slug: string) =>
  businessPath(lang, slug);

/** @deprecated Use businessPath(lang, slug) — agencies/healers are business categories */
export const therapistPath = (lang: Locale, slug: string) =>
  businessPath(lang, slug);
