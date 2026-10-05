import type { Coffee, CoffeeSize } from "../types"

/* ============================================================
   PRICING
   ============================================================ */
export const sizeAdjustment = (size: CoffeeSize): number =>
  size === "Small" ? -10 : size === "Large" ? 10 : 0

export const itemPrice = (coffee: Coffee, size: CoffeeSize): number =>
  coffee.category === "pastry"
    ? coffee.price
    : coffee.price + sizeAdjustment(size)

/* ============================================================
   CART HELPERS
   ============================================================ */
export const cupCount = (
  coffees: Coffee[],
  cart: Record<number, number>,
): number =>
  coffees
    .filter((c) => c.category !== "pastry")
    .reduce((sum, c) => sum + (cart[c.id] || 0), 0)

export const itemCount = (cart: Record<number, number>): number =>
  Object.values(cart).reduce((sum, n) => sum + n, 0)

export const cartTotal = (
  coffees: Coffee[],
  cart: Record<number, number>,
  cartSizes: Record<number, CoffeeSize>,
): number =>
  coffees.reduce(
    (sum, coffee) =>
      sum +
      itemPrice(coffee, cartSizes[coffee.id] || "Medium") *
        (cart[coffee.id] || 0),
    0,
  )
