import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.product_id === product.id);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: Math.random(), // local id
                product_id: product.id,
                name: product.name,
                price: parseFloat(product.discount_price || product.price),
                image_url: product.image_url,
                quantity,
              },
            ],
          });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product_id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
