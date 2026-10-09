import type { Coffee, CoffeeSize } from "../types"
import { itemPrice } from "../utils/cart"

/* ============================================================
   ORDER SUBMISSION (prepared as if sending to an API)
   ============================================================
   The backend is not built for this assessment. This module:
     1. builds the exact JSON payload an API would receive
     2. contains the real request handling (fetch) - COMMENTED OUT
     3. treats every order as successful
   To go live: uncomment the block inside submitOrder() and remove the mock return.
   ============================================================ */

// const ORDERS_ENDPOINT = `${import.meta.env.VITE_API_URL}/api/orders`

export type OrderPayload = {
  clientOrderId: string // idempotency key: retrying the same order never duplicates it
  submittedAt: string // ISO 8601
  customer: { name: string; contact: string | null }
  pickup: { day: "Today" | "Tomorrow"; time: string }
  payment: { method: string }
  items: Array<{
    productId: number
    name: string
    category: Coffee["category"]
    quantity: number
    temperature: "Iced" | "Hot" | null // null for pastries
    size: CoffeeSize | null // null for pastries
    note: string | null
    unitPrice: number
    lineTotal: number
  }>
  totals: { itemCount: number; amount: number; currency: "PHP" }
}

export type OrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string }

/* Display-only reference for the assessment mock. Real orders use the
   server-issued orderId (the commented fetch returns it verbatim). */
export function formatOrderRef(id: string): string {
  const compact = id.replace(/[^a-z0-9]/gi, "").toUpperCase()
  return `PC-${compact.slice(0, 6) || "000000"}`
}

type BuildOrderInput = {
  coffees: Coffee[]
  cart: Record<number, number>
  cartTemps: Record<number, "Iced" | "Hot">
  cartSizes: Record<number, CoffeeSize>
  cartNotes: Record<number, string>
  name: string
  contact: string
  day: "Today" | "Tomorrow"
  time: string
  payment: string
}

export function buildOrderPayload(input: BuildOrderInput): OrderPayload {
  const { coffees, cart, cartTemps, cartSizes, cartNotes } = input

  const items = coffees
    .filter((coffee) => (cart[coffee.id] || 0) > 0)
    .map((coffee) => {
      const isPastry = coffee.category === "pastry"
      const size = cartSizes[coffee.id] || "Medium"
      const quantity = cart[coffee.id]
      const unitPrice = itemPrice(coffee, size)
      return {
        productId: coffee.id,
        name: coffee.name,
        category: coffee.category,
        quantity,
        temperature: isPastry ? null : cartTemps[coffee.id] || "Iced",
        size: isPastry ? null : size,
        note: cartNotes[coffee.id]?.trim() || null,
        unitPrice,
        lineTotal: unitPrice * quantity,
      }
    })

  return {
    clientOrderId: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    customer: { name: input.name.trim(), contact: input.contact.trim() || null },
    pickup: { day: input.day, time: input.time },
    payment: { method: input.payment },
    items,
    totals: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      amount: items.reduce((sum, item) => sum + item.lineTotal, 0),
      currency: "PHP",
    },
  }
}

export async function submitOrder(payload: OrderPayload): Promise<OrderResult> {
  /* ---- Real API request (commented out for the assessment) ----
  try {
    const response = await fetch(ORDERS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": payload.clientOrderId,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return { ok: false, error: `Order failed (HTTP ${response.status})` }
    }

    const data: { orderId: string } = await response.json()
    return { ok: true, orderId: data.orderId }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" }
  }
  ------------------------------------------------------------- */

  // Assessment: assume every order is successful.
  return { ok: true, orderId: formatOrderRef(payload.clientOrderId) }
}
