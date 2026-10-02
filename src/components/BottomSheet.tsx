import { useCallback, useEffect, useRef } from "react"
import { Coffee } from "../types"
import { motionDelay } from "../utils/motion"
import { CrossfadeText } from "./MotionText"
import { QuantityControl } from "./QuantityControl"

/* ============================================================
   BOTTOM SHEET — Liquid Glass, draggable with spring physics
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
}) {
  const sheetRef = useRef<HTMLElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const dragState = useRef({
    active: false,
    startY: 0,
    currentY: 0,
    velocity: 0,
    lastY: 0,
    lastTime: 0,
  })

  // Escape key
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  // Drag-to-dismiss with rubber-banding + velocity
  const handleDragStart = useCallback(
    (clientY: number) => {
      const sheet = sheetRef.current
      if (!sheet) return
      dragState.current = {
        active: true,
        startY: clientY,
        currentY: 0,
        velocity: 0,
        lastY: clientY,
        lastTime: performance.now(),
      }
      sheet.style.transition = "none"
    },
    [],
  )

  const handleDragMove = useCallback((clientY: number) => {
    const ds = dragState.current
    if (!ds.active) return
    const sheet = sheetRef.current
    const backdrop = backdropRef.current
    if (!sheet) return

    const now = performance.now()
    const dt = now - ds.lastTime
    ds.velocity = dt > 0 ? (clientY - ds.lastY) / dt : 0
    ds.lastY = clientY
    ds.lastTime = now

    let delta = clientY - ds.startY
    ds.currentY = delta

    // Rubber-band upward (resistance 0.55)
    if (delta < 0) {
      delta = delta * 0.55
    }

    const sheetHeight = sheet.offsetHeight
    const progress = Math.max(0, Math.min(1, delta / (sheetHeight * 0.35)))

    sheet.style.transform = `translateY(${delta}px)`
    if (backdrop) {
      backdrop.style.opacity = String(1 - progress * 0.6)
      backdrop.style.backdropFilter = `blur(${5 * (1 - progress * 0.4)}px)`
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    const ds = dragState.current
    if (!ds.active) return
    ds.active = false

    const sheet = sheetRef.current
    if (!sheet) return

    const sheetHeight = sheet.offsetHeight
    const velocity = ds.velocity
    const delta = ds.currentY

    // Dismiss if velocity > 0.5 px/ms or dragged > 35% of height
    if (velocity > 0.5 || delta > sheetHeight * 0.35) {
      sheet.style.transition = `transform 380ms var(--spring-smooth)`
      sheet.style.transform = `translateY(100%)`
      setTimeout(onClose, 380)
    } else {
      // Snap back with spring
      sheet.style.transition = `transform 380ms var(--spring-snappy)`
      sheet.style.transform = `translateY(0)`
      const backdrop = backdropRef.current
      if (backdrop) {
        backdrop.style.opacity = ""
        backdrop.style.backdropFilter = ""
      }
    }
  }, [onClose])

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as Element).closest("button")) return
    handleDragStart(e.touches[0].clientY)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragState.current.active) {
      handleDragMove(e.touches[0].clientY)
    }
  }
  const onTouchEnd = () => handleDragEnd()

  // Pointer events (desktop drag)
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("button")) return
    if (e.pointerType === "mouse") {
      handleDragStart(e.clientY)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragState.current.active) handleDragMove(e.clientY)
  }
  const onPointerUp = () => handleDragEnd()

  return (
    <div
      className={`sheet-layer ${closing ? "closing" : ""}`}
      role="presentation"
    >
      <button
        ref={backdropRef}
        aria-label="Close add to cart sheet"
        className="sheet-backdrop"
        onClick={onClose}
        type="button"
      />
      <section
        ref={sheetRef}
        aria-labelledby="sheet-title"
        aria-modal="true"
        className="bottom-sheet"
        role="dialog"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="drag-handle"
          style={{ cursor: "grab" }}
        />
        <button
          aria-label="Close"
          className="close-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <div className={`sheet-visual ${coffee.tone}`}>
          <img className="sheet-hero-img" src={coffee.image} alt="" />
        </div>
        <p className="sheet-description">
          {coffee.detail}.{" "}
          {coffee.id === 1
            ? "Smooth espresso poured over fresh milk and ice for a creamy, refreshing finish."
            : coffee.id === 2
              ? "Bold double espresso over chilled water and ice. Clean, rich, and refreshing."
              : "Freshly brewed hot coffee with a balanced aroma and a comforting, full-bodied finish."}
        </p>
        <div className="sheet-title">
          <div>
            <p>FRESHLY MADE</p>
            <h2 id="sheet-title">{coffee.name}</h2>
          </div>
          <strong className="tabular">₱{coffee.price}</strong>
        </div>

        {/* Iced / Hot toggle */}
        <div className="temp-row">
          <span>Temperature</span>
          <div className={`segmented-control temp-toggle ${temp === "Hot" ? "tomorrow" : ""}`}>
            <div className="segment-pill" />
            <button
              type="button"
              className={temp === "Iced" ? "selected" : ""}
              onClick={() => setTemp("Iced")}
            >
              Iced
            </button>
            <button
              type="button"
              className={temp === "Hot" ? "selected" : ""}
              onClick={() => setTemp("Hot")}
            >
              Hot
            </button>
          </div>
        </div>

        <div className="quantity-row">
          <div>
            <span>Quantity</span>
            <small>Maximum 5 cups per order</small>
          </div>
          <QuantityControl
            max={max}
            quantity={quantity}
            setQuantity={setQuantity}
            onLimit={onLimit}
          />
        </div>
        <button
          className="primary-button sheet-cta"
          disabled={existing === 0 && quantity === 0}
          onClick={onAdd}
          type="button"
        >
          <CrossfadeText
            text={
              quantity === 0
                ? "Remove from order"
                : `${
                    existing > 0 ? "Update order" : "Add to order"
                  } · ${quantity} cups · ₱${coffee.price * quantity}`
            }
          />
        </button>
      </section>
    </div>
  )
}
