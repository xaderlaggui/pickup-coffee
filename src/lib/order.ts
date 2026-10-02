import { CURRENCY, MENU_ITEMS } from "../config";
import { Cart, OrderPayload, OrderResponse, PickupDay, Slot } from "../types";
import { generateOrderId } from "./format";

/** Build the typed order payload for API submission. */
export function buildOrderPayload(
  cart: Cart,
  slot: Slot,
  day: PickupDay,
  customerName: string,
  paymentMethod: "Cash at pickup" | "Card at pickup"
): OrderPayload {
  const items = MENU_ITEMS.filter((m) => (cart[m.id] ?? 0) > 0).map((m) => ({
    id: m.id,
    name: m.name,
    unitPrice: m.price,
    quantity: cart[m.id] ?? 0,
  }));

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  return {
    items,
    totalQuantity,
    totalAmount,
    currency: CURRENCY,
    pickup: {
      day,
      time: slot.isoTime,
      asap: slot.isAsap,
    },
    customerName: customerName.trim(),
    paymentMethod,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Submit an order to the API.
 *
 * The real fetch call is commented out below. To enable it:
 * 1. Set VITE_API_URL in your .env file
 * 2. Set VITE_API_TOKEN or wire up your auth mechanism
 * 3. Uncomment the fetch block and remove the mock below
 */
export async function submitOrder(
  payload: OrderPayload
): Promise<OrderResponse> {
  // --- REAL API CALL (uncomment to enable) ---
  // const token = import.meta.env.VITE_API_TOKEN as string;
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   },
  //   body: JSON.stringify(payload),
  // });
  // if (!res.ok) throw new Error(`Order failed: ${res.status}`);
  // return (await res.json()) as OrderResponse;
  // --- END REAL API CALL ---

  // Mock: simulate network latency and return a fake confirmed order
  void payload; // used when real fetch is enabled
  const latency = 600 + Math.random() * 300; // 600-900ms
  await new Promise((resolve) => setTimeout(resolve, latency));

  return {
    orderId: generateOrderId(),
    status: "confirmed",
  };
}
