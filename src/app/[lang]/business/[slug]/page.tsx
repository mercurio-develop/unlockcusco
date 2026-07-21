import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BusinessDetailView,
  buildBusinessBreadcrumbJsonLd,
  buildBusinessMetadata,
  getBusinessForMetadata,
  getBusinessPageData,
} from "@/features/discovery";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { parseLocale } from "@/paths";

interface BusinessPageProps {
  params: Promise<{ slug: string; lang: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  const business = await getBusinessForMetadata(slug);
  return buildBusinessMetadata(parseLocale(lang), business);
}

export default async function BusinessPage({
  params,
  searchParams,
}: BusinessPageProps) {
  const { slug, lang } = await params;
  const locale = parseLocale(lang);
  const resolvedSearchParams = await searchParams;
  const verifyToken = resolvedSearchParams?.verify as string | undefined;

  const dict = await getDictionary(lang as Locale);
  const pageData = await getBusinessPageData(slug, locale);

  if (!pageData) return notFound();

  const breadcrumbJsonLd = buildBusinessBreadcrumbJsonLd(
    pageData.business,
    locale,
    dict.nav.explore
  );

  return (
    <BusinessDetailView
      business={pageData.business}
      lang={locale}
      dict={dict}
      verifyToken={verifyToken}
      display={pageData.display}
      images={pageData.images}
      theme={pageData.theme}
      jsonLd={pageData.jsonLd}
      breadcrumbJsonLd={breadcrumbJsonLd}
      comparableExperiences={pageData.comparableExperiences}
      nearbyStays={pageData.nearbyStays}
      nearbyDining={pageData.nearbyDining}
    />
  );
}
