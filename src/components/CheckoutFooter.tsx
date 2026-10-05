import { CountPrice } from "./MotionText"

export function CheckoutFooter({ checkout, loading, total, pickupClosed, hasItems, onSubmit }: { checkout: boolean; loading: boolean; total: number; pickupClosed: boolean; hasItems: boolean; onSubmit: () => void }) {
  if (!checkout) return null
  return (
    <div className="checkout-sticky-footer">
      <div className="checkout-footer-total">
        <span className="checkout-footer-label">Total</span>
        <strong className="checkout-footer-price"><CountPrice value={total} /></strong>
      </div>
      <button type="button" className="primary-button" onClick={onSubmit} disabled={loading || pickupClosed || !hasItems} aria-busy={loading}>
        {loading ? <span className="loading-dots" role="status"><i /><i /><i /></span> : "Place Order"}
      </button>
    </div>
  )
}