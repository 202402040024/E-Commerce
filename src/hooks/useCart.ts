'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IProduct } from '@/types';

export interface CartItem {
  product: IProduct;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  itemCount: number;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  addItem: (product: IProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) => item.product._id === product._id
        );

        let newItems: CartItem[];
        if (existingIndex >= 0) {
          newItems = items.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...items, { product, quantity }];
        }

        set({
          items: newItems,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      },

      removeItem: (productId) => {
        const newItems = get().items.filter(
          (item) => item.product._id !== productId
        );
        set({
          items: newItems,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const newItems = get().items.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        set({
          items: newItems,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        });
      },

      clearCart: () => set({ items: [], itemCount: 0 }),

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.product.discountPrice ?? item.product.price;
          return sum + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'shophub-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        } as any)
      ),
      // Recompute itemCount after hydration from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.itemCount = state.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          state._hasHydrated = true;
        }
      },
    }
  )
);

// Hook to safely use cart only after hydration (prevents SSR mismatch)
export function useHydratedCart() {
  const store = useCartStore();
  if (!store._hasHydrated) {
    return { ...store, items: [], itemCount: 0 };
  }
  return store;
}
