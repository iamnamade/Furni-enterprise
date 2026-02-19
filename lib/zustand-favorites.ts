"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoriteItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
};

type FavoritesState = {
  items: FavoriteItem[];
  addItem: (item: FavoriteItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: FavoriteItem) => void;
  hasItem: (productId: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((entry) => entry.productId === item.productId)) return state;
          return { items: [item, ...state.items] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((entry) => entry.productId !== productId)
        })),
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((entry) => entry.productId === item.productId);
          if (exists) {
            return { items: state.items.filter((entry) => entry.productId !== item.productId) };
          }
          return { items: [item, ...state.items] };
        }),
      hasItem: (productId) => get().items.some((entry) => entry.productId === productId)
    }),
    { name: "furni-favorites" }
  )
);

