import { localized } from "@/lib/localized";
import type { ProductCardData } from "@/components/site/ProductCard";

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  // No price: prices are hidden on the public site, and anything selected
  // here ends up in the page payload via the client "add to quote" button.
  shortDescription: true,
  shortDescriptionEn: true,
  category: { select: { name: true, nameEn: true } },
  images: { take: 1, orderBy: { sortOrder: "asc" as const }, select: { url: true } },
  variants: { orderBy: { sortOrder: "asc" as const }, select: { packaging: true } },
} as const;

type ProductCardRaw = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  shortDescription: string | null;
  shortDescriptionEn: string | null;
  category: { name: string; nameEn: string | null } | null;
  images: { url: string }[];
  // Optional: unstable_cache keys on the query function's source, which
  // doesn't change when productCardSelect does, so entries cached before
  // variants existed (up to `revalidate` old) come back without it.
  variants?: { packaging: string }[];
};

export function localizeProductCard(
  { variants, ...p }: ProductCardRaw,
  locale: string
): ProductCardData {
  return {
    ...p,
    shortDescription: localized(locale, p.shortDescription, p.shortDescriptionEn),
    category: p.category
      ? { name: localized(locale, p.category.name, p.category.nameEn) }
      : null,
    packagings: (variants ?? []).map((v) => v.packaging),
  };
}
