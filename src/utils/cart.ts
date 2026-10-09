import type { Coffee, CoffeeSize } from "../types"

/* Maximum drink cups per order. Pastries are exempt. */
export const MAX_CUPS = 5

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

/* True only on the transition that lands exactly on the drink cap. */
export const reachedCupLimit = (prevCups: number, nextCups: number): boolean =>
  nextCups === MAX_CUPS && prevCups < MAX_CUPS

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
