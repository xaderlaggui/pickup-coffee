import { describe, expect, it } from "vitest"
import type { Coffee, ProductCategory } from "../types"
import {
  MAX_CUPS,
  cartTotal,
  cupCount,
  itemCount,
  itemPrice,
  reachedCupLimit,
  sizeAdjustment,
} from "./cart"

const product = (
  id: number,
  price: number,
  category: ProductCategory = "coffee",
): Coffee => ({
  id,
  name: `Item ${id}`,
  detail: "",
  description: "",
  price,
  image: "",
  tone: "sage",
  category,
})

const latte = product(1, 100)
const pastry = product(2, 90, "pastry")

describe("sizeAdjustment", () => {
  it("discounts Small by 10 and premiums Large by 10", () => {
    expect(sizeAdjustment("Small")).toBe(-10)
    expect(sizeAdjustment("Medium")).toBe(0)
    expect(sizeAdjustment("Large")).toBe(10)
  })
})

describe("itemPrice", () => {
  it("applies the size adjustment for drinks", () => {
    expect(itemPrice(latte, "Small")).toBe(90)
    expect(itemPrice(latte, "Medium")).toBe(100)
    expect(itemPrice(latte, "Large")).toBe(110)
  })

  it("ignores size for pastries", () => {
    expect(itemPrice(pastry, "Small")).toBe(90)
    expect(itemPrice(pastry, "Large")).toBe(90)
  })
})

describe("cupCount", () => {
  it("counts drinks but not pastries", () => {
    expect(cupCount([latte, pastry], { 1: 3, 2: 2 })).toBe(3)
  })
})

describe("itemCount", () => {
  it("counts every unit in the cart", () => {
    expect(itemCount({ 1: 3, 2: 2 })).toBe(5)
  })
})

describe("cartTotal", () => {
  it("prices each line by its chosen size", () => {
    expect(
      cartTotal([latte, pastry], { 1: 2, 2: 1 }, { 1: "Large", 2: "Medium" }),
    ).toBe(110 * 2 + 90)
  })

  it("defaults a missing size to Medium", () => {
    expect(cartTotal([latte], { 1: 1 }, {})).toBe(100)
  })
})

describe("MAX_CUPS", () => {
  it("caps drinks at five", () => {
    expect(MAX_CUPS).toBe(5)
  })
})

describe("reachedCupLimit", () => {
  it("fires only on the change that lands exactly on the cap", () => {
    expect(reachedCupLimit(4, MAX_CUPS)).toBe(true)
    expect(reachedCupLimit(3, MAX_CUPS)).toBe(true)
    expect(reachedCupLimit(5, MAX_CUPS)).toBe(false)
    expect(reachedCupLimit(4, 4)).toBe(false)
    expect(reachedCupLimit(4, 3)).toBe(false)
  })
})
