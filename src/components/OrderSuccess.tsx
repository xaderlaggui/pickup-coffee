import React from "react"
import { coffees } from "../data"
import type { CoffeeSize } from "../types"
import { itemPrice } from "../utils/cart"
import { CheckIcon } from "./Icons"
import { Price } from "./Price"

export function OrderSuccess({ items, amount, pickup, onRestart, name, contact, payment, cart, cartSizes }: { items: number; amount: number; pickup: string; onRestart: () => void; name: string; contact: string; payment: string; cart: Record<number, number>; cartSizes: Record<number, CoffeeSize> }) {
  return (
    <main className="success-screen">
      <div className="success-content">
        <div className="success-mark"><CheckIcon /></div>
        <p className="eyebrow">ORDER #PC-2418</p>
        <h1>Order Confirmed</h1>
        <p className="success-lead">Your coffee is in the queue. We'll have it ready when you arrive.</p>
        <div className="success-summary">
          <div><span>Name</span><strong>{name}</strong></div>
          {contact && <div><span>Contact</span><strong>{contact}</strong></div>}
          {coffees.filter((coffee) => cart[coffee.id] > 0).map((coffee) => <div key={coffee.id}><span>{cart[coffee.id]} × {coffee.name}</span><strong className="tabular"><Price value={itemPrice(coffee, cartSizes[coffee.id] || "Medium") * cart[coffee.id]} /></strong></div>)}
          <div><span>Payment</span><strong>{payment}</strong></div>
          <div><span>Total Items</span><strong className="tabular">{items}</strong></div>
          <div><span>Total Amount</span><strong className="tabular"><Price value={amount} /></strong></div>
          <div><span>Pickup Time</span><strong>{pickup}</strong></div>
        </div>
        <button className="primary-button" onClick={onRestart} type="button">Start New Order</button>
      </div>
    </main>
  )
}