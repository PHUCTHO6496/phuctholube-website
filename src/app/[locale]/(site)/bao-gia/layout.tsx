import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("quoteCartPage");
  return { title: t("title"), robots: { index: false, follow: true } };
}

export default function QuoteCartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
