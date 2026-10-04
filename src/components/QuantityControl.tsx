import { useCallback } from "react"

/* ============================================================
   QUANTITY CONTROL — glass-clear +/- stepper
   ============================================================ */
export function QuantityControl({
  quantity,
  setQuantity,
  max,
  onLimit,
  unit = "items",
}: {
  quantity: number
  setQuantity: (q: number) => void
  max: number
  onLimit: () => void
  unit?: "cups" | "items"
}) {
  const decrement = useCallback(() => {
    if (quantity > 0) setQuantity(quantity - 1)
  }, [quantity, setQuantity])

  const increment = useCallback(() => {
    if (quantity < max) {
      setQuantity(quantity + 1)
    } else {
      onLimit()
    }
  }, [quantity, max, setQuantity, onLimit])

  return (
    <div className="quantity-control">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrement}
        disabled={quantity <= 0}
      >
        −
      </button>
      <span className="tabular" aria-live="polite" aria-label={`${quantity} ${unit}`}>
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={increment}
        disabled={quantity >= max}
      >
        +
      </button>
    </div>
  )
}
