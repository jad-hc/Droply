import { create } from "zustand";
import { persist } from "zustand/middleware";

type SelectedOption = {
  id: string;
  name: string;
  priceAdjustment: number;
};

type CartItem = {
  cartItemId: string;

  restaurantId: string;
  restaurantName: string;

  menuItemId: string;
  name: string;
  image: string | null;

  basePrice: number;
  unitPrice: number;

  quantity: number;

  selectedOptions: SelectedOption[];
};

type CartStore = {
  items: CartItem[];

  addItem: (item: CartItem) => void;

  removeItem: (cartItemId: string) => void;

  increaseQuantity: (cartItemId: string) => void;

  decreaseQuantity: (cartItemId: string) => void;

  clearCart: () => void;

  getTotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;

        // For now, only allow one restaurant per cart.
        if (
          items.length > 0 &&
          items[0].restaurantId !== item.restaurantId
        ) {
          throw new Error(
            "You can only order from one restaurant at a time."
          );
        }

        set({
          items: [...items, item],
        });
      },

      removeItem: (cartItemId) => {
        set({
          items: get().items.filter(
            (item) => item.cartItemId !== cartItemId
          ),
        });
      },

      increaseQuantity: (cartItemId) => {
        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        });
      },

      decreaseQuantity: (cartItemId) => {
        set({
          items: get()
            .items
            .map((item) =>
              item.cartItemId === cartItemId
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        });
      },

      clearCart: () => {
        set({
          items: [],
        });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) =>
            total + item.unitPrice * item.quantity,
          0
        );
      },
    }),
    {
      name: "food-delivery-cart",
    }
  )
);