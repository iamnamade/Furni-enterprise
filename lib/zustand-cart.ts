"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  syncWithBackend: () => Promise<void>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const found = state.items.find((x) => x.productId === item.productId);
          if (found) {
            return {
              items: state.items.map((x) =>
                x.productId === item.productId ? { ...x, quantity: x.quantity + 1 } : x
              )
            };
          }

          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (productId) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.productId !== productId);
          if (nextItems.length === state.items.length) return state;
          return { items: nextItems };
        }),
      updateQty: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const nextItems = state.items.filter((item) => item.productId !== productId);
            if (nextItems.length === state.items.length) return state;
            return { items: nextItems };
          }

          let changed = false;
          const nextItems = state.items.map((item) => {
            if (item.productId !== productId) return item;
            if (item.quantity === quantity) return item;
            changed = true;
            return { ...item, quantity };
          });

          return changed ? { items: nextItems } : state;
        }),
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      syncWithBackend: async () => {
        const payload = get().items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }));

        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
    }),
    {
      name: "furni-cart"
    }
  )
);
