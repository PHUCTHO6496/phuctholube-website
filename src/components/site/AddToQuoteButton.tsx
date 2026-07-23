"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useQuoteCart } from "@/lib/store/quote-cart";
import { cn } from "@/lib/utils";

export type QuoteProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
};

export function AddToQuoteButton({
  product,
  className,
  fullWidth,
  variant = "outline",
}: {
  product: QuoteProduct;
  className?: string;
  fullWidth?: boolean;
  variant?: "outline" | "filled";
}) {
  const addItem = useQuoteCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
        variant === "outline" &&
          "border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white",
        variant === "filled" &&
          "bg-amber-500 px-6 py-3 text-white hover:bg-amber-600",
        fullWidth && "w-full",
        className
      )}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ báo giá"}
    </button>
  );
}
