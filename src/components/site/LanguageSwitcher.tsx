"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

// Each language is named in itself, so a visitor can find theirs whatever
// language the page is currently in.
const LANGUAGES: Record<string, { short: string; name: string; lang: string }> = {
  vi: { short: "VI", name: "Tiếng Việt", lang: "vi" },
  en: { short: "EN", name: "English", lang: "en" },
  zh: { short: "中文", name: "简体中文", lang: "zh-Hans" },
};

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-900",
          compact ? "p-2 font-semibold" : "px-2 py-2"
        )}
      >
        {!compact && <Globe className="h-4 w-4" />}
        {LANGUAGES[locale]?.short ?? locale.toUpperCase()}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {routing.locales.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                lang={LANGUAGES[l].lang}
                onClick={() => setOpen(false)}
                aria-current={l === locale ? "true" : undefined}
                className={cn(
                  "block px-4 py-2 text-sm hover:bg-slate-50 hover:text-blue-900",
                  l === locale ? "font-semibold text-blue-900" : "text-slate-700"
                )}
              >
                {LANGUAGES[l].name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
