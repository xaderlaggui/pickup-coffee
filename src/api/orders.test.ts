import { describe, expect, it } from "vitest"
import type { Coffee, ProductCategory } from "../types"
import { buildOrderPayload, formatOrderRef, submitOrder } from "./orders"

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

const stripId = (id: string) =>
  `PC-${id.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}`

describe("formatOrderRef", () => {
  it("strips separators, uppercases and keeps the first six chars", () => {
    expect(formatOrderRef("a1b2c3d4-0000-0000")).toBe("PC-A1B2C3")
  })

  it("falls back when the id has no alphanumerics", () => {
    expect(formatOrderRef("----")).toBe("PC-000000")
  })
})

describe("buildOrderPayload", () => {
  it("prices lines, nulls pastry fields and trims the customer", () => {
    const payload = buildOrderPayload({
      coffees: [product(1, 100), product(2, 90, "pastry")],
      cart: { 1: 2, 2: 1 },
      cartTemps: { 1: "Iced" },
      cartSizes: { 1: "Large", 2: "Medium" },
      cartNotes: { 1: "  less ice  " },
      name: "  Ana  ",
      contact: "  ",
      day: "Today",
      time: "10:00 AM",
      payment: "Cash at pickup",
    })

    expect(payload.customer).toEqual({ name: "Ana", contact: null })
    expect(payload.pickup).toEqual({ day: "Today", time: "10:00 AM" })
    expect(payload.items).toHaveLength(2)

    const [drink, pastry] = payload.items
    expect(drink).toMatchObject({
      productId: 1,
      quantity: 2,
      size: "Large",
      temperature: "Iced",
      note: "less ice",
      unitPrice: 110,
      lineTotal: 220,
    })
    expect(pastry).toMatchObject({
      productId: 2,
      quantity: 1,
      size: null,
      temperature: null,
      note: null,
      unitPrice: 90,
      lineTotal: 90,
    })
    expect(payload.totals).toEqual({
      itemCount: 3,
      amount: 310,
      currency: "PHP",
    })
    expect(payload.clientOrderId).toMatch(/^[0-9a-f-]{36}$/)
  })

  it("leaves out products with zero quantity", () => {
    const payload = buildOrderPayload({
      coffees: [product(1, 100)],
      cart: { 1: 0 },
      cartTemps: {},
      cartSizes: {},
      cartNotes: {},
      name: "Ana",
      contact: "",
      day: "Tomorrow",
      time: "9:00 AM",
      payment: "Card at pickup",
    })

    expect(payload.items).toEqual([])
    expect(payload.totals.itemCount).toBe(0)
    expect(payload.totals.amount).toBe(0)
  })
})

describe("submitOrder (mock)", () => {
  it("resolves ok with a reference derived from the idempotency key", async () => {
    const payload = buildOrderPayload({
      coffees: [product(1, 100)],
      cart: { 1: 1 },
      cartTemps: {},
      cartSizes: {},
      cartNotes: {},
      name: "Ana",
      contact: "",
      day: "Today",
      time: "9:00 AM",
      payment: "Cash at pickup",
    })

    const result = await submitOrder(payload)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.orderId).toBe(stripId(payload.clientOrderId))
      expect(result.orderId).toMatch(/^PC-[0-9A-F]{6}$/)
    }
  })
})
