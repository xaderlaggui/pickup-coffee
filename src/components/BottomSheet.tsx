import { useEffect, useRef } from "react"
import { Coffee, CoffeeSize } from "../types"
import { motionDelay } from "../utils/motion"
import { MAX_CUPS, itemPrice } from "../utils/cart"
import { useFocusTrap } from "../hooks/useFocusTrap"
import { CrossfadeText } from "./MotionText"
import { QuantityControl } from "./QuantityControl"
import { formatPrice } from "./Price"

/* ============================================================
   BOTTOM SHEET — Liquid Glass item preview
   ============================================================ */
export function BottomSheet({
  coffee,
  quantity,
  setQuantity,
  onClose,
  onAdd,
  max,
  existing,
  closing,
  onLimit,
  temp,

  setTemp,
  size,
  setSize,
  note,
  setNote,
}: {
  coffee: Coffee
  quantity: number
  setQuantity: (quantity: number) => void
  onClose: () => void
  onAdd: () => void
  max: number
  existing: number
  closing: boolean
  onLimit: () => void
  temp: "Iced" | "Hot"

  setTemp: (temp: "Iced" | "Hot") => void
  size: CoffeeSize
  setSize: (size: CoffeeSize) => void
  note: string
  setNote: (note: string) => void
}) {
  const isPastry = coffee.category === "pastry"
  const selectedPrice = itemPrice(coffee, size)
  const sheetRef = useRef<HTMLElement>(null)
  useFocusTrap(sheetRef, !closing)
  // Escape key
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  return (
    <div
      className={`sheet-layer ${closing ? "closing" : ""}`}
      role="presentation"
    >
      <div aria-hidden="true" className="sheet-backdrop" />
      <section
        ref={sheetRef}
        aria-labelledby="sheet-title"
        aria-modal="true"
        className="bottom-sheet"
        role="dialog"
      >
        <div className="sheet-header">
          <button
            aria-label="Close"
            className="close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="sheet-content">
          <div className="sheet-left">
            <div className={"sheet-visual " + coffee.tone}>
              <img className="sheet-hero-img" src={coffee.image} alt={coffee.name + " in a PICKUP COFFEE cup"} />
            </div>
            <div className="sheet-title"><div><p>FRESHLY MADE</p><h2 id="sheet-title">{coffee.name}</h2></div></div>
            <p className="sheet-description">{coffee.description}</p>
          </div>
          <div className="sheet-right">
            <div className="sheet-price"><span>Price</span><strong className="tabular">{formatPrice(selectedPrice)}</strong></div>
            {!isPastry && <div className="size-row"><span>Size</span><div className="size-options">{(["Small", "Medium", "Large"] as const).map((option) => (<button key={option} type="button" className={size === option ? "selected" : ""} onClick={() => setSize(option)}>{option}</button>))}</div></div>}
            {!isPastry && <div className="temp-row"><span>Temperature</span><div className={"segmented-control temp-toggle " + (temp === "Hot" ? "tomorrow" : "")}><div className="segment-pill" /><button type="button" className={temp === "Iced" ? "selected" : ""} onClick={() => setTemp("Iced")}>Iced</button><button type="button" className={temp === "Hot" ? "selected" : ""} onClick={() => setTemp("Hot")}>Hot</button></div></div>}
            <div className="quantity-row"><div><span>Quantity</span><small>{isPastry ? "Choose your order quantity" : `Maximum ${MAX_CUPS} cups per order`}</small></div><QuantityControl max={max} quantity={quantity} setQuantity={setQuantity} onLimit={onLimit} unit={isPastry ? "items" : "cups"} /></div>
            <div className="note-row"><label htmlFor="drink-note">Special Instructions (optional)</label><textarea id="drink-note" className="note-input" placeholder="e.g. Less ice, extra hot, oat milk..." value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></div>
          </div>
        </div>
        <div className="sheet-footer">
          <div className="sheet-total"><span>Total Price</span><strong className="tabular">{formatPrice(selectedPrice * quantity)}</strong></div>
          <button className="primary-button sheet-cta" disabled={existing === 0 && quantity === 0} onClick={onAdd} type="button"><CrossfadeText text={quantity === 0 ? "Remove from order" : (existing > 0 ? "Update order" : "Add to cart")} /></button>
        </div>
      </section>
    </div>
  )
}
