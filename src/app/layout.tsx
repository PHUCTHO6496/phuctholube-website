import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { SITE, SITE_URL } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale, t] = await Promise.all([
    getSiteSettings(),
    getLocale(),
    getTranslations("meta"),
  ]);

  const title = `${SITE.fullName} - ${t("tagline")}`;
  const description = t("description", {
    foundedYear: SITE.foundedYear,
    name: SITE.name,
  });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: `%s | ${SITE.fullName}`,
      default: title,
    },
    description,
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
      siteName: SITE.fullName,
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
      lang={locale}
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
