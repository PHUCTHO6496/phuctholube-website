"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2, ShoppingCart } from "lucide-react";
import { useQuoteCart } from "@/lib/store/quote-cart";
import { submitQuoteRequest } from "@/lib/actions/quotes";

export default function QuoteCartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clear } = useQuoteCart();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const t = useTranslations("quoteCartPage");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    if (items.length === 0) {
      setFormError(t("emptyCartError"));
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await submitQuoteRequest({
        companyName: String(formData.get("companyName") ?? ""),
        contactName: String(formData.get("contactName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        address: String(formData.get("address") ?? ""),
        note: String(formData.get("note") ?? ""),
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.brand ? `${item.name} (${item.brand})` : item.name,
          quantity: item.quantity,
        })),
      });

      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      clear();
      router.push("/bao-gia/thanh-cong");
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {t("emptyTitle")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t("emptyDescription")}</p>
        <Link
          href="/san-pham"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          {t("viewProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-900">{t("title")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("description")}</p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </p>
                  {item.brand && (
                    <p className="text-xs text-slate-500">{item.brand}</p>
                  )}
                </div>
                <input
                  type="text"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, e.target.value)}
                  className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-600 focus:outline-none"
                  aria-label={t("quantityLabel", { name: item.name })}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={t("removeLabel", { name: item.name })}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Link
            href="/san-pham"
            className="mt-4 inline-block text-sm font-semibold text-blue-900 hover:text-amber-600"
          >
            {t("addMore")}
          </Link>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                {t("companyName")}
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-600">{errors.companyName[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-slate-700">
                {t("contactName")}
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
              {errors.contactName && (
                <p className="mt-1 text-xs text-red-600">{errors.contactName[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  {t("phone")}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  {t("email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                {t("address")}
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-slate-700">
                {t("note")}
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
            >
              {pending ? t("sending") : t("submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
