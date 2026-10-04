import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Coffee, CoffeeSize } from "../types"
import { CountPrice } from "./MotionText"
import { Price } from "./Price"

export function ConfirmOrderModal({
  coffees,
  cart,
  cartTemps,
  cartSizes,
  cartNotes,
  name,
  payment,
  day,
  time,
  total,
  loading,
  darkMode,
  itemPrice,
  onClose,
  onConfirm,
}: {
  coffees: Coffee[]
  cart: Record<number, number>
  cartTemps: Record<number, "Iced" | "Hot">
  cartSizes: Record<number, CoffeeSize>
  cartNotes: Record<number, string>
  name: string
  payment: string
  day: "Today" | "Tomorrow"
  time: string
  total: number
  loading: boolean
  darkMode: boolean
  itemPrice: (coffee: Coffee, size: CoffeeSize) => number
  onClose: () => void
  onConfirm: () => void
}) {
  const selected = coffees.filter((coffee) => cart[coffee.id] > 0)
  const pickupTime = day === "Today" && time === "ASAP" ? "ASAP" : time === "Closed" ? "Closed" : time
  const onCloseRef = useRef(onClose)
  const loadingRef = useRef(loading)
  onCloseRef.current = onClose
  loadingRef.current = loading

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingRef.current) onCloseRef.current()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [])

  return createPortal(
    <div
      className={`confirm-order-overlay${darkMode ? " dark" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose()
      }}
    >
      <section className="confirm-order-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-order-title">
        <header className="confirm-order-header">
          <div>
            <p className="eyebrow">FINAL CHECK</p>
            <h2 id="confirm-order-title">Confirm your order</h2>
          </div>
          <button className="confirm-order-close" type="button" onClick={onClose} disabled={loading} aria-label="Close confirmation">×</button>
        </header>

        <div className="confirm-order-details">
          <div><span>Name</span><strong>{name}</strong></div>
          <div><span>Pickup</span><strong>{pickupTime} · {day}</strong></div>
          <div><span>Payment</span><strong>{payment}</strong></div>
        </div>

        <div className="confirm-order-items" aria-label="Order items">
          {selected.map((coffee) => {
            const quantity = cart[coffee.id]
            const size = cartSizes[coffee.id] || "Medium"
            const modifiers = [
              coffee.category === "pastry" ? "Pastry" : cartTemps[coffee.id] || "Iced",
              coffee.category !== "pastry" ? size : "",
              cartNotes[coffee.id],
            ].filter(Boolean)
            return (
              <div className="confirm-order-item" key={coffee.id}>
                <div>
                  <strong>{coffee.name} <span>×{quantity}</span></strong>
                  <small>{modifiers.join(" · ")}</small>
                </div>
                <Price value={itemPrice(coffee, size) * quantity} />
              </div>
            )
          })}
        </div>

        <div className="confirm-order-totals">
          <div className="confirm-order-total"><span>Total</span><strong><CountPrice value={total} /></strong></div>
        </div>

        <footer className="confirm-order-actions">
          <button type="button" className="confirm-order-cancel" onClick={onClose} disabled={loading}>Back to details</button>
          <button type="button" className="primary-button" onClick={onConfirm} disabled={loading} aria-busy={loading}>
            {loading ? <span className="loading-dots" role="status"><i /><i /><i /></span> : "Confirm Order"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
