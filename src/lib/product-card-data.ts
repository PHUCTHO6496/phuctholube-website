import { localized } from "@/lib/localized";
import type { ProductCardData } from "@/components/site/ProductCard";

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  price: true,
  shortDescription: true,
  shortDescriptionEn: true,
  category: { select: { name: true, nameEn: true } },
  images: { take: 1, orderBy: { sortOrder: "asc" as const }, select: { url: true } },
} as const;

type ProductCardRaw = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number | null;
  shortDescription: string | null;
  shortDescriptionEn: string | null;
  category: { name: string; nameEn: string | null } | null;
  images: { url: string }[];
};

export function localizeProductCard(
  p: ProductCardRaw,
  locale: string
): ProductCardData {
  return {
    ...p,
    shortDescription: localized(locale, p.shortDescription, p.shortDescriptionEn),
    category: p.category
      ? { name: localized(locale, p.category.name, p.category.nameEn) }
      : null,
  };
}
