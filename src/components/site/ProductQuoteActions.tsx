"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AddToQuoteButton, type QuoteProduct } from "@/components/site/AddToQuoteButton";
import { cn } from "@/lib/utils";

/**
 * Packaging picker + "add to quote" for the product page. One page per
 * grade now covers every packaging (xô 20L, phuy 209L...), so the visitor
 * says which one they want here — or later on the quote page.
 */
export function ProductQuoteActions({
  product,
  packagings,
  children,
}: {
  product: QuoteProduct;
  packagings: string[];
  /** Extra actions rendered next to the button (call, view cart). */
  children?: React.ReactNode;
}) {
  const t = useTranslations("productDetail");
  const [selected, setSelected] = useState<string | undefined>(
    packagings.length === 1 ? packagings[0] : undefined
  );

  return (
    <div className="mt-6">
      {packagings.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-slate-700">{t("packaging")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {packagings.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={selected === p}
                onClick={() => setSelected(selected === p ? undefined : p)}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-semibold transition-colors",
                  selected === p
                    ? "border-blue-900 bg-blue-900 text-white"
                    : "border-slate-300 text-slate-700 hover:border-blue-900 hover:text-blue-900"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          {packagings.length > 1 && !selected && (
            <p className="mt-2 text-xs text-slate-500">{t("packagingHint")}</p>
          )}
        </fieldset>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <AddToQuoteButton
          product={product}
          packaging={selected}
          packagings={packagings}
          variant="filled"
        />
        {children}
      </div>
    </div>
  );
}
