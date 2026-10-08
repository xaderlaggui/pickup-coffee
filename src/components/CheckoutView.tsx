import { useEffect, useRef } from "react"
import { PickupReadyNote, SchedulePickup } from "./SchedulePickup"

export function CheckoutView({ day, setDay, time, setTime, name, setName, contact, setContact, invalid, invalidAttempts, payment, setPayment, onSubmit, loading, darkMode, hasItems }: { day: "Today" | "Tomorrow"; setDay: (day: "Today" | "Tomorrow") => void; time: string; setTime: (time: string) => void; name: string; setName: (name: string) => void; contact: string; setContact: (contact: string) => void; invalid: Record<string, boolean>; invalidAttempts: number; payment: string; setPayment: (payment: string) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; loading: boolean; darkMode: boolean; hasItems: boolean }) {
  const pickupClosed = time === "Closed"

  // The invalid flags stay true across repeated failed submits, so the class
  // never changes and the CSS animation wouldn't replay. Restart it manually:
  // drop the class, force a reflow, re-add it.
  const nameRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (invalidAttempts === 0 || !invalid.name) return
    const input = nameRef.current
    if (!input) return
    input.classList.remove("invalid-field")
    void input.offsetWidth
    input.classList.add("invalid-field")
  }, [invalidAttempts, invalid.name])

  return <form id="checkout-form" noValidate onSubmit={onSubmit}>
    <section className="checkout-section details-section">
      <div className="details-row">
        <div className="details-field">
          <label className="name-field" htmlFor="pickup-name">Name for pickup<input ref={nameRef} id="pickup-name" aria-invalid={invalid.name} aria-describedby={invalid.name ? "pickup-name-error" : undefined} required maxLength={80} autoComplete="name" placeholder="Enter your name" value={name} onChange={(event) => { setName(event.target.value) }} className={`name-input ${invalid.name ? "invalid-field" : ""}`} /></label>
          {invalid.name && <span className="field-error" id="pickup-name-error" role="alert">Name is required to claim your order.</span>}
        </div>
        <label className="name-field" htmlFor="pickup-contact">Contact<input id="pickup-contact" type="tel" autoComplete="tel" maxLength={32} placeholder="Phone (optional)" value={contact} onChange={(event) => setContact(event.target.value)} className="name-input" /></label>
      </div>
    </section>
    <SchedulePickup day={day} setDay={setDay} setTime={setTime} time={time} darkMode={darkMode} />
    <section className="checkout-section payment-section">
      <fieldset className="payment-fieldset">
        <legend className="payment-legend">Payment method</legend>
        <p className="payment-note">Pay at the counter when you pick up your coffee.</p>
        <div className="payment-options">{["Cash at pickup", "Card at pickup"].map((option) => <label key={option} className={`payment-card ${payment === option ? "selected" : ""} ${invalid.payment ? "invalid" : ""}`} aria-invalid={invalid.payment}><input type="radio" name="payment" value={option} checked={payment === option} onChange={() => setPayment(option)} aria-invalid={invalid.payment} />{option}</label>)}</div>
      </fieldset>
    </section>
    <div className="checkout-submit-area">
      <PickupReadyNote day={day} time={time} />
      <button type="submit" className="primary-button desktop-place-order" disabled={loading || pickupClosed || !hasItems} aria-busy={loading}>{loading ? <span className="loading-dots" role="status"><i /><i /><i /></span> : "Place Order"}</button>
    </div>
  </form>
}