import { Coffee, CoffeeSize } from "../types"
import { CountPrice } from "./MotionText"
import { TrashIcon } from "./Icons"

export function CartView({ coffees, cart, cartTemps, cartSizes, cartNotes, cupCount, itemCount, total, swipedItem, setSwipedItem, removeItem, updateQuantity, itemPrice }: {
  coffees: Coffee[]; cart: Record<number, number>; cartTemps: Record<number, "Iced" | "Hot">; cartSizes: Record<number, CoffeeSize>; cartNotes: Record<number, string>; cupCount: number; itemCount: number; total: number; swipedItem: number | null; setSwipedItem: (id: number | null) => void; removeItem: (id: number) => void; updateQuantity: (id: number, delta: number) => void; itemPrice: (coffee: Coffee, size: CoffeeSize) => number
}) {
  return (
    <section className="cart-section">
      <div className="cart-items-list">
        {coffees.filter((coffee) => cart[coffee.id] > 0).map((coffee) => {
          const qty = cart[coffee.id]
          const isSwiped = swipedItem === coffee.id
          return <div key={coffee.id} className={`cart-list-item-wrap ${isSwiped ? "swiped" : ""}`} onTouchStart={(event) => { (event.currentTarget as HTMLElement).dataset.touchX = String(event.touches[0].clientX) }} onTouchEnd={(event) => { const start = Number((event.currentTarget as HTMLElement).dataset.touchX || 0); const dx = start - event.changedTouches[0].clientX; if (dx > 60) setSwipedItem(coffee.id); if (dx < -30) setSwipedItem(null) }}>
            <button className="swipe-delete-btn" type="button" onClick={() => { removeItem(coffee.id); setSwipedItem(null) }} aria-label="Remove item"><TrashIcon />Remove</button>
            <div className="cart-list-item glass-regular">
              <img src={coffee.image} alt={coffee.name} className="cart-item-img" />
              <div className="cart-item-details"><h3>{coffee.name}</h3><p className="cart-item-meta">{coffee.category === "pastry" ? "Pastry" : cartTemps[coffee.id] || "Iced"}{cartNotes[coffee.id] && <span> · {cartNotes[coffee.id]}</span>}</p><p className="cart-item-price">₱{itemPrice(coffee, cartSizes[coffee.id] || "Medium") * qty}</p></div>
              <div className="cart-item-actions"><div className="quantity-adjuster"><button type="button" className={qty === 1 ? "qty-trash" : ""} onClick={() => qty === 1 ? removeItem(coffee.id) : updateQuantity(coffee.id, -1)} aria-label={qty === 1 ? "Remove item" : "Decrease quantity"}>{qty === 1 ? <TrashIcon /> : "-"}</button><span>{qty}</span><button type="button" onClick={() => updateQuantity(coffee.id, 1)} disabled={coffee.category !== "pastry" && cupCount >= 5}>+</button></div></div>
            </div>
          </div>
        })}
      </div>
      <div className="cart-breakdown">
        {coffees.filter((coffee) => cart[coffee.id] > 0).map((coffee) => <div key={coffee.id} className="cart-breakdown-row"><span>{coffee.name} x{cart[coffee.id]}</span><span>₱{itemPrice(coffee, cartSizes[coffee.id] || "Medium") * cart[coffee.id]}</span></div>)}
        <div className="cart-breakdown-divider" />
        <div className="cart-breakdown-row cart-breakdown-total"><span>Total ({itemCount} {itemCount === 1 ? "item" : "items"})</span><span><CountPrice value={total} /></span></div>
      </div>
    </section>
  )
}