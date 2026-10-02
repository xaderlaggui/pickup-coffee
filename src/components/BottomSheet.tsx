import { useEffect, useRef } from "react";
import { MenuItem, MAX_CUPS } from "../config";
import { formatPrice } from "../lib/format";
import { useSheetDrag } from "../hooks/useSheetDrag";
import { XIcon } from "./icons";

interface BottomSheetProps {
  item: MenuItem;
  quantity: number;
  maxQuantity: number;
  onSetQuantity: (q: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  existingQuantity: number;
}

export default function BottomSheet({
  item,
  quantity,
  maxQuantity,
  onSetQuantity,
  onConfirm,
  onClose,
  existingQuantity,
}: BottomSheetProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { dragStyle, onPointerDown, onPointerMove, onPointerUp } =
    useSheetDrag({ onClose });

  // Focus the close button on mount
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Keyboard: Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const ctaLabel = (() => {
    if (quantity === 0 && existingQuantity > 0) return "Remove from order";
    if (existingQuantity > 0) return `Update order · ${quantity} cups · ${formatPrice(item.price * quantity)}`;
    return `Add to order · ${quantity} cups · ${formatPrice(item.price * quantity)}`;
  })();

  const ctaDisabled = quantity === 0 && existingQuantity === 0;
  const atCap = quantity >= maxQuantity;

  return (
    <div className="sheet-overlay" role="presentation">
      {/* Backdrop */}
      <button
        type="button"
        className="sheet-backdrop"
        onClick={onClose}
        aria-label="Close"
        tabIndex={-1}
      />

      {/* Panel */}
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="sheet-panel"
        style={dragStyle}
      >
        {/* Drag handle */}
        <div
          className="drag-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          aria-hidden="true"
        />

        {/* Close button */}
        <button
          ref={closeBtnRef}
          type="button"
          className="sheet-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon />
        </button>

        {/* Image */}
        <div className={`sheet-visual tone-${item.tone}`}>
          <img
            src={item.image}
            alt={item.imageAlt}
            width={300}
            height={220}
            loading="eager"
          />
        </div>

        {/* Description */}
        <p className="sheet-description">{item.description}</p>

        {/* Title + price */}
        <div className="sheet-header">
          <div className="sheet-header-left">
            <p className="eyebrow">Freshly made</p>
            <h2 id="sheet-title" className="sheet-name">
              {item.name}
            </h2>
          </div>
          <strong className="sheet-price num">{formatPrice(item.price)}</strong>
        </div>

        {/* Quantity row */}
        <div className="quantity-row">
          <div>
            <p className="quantity-label">Quantity</p>
            <p className="quantity-hint">Maximum {MAX_CUPS} cups per order</p>
          </div>
          <div
            className="quantity-control"
            role="group"
            aria-label="Quantity selector"
          >
            <button
              type="button"
              className="quantity-btn"
              aria-label="Decrease quantity"
              disabled={quantity <= 0}
              onClick={() => onSetQuantity(Math.max(0, quantity - 1))}
            >
              <span aria-hidden="true">−</span>
            </button>
            <span className="quantity-value num" aria-live="polite" aria-atomic="true">
              {quantity}
            </span>
            <button
              type="button"
              className="quantity-btn"
              aria-label="Increase quantity"
              disabled={atCap}
              onClick={() => onSetQuantity(Math.min(maxQuantity, quantity + 1))}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>

        {/* Cap message */}
        {atCap && (
          <p
            className="cap-message"
            role="status"
            aria-live="polite"
          >
            You have reached the {MAX_CUPS} cup limit
          </p>
        )}

        {/* CTA */}
        <button
          type="button"
          className="btn-primary sheet-cta"
          disabled={ctaDisabled}
          onClick={onConfirm}
        >
          {ctaLabel}
        </button>
      </section>
    </div>
  );
}
