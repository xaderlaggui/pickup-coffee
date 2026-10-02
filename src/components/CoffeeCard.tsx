import { useRef, useState } from "react";
import { MenuItem } from "../config";
import { MAX_CUPS } from "../config";
import { formatPrice } from "../lib/format";

interface CoffeeCardProps {
  item: MenuItem;
  quantity: number;
  onOpen: () => void;
  atCap: boolean;
}

export default function CoffeeCard({ item, quantity, onOpen, atCap }: CoffeeCardProps) {
  const [shaking, setShaking] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (atCap && quantity === 0) {
      // Shake the button to indicate cap is reached
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onOpen();
  };

  return (
    <article
      className="coffee-card"
      role="button"
      tabIndex={0}
      aria-label={`${item.name}, ${formatPrice(item.price)}. ${quantity > 0 ? `${quantity} in order.` : ""} Press to customize.`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* Quantity badge */}
      {quantity > 0 && (
        <span className="count-badge num" aria-hidden="true">
          {quantity}
        </span>
      )}

      {/* Product image */}
      <div className={`card-visual tone-${item.tone}`}>
        <img
          src={item.image}
          alt={item.imageAlt}
          className="card-image"
          width={240}
          height={200}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Card text */}
      <div className="card-body">
        <p className="card-detail">{item.detail}</p>
        <h3 className="card-name">{item.name}</h3>
        <div className="card-footer">
          <span className="card-price num">{formatPrice(item.price)}</span>
          <button
            ref={addBtnRef}
            type="button"
            className={`card-add-btn${shaking ? " shake" : ""}`}
            onClick={handleAddClick}
            aria-label={`Add ${item.name} to order`}
            aria-disabled={atCap && quantity === 0}
          >
            {quantity > 0 ? "Edit" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

interface MenuGridProps {
  items: readonly MenuItem[];
  cart: Record<string, number>;
  totalQuantity: number;
  onOpenItem: (item: MenuItem) => void;
}

export function MenuGrid({ items, cart, totalQuantity, onOpenItem }: MenuGridProps) {
  const atCap = totalQuantity >= MAX_CUPS;

  return (
    <section aria-label="Coffee menu">
      <div className="section-header">
        <h2 className="section-title">Coffee menu</h2>
        <span className="section-badge">Freshly made</span>
      </div>

      {atCap && (
        <div
          className="cap-message"
          role="status"
          aria-live="polite"
        >
          You have reached the {MAX_CUPS} cup limit. Edit an existing item to change quantities.
        </div>
      )}

      {/* Aria live region for quantity updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {totalQuantity > 0
          ? `${totalQuantity} of ${MAX_CUPS} cups selected`
          : "No cups selected"}
      </div>

      <div className="coffee-grid">
        {items.map((item) => (
          <CoffeeCard
            key={item.id}
            item={item}
            quantity={cart[item.id] ?? 0}
            onOpen={() => onOpenItem(item)}
            atCap={atCap && (cart[item.id] ?? 0) === 0}
          />
        ))}
      </div>
    </section>
  );
}
