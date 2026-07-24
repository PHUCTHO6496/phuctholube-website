"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useQuoteCart } from "@/lib/store/quote-cart";

export function QuoteCartIndicator() {
  const [mounted, setMounted] = useState(false);
  const count = useQuoteCart((s) => s.items.length);
  const t = useTranslations("nav");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/bao-gia"
      className="relative flex items-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
      aria-label={t("quoteCart")}
    >
      <ShoppingCart className="h-5 w-5" />
      {mounted && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
