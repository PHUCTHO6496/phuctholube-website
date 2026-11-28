import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { SITE, SITE_URL, siteNames } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const OG_LOCALE: Record<string, string> = { vi: "vi_VN", en: "en_US", zh: "zh_CN" };
// BCP 47 tag for <html lang>: "zh-Hans" picks Simplified Chinese glyphs and fonts.
const HTML_LANG: Record<string, string> = { zh: "zh-Hans" };

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale, t] = await Promise.all([
    getSiteSettings(),
    getLocale(),
    getTranslations("meta"),
  ]);

  const brand = siteNames(locale);
  const title = `${brand.fullName} - ${t("tagline")}`;
  const description = t("description", {
    foundedYear: SITE.foundedYear,
    name: brand.name,
  });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: `%s | ${brand.fullName}`,
      default: title,
    },
    description,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale] ?? "vi_VN",
      siteName: brand.fullName,
      title,
      description,
    },
    ...(settings.logoUrl ? { icons: { icon: settings.logoUrl } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={HTML_LANG[locale] ?? locale}
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
