import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SITE, SITE_URL } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const DESCRIPTION = `Từ năm ${SITE.foundedYear}, ${SITE.name} là nhà phân phối dầu nhớt công nghiệp uy tín hàng đầu tại Hồ Chí Minh, đồng hành cùng doanh nghiệp trong lĩnh vực dầu khí, cảng biển và hàng hải.`;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: `%s | ${SITE.fullName}`,
      default: `${SITE.fullName} - ${SITE.tagline}`,
    },
    description: DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: SITE.fullName,
      title: `${SITE.fullName} - ${SITE.tagline}`,
      description: DESCRIPTION,
    },
    ...(settings.logoUrl ? { icons: { icon: settings.logoUrl } } : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
