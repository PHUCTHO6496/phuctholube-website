import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuoteCartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  quantity: string;
};

type QuoteCartState = {
  items: QuoteCartItem[];
  addItem: (item: Omit<QuoteCartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: string) => void;
  clear: () => void;
};

export const useQuoteCart = create<QuoteCartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) {
            return state;
          }
          return { items: [...state.items, { ...item, quantity: "1" }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "phuctho-quote-cart" }
  )
);
