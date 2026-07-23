import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";
import { formatPhoneDisplay } from "@/lib/format";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ với Phúc Thọ để được tư vấn sản phẩm dầu nhớt công nghiệp phù hợp cho doanh nghiệp của bạn.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    settings.address
  )}&output=embed`;

  const hours = [
    { days: "Thứ 2 - Thứ 6", time: settings.hoursMonFri },
    { days: "Thứ 7", time: settings.hoursSat },
    { days: "Chủ nhật", time: settings.hoursSun },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Liên hệ</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Liên hệ với {SITE.name} để được tư vấn sản phẩm dầu nhớt công
          nghiệp phù hợp cho doanh nghiệp của bạn.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gửi liên hệ</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">Thông tin liên hệ</h2>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-amber-500" />
              <span className="text-slate-600">{settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-amber-500" />
              <a href={`tel:${settings.phone}`} className="text-slate-600 hover:text-blue-900">
                {formatPhoneDisplay(settings.phone)}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-amber-500" />
              <a
                href={`mailto:${settings.email}`}
                className="text-slate-600 hover:text-blue-900"
              >
                {settings.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-1 text-slate-600">
                {hours.map((h) => (
                  <div key={h.days} className="flex justify-between gap-6">
                    <span>{h.days}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            </li>
          </ul>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <iframe
              title="Bản đồ Phúc Thọ"
              src={mapSrc}
              width="100%"
              height="280"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
