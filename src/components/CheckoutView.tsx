import { PickupReadyNote, SchedulePickup } from "./SchedulePickup"

export function CheckoutView({ day, setDay, time, setTime, name, setName, invalid, payment, setPayment, onSubmit, loading, darkMode }: { day: "Today" | "Tomorrow"; setDay: (day: "Today" | "Tomorrow") => void; time: string; setTime: (time: string) => void; name: string; setName: (name: string) => void; invalid: number; payment: string; setPayment: (payment: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; loading: boolean; darkMode: boolean }) {
  const pickupClosed = time === "Closed"
  return <form id="checkout-form" noValidate onSubmit={onSubmit}>
    <div className="hero-copy" style={{ marginBottom: "16px" }}><p className="hero-subtitle">Almost there! Schedule your pickup and confirm details.</p></div>
    <SchedulePickup day={day} setDay={setDay} setTime={setTime} time={time} darkMode={darkMode} />
    <section className="checkout-section details-section"><h2 className="checkout-section-title">Your details</h2><label className="name-field" htmlFor="pickup-name">Name for pickup<input id="pickup-name" aria-invalid={invalid > 0 && !name.trim()} required maxLength={80} autoComplete="name" placeholder="Enter your name" value={name} onChange={(event) => { setName(event.target.value) }} className={`name-input ${invalid ? `invalid-field ${invalid % 2 ? "shake-odd" : "shake-even"}` : ""}`} /></label><fieldset className="payment-fieldset"><legend className="payment-legend">Payment method</legend><p className="payment-note">Pay at the counter when you pick up your coffee.</p><div className="payment-options">{["Cash at pickup", "Card at pickup"].map((option) => <label key={option} className={`payment-card ${payment === option ? "selected" : ""}`}><input type="radio" name="payment" value={option} checked={payment === option} onChange={() => setPayment(option)} />{option}</label>)}</div></fieldset></section>
    <div className="checkout-submit-area">
      <PickupReadyNote day={day} time={time} />
      <button type="submit" className="primary-button desktop-place-order" disabled={loading || pickupClosed} aria-busy={loading}>{loading ? <span className="loading-dots" role="status"><i /><i /><i /></span> : "Place Order"}</button>
    </div>
  </form>
}