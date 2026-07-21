import { DynamicGuideView } from "@/features/guides";
import { parseLocale } from "@/paths";

export default async function DynamicGuidePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  return <DynamicGuideView lang={parseLocale(lang)} slug={slug} />;
}
