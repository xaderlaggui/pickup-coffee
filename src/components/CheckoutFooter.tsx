import { CountPrice } from "./MotionText"
import { PickupReadyNote } from "./SchedulePickup"

export function CheckoutFooter({ checkout, review, loading, total, day, time, pickupClosed, onReview, onSubmit }: { checkout: boolean; review: boolean; loading: boolean; total: number; day: "Today" | "Tomorrow"; time: string; pickupClosed: boolean; onReview: () => void; onSubmit: () => void }) {
  if (!checkout) return null
  return (
    <div className={`checkout-sticky-footer${review ? " review-footer" : ""}`}>
      {review && <PickupReadyNote day={day} time={time} />}
      <div className="checkout-footer-total">
        <span className="checkout-footer-label">Total</span>
        <strong className="checkout-footer-price"><CountPrice value={total} /></strong>
      </div>
      {!review
        ? <button type="button" className="primary-button" onClick={onReview}>Review Details</button>
        : <button type="button" className="primary-button" onClick={onSubmit} disabled={loading || pickupClosed} aria-busy={loading}>
            {loading ? <span className="loading-dots" role="status"><i /><i /><i /></span> : "Place Order"}
          </button>}
    </div>
  )
}