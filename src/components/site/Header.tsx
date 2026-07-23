"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatPhoneDisplay } from "@/lib/format";
import { QuoteCartIndicator } from "@/components/site/QuoteCartIndicator";
import type { SiteSettingsData } from "@/lib/settings";

export function Header({ settings }: { settings: SiteSettingsData }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const phoneDisplay = formatPhoneDisplay(settings.phone);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-900 text-lg font-bold text-white">
            PT
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold text-blue-900">
              {SITE.fullName}
            </span>
            <span className="block text-xs text-slate-500">
              Từ {SITE.foundedYear}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto lg:flex xl:gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium transition-colors xl:px-3",
                  active
                    ? "bg-blue-50 text-blue-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-900"
                )}
              >
                {item.navLabel}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <QuoteCartIndicator />
          <a
            href={`tel:${settings.phone}`}
            className="flex items-center gap-2 whitespace-nowrap rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            <Phone className="h-4 w-4" />
            {phoneDisplay}
          </a>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <QuoteCartIndicator />
          <button
            type="button"
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-slate-200 bg-white px-4 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-900"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${settings.phone}`}
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Phone className="h-4 w-4" />
            Gọi ngay: {phoneDisplay}
          </a>
        </nav>
      )}
    </header>
  );
}
