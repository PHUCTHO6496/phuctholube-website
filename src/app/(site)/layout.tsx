import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingZalo } from "@/components/site/FloatingZalo";
import { JsonLd } from "@/components/site/JsonLd";
import { getSiteSettings } from "@/lib/settings";
import { SITE, SITE_URL } from "@/lib/constants";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: SITE.fullName,
          url: SITE_URL,
          telephone: settings.phone,
          email: settings.email,
          foundingDate: String(SITE.foundedYear),
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressCountry: "VN",
          },
        }}
      />
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <FloatingZalo zaloUrl={settings.zaloUrl} />
    </>
  );
}
