import { MAX_CUPS } from "../config";
import { CartItem } from "../types";
import { ChevronRightIcon } from "./icons";
import { formatPrice } from "../lib/format";

interface OrderBarProps {
  totalQuantity: number;
  totalAmount: number;
  cartItems: CartItem[];
  onCheckout: () => void;
  isCheckout: boolean;
  isSubmitting: boolean;
}

export default function OrderBar({
  totalQuantity,
  totalAmount,
  onCheckout,
  isCheckout,
  isSubmitting,
}: OrderBarProps) {
  const visible = totalQuantity > 0;

  return (
    <aside
      className={`order-bar${visible ? " visible" : ""}`}
      aria-label="Your order"
      aria-hidden={!visible}
    >
      <div className="order-bar-inner">
        {/* Cup progress dots */}
        <div className="cup-dots" aria-hidden="true">
          {Array.from({ length: MAX_CUPS }).map((_, i) => (
            <span
              key={i}
              className={`cup-dot${i < totalQuantity ? " filled" : ""}`}
            />
          ))}
        </div>

        {/* Order info */}
        <div className="order-info">
          <span className="order-label">Your order</span>
          <span className="order-count num">
            {totalQuantity} / {MAX_CUPS} cups
          </span>
        </div>

        {/* CTA */}
        <button
          type={isCheckout ? "submit" : "button"}
          form={isCheckout ? "checkout-form" : undefined}
          className="checkout-btn"
          onClick={!isCheckout ? onCheckout : undefined}
          disabled={totalQuantity === 0 || isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Placing order...
            </>
          ) : (
            <>
              <span className="num">
                {isCheckout ? "Place order" : "Checkout"} · {formatPrice(totalAmount)}
              </span>
              <ChevronRightIcon />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
