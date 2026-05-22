export const homePath = () => "/";

export const explorePath = (query?: string) => 
  query ? `/explore?q=${encodeURIComponent(query)}` : "/explore";

export const exploreCategoryPath = (locationSlug: string, category: string) => 
  `/explore/${locationSlug}/${category}`;

export const businessPath = (businessId: string) => 
  `/business/${businessId}`;

export const dashboardPath = () => "/dashboard";

export const agencyPath = (slug: string) => `/services/agencies/${slug}`;

export const therapistPath = (slug: string) => `/services/healers/${slug}`;
