import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useFocusTrap } from "../hooks/useFocusTrap"

export function ConfirmRemoveModal({
  itemName,
  darkMode,
  onClose,
  onConfirm,
}: {
  itemName: string
  darkMode: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const dialogRef = useRef<HTMLElement>(null)
  useFocusTrap(dialogRef)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [onClose])

  return createPortal(
    <div
      className={`confirm-order-overlay${darkMode ? " dark" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="confirm-order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-remove-title"
      >
        <header className="confirm-order-header">
          <div>
            <p className="eyebrow">REMOVE ITEM</p>
            <h2 id="confirm-remove-title">Remove from cart?</h2>
          </div>
          <button className="confirm-order-close" type="button" onClick={onClose} aria-label="Close">×</button>
        </header>

        <p className="py-4 text-[0.95rem] leading-relaxed text-[color:var(--muted)]">
          Remove <strong className="text-[color:var(--text)]">{itemName}</strong> from your cart? This can’t be undone.
        </p>

        <footer className="confirm-order-actions">
          <button type="button" className="confirm-order-cancel" onClick={onClose}>Keep item</button>
          <button type="button" className="primary-button" onClick={onConfirm}>Remove</button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}
