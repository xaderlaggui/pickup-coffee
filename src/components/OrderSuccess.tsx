import { CheckIcon } from "./icons";
import { formatPrice, formatPickupLabel } from "../lib/format";
import { CartItem, PickupDay, Slot } from "../types";
import { MENU_ITEMS, OPEN_HOUR, CLOSE_HOUR } from "../config";

interface OrderSuccessProps {
  orderId: string;
  cartItems: CartItem[];
  totalAmount: number;
  selectedSlot: Slot;
  day: PickupDay;
  customerName: string;
  paymentMethod: string;
  onRestart: () => void;
}

export default function OrderSuccess({
  orderId,
  cartItems,
  totalAmount,
  selectedSlot,
  day,
  customerName,
  paymentMethod,
  onRestart,
}: OrderSuccessProps) {
  const pickupLabel = formatPickupLabel(selectedSlot.isoTime, day);

  // Build item rows
  const itemRows = cartItems.map((ci) => {
    const meta = MENU_ITEMS.find((m) => m.id === ci.id)!;
    return {
      key: ci.id,
      label: `${ci.quantity} x ${meta.name}`,
      value: formatPrice(meta.price * ci.quantity),
    };
  });

  const closeHourLabel = `${CLOSE_HOUR > 12 ? CLOSE_HOUR - 12 : CLOSE_HOUR}:00 ${CLOSE_HOUR >= 12 ? "PM" : "AM"}`;
  const openHourLabel = `${OPEN_HOUR}:00 AM`;

  return (
    <main className="confirmation-screen" id="main-content" tabIndex={-1}>
      <div className="confirmation-content">
        {/* Animated check ring */}
        <div className="success-ring" aria-hidden="true">
          <CheckIcon />
        </div>

        {/* Order ID */}
        <p className="eyebrow confirmation-order-id">Order {orderId}</p>

        {/* Title */}
        <h1 className="confirmation-title">Order Confirmed</h1>

        {/* Lead text */}
        <p className="confirmation-lead">
          Your coffee is in the queue. We will have it ready when you arrive.
        </p>

        {/* Summary table */}
        <div className="confirmation-summary" aria-label="Order summary">
          <div className="summary-row">
            <span className="summary-label">Name</span>
            <span className="summary-value">{customerName}</span>
          </div>
          {itemRows.map((row) => (
            <div className="summary-row" key={row.key}>
              <span className="summary-label">{row.label}</span>
              <span className="summary-value num">{row.value}</span>
            </div>
          ))}
          <div className="summary-row">
            <span className="summary-label">Total</span>
            <span className="summary-value num">{formatPrice(totalAmount)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Payment</span>
            <span className="summary-value">{paymentMethod}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Pickup</span>
            <span className="summary-value">{pickupLabel}</span>
          </div>
        </div>

        {/* Store hours note */}
        <p className="store-note">
          Store hours: {openHourLabel} - {closeHourLabel}, Monday to Sunday.
          Please arrive within 15 minutes of your pickup time.
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={onRestart}
          autoFocus
        >
          Start new order
        </button>
      </div>
    </main>
  );
}
