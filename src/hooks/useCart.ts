import { useState, useCallback } from "react";
import { Cart, CartItem } from "../types";
import { MenuItemId, MAX_CUPS, MENU_ITEMS } from "../config";

const STORAGE_KEY = "pc-cart";

function readStoredCart(): Cart {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Cart>;
      // Validate: only known item IDs, values are non-negative integers
      const validIds = new Set(MENU_ITEMS.map((m) => m.id));
      const clean: Cart = {} as Cart;
      for (const id of validIds) {
        const val = parsed[id];
        if (typeof val === "number" && Number.isInteger(val) && val >= 0) {
          (clean as Record<string, number>)[id] = val;
        }
      }
      return clean;
    }
  } catch {
    // sessionStorage unavailable or invalid JSON
  }
  return {} as Cart;
}

function persistCart(cart: Cart): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // sessionStorage unavailable
  }
}

function getTotalQuantity(cart: Cart): number {
  return Object.values(cart).reduce((sum, q) => sum + (q ?? 0), 0);
}

/** Compute total price from cart */
export function getCartTotal(cart: Cart): number {
  return MENU_ITEMS.reduce((sum, m) => sum + m.price * (cart[m.id] ?? 0), 0);
}

export function useCart() {
  const [cart, setCartRaw] = useState<Cart>(readStoredCart);

  const setCart = useCallback((updater: (prev: Cart) => Cart) => {
    setCartRaw((prev) => {
      const next = updater(prev);
      persistCart(next);
      return next;
    });
  }, []);

  const totalQuantity = getTotalQuantity(cart);
  const totalAmount = getCartTotal(cart);

  /** Set quantity for a specific item, enforcing the global MAX_CUPS cap. */
  const setItemQuantity = useCallback(
    (id: MenuItemId, quantity: number) => {
      setCart((prev) => {
        const currentOthers = getTotalQuantity(prev) - (prev[id] ?? 0);
        const clamped = Math.min(quantity, MAX_CUPS - currentOthers);
        const next = { ...prev, [id]: Math.max(0, clamped) };
        return next as Cart;
      });
      // Haptic feedback on supported devices
      if (typeof navigator.vibrate === "function") {
        navigator.vibrate(8);
      }
    },
    [setCart]
  );

  /** Get how many more cups can be added across all items. */
  const remainingCapacity = MAX_CUPS - totalQuantity;

  /** Max quantity allowed for a specific item given current cart state. */
  const maxForItem = useCallback(
    (id: MenuItemId): number => {
      const othersTotal = totalQuantity - (cart[id] ?? 0);
      return MAX_CUPS - othersTotal;
    },
    [cart, totalQuantity]
  );

  /** Get cart items as an array, filtering out zero-quantity items. */
  const cartItems: CartItem[] = MENU_ITEMS.filter(
    (m) => (cart[m.id] ?? 0) > 0
  ).map((m) => ({ id: m.id, quantity: cart[m.id] ?? 0 }));

  const clearCart = useCallback(() => {
    setCart(() => ({} as Cart));
  }, [setCart]);

  return {
    cart,
    cartItems,
    totalQuantity,
    totalAmount,
    remainingCapacity,
    maxForItem,
    setItemQuantity,
    clearCart,
  };
}
