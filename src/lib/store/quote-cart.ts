import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuoteCartItem = {
  /** Identity in the cart: product + the packaging chosen when it was added. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  /** Chosen packaging (e.g. "209L"); may be picked later on the quote page. */
  packaging?: string;
  /** Packagings the product comes in, so the quote page can offer them. */
  packagings?: string[];
  quantity: string;
};

type NewItem = Omit<QuoteCartItem, "key" | "quantity">;

type QuoteCartState = {
  items: QuoteCartItem[];
  addItem: (item: NewItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: string) => void;
  updatePackaging: (key: string, packaging: string) => void;
  clear: () => void;
};

export const cartItemKey = (productId: string, packaging?: string) =>
  packaging ? `${productId}|${packaging}` : productId;

export const useQuoteCart = create<QuoteCartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const key = cartItemKey(item.productId, item.packaging);
          if (state.items.some((i) => i.key === key)) return state;
          return { items: [...state.items, { ...item, key, quantity: "1" }] };
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),
      updatePackaging: (key, packaging) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, packaging: packaging || undefined } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "phuctho-quote-cart",
      version: 1,
      // v0 carts (before packagings) were keyed by productId alone.
      migrate: (persisted, version) => {
        const state = persisted as { items?: Omit<QuoteCartItem, "key">[] };
        if (version < 1) {
          return {
            ...state,
            items: (state.items ?? []).map((i) => ({ ...i, key: i.productId })),
          } as QuoteCartState;
        }
        return state as QuoteCartState;
      },
    }
  )
);
