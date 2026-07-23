import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { formatPhoneDisplay } from "@/lib/format";
import { FacebookIcon, LinkedinIcon } from "@/components/site/SocialIcons";
import type { SiteSettingsData } from "@/lib/settings";

export function Footer({ settings }: { settings: SiteSettingsData }) {
  const hours = [
    { days: "Thứ 2 - Thứ 6", time: settings.hoursMonFri },
    { days: "Thứ 7", time: settings.hoursSat },
    { days: "Chủ nhật", time: settings.hoursSun },
  ];

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={SITE.fullName}
                  className="h-10 w-10 rounded-md object-contain"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500 text-lg font-bold text-white">
                  PT
                </span>
              )}
              <span className="text-base font-bold text-white">
                {SITE.fullName}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Từ năm {SITE.foundedYear}, {SITE.name} tự hào là nhà phân phối
              dầu nhớt công nghiệp uy tín hàng đầu tại Hồ Chí Minh.
            </p>
            {(settings.facebookUrl || settings.linkedinUrl) && (
              <div className="mt-5 flex items-center gap-3">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-amber-500"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-amber-500"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Liên kết nhanh
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 transition-colors hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Liên hệ
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-amber-400" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="h-5 w-5 shrink-0 text-amber-400" />
                <a href={`tel:${settings.phone}`} className="hover:text-amber-400">
                  {formatPhoneDisplay(settings.phone)}
                </a>
              </li>
              <li className="flex gap-2">
                <Mail className="h-5 w-5 shrink-0 text-amber-400" />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-amber-400 break-all"
                >
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Giờ làm việc
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {hours.map((h) => (
                <li key={h.days} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    {h.days}
                  </span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {SITE.fullName}. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}
