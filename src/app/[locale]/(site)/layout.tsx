import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingZalo } from "@/components/site/FloatingZalo";
import { LeadGuidePopup } from "@/components/site/LeadGuidePopup";
import { JsonLd } from "@/components/site/JsonLd";
import { getSiteSettings } from "@/lib/settings";
import { getLocale } from "next-intl/server";
import { SITE, SITE_URL, siteNames } from "@/lib/constants";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, locale] = await Promise.all([getSiteSettings(), getLocale()]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: siteNames(locale).fullName,
          legalName: SITE.legalName,
          taxID: SITE.taxCode,
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
      {/* Only offered once a handbook PDF has been uploaded in admin settings. */}
      {settings.leadGuidePdfUrl && <LeadGuidePopup />}
    </>
  );
}
