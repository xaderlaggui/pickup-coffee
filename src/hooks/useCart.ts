import { useEffect, useRef, useState } from "react"
import type { Coffee, CoffeeSize } from "../types"
import {
  cartTotal,
  cupCount as computeCupCount,
  itemCount as computeItemCount,
} from "../utils/cart"

type CartTemps = Record<number, "Iced" | "Hot">
type CartSizes = Record<number, CoffeeSize>
type CartNotes = Record<number, string>

export function useCart(coffees: Coffee[]) {
  const [cart, setCart] = useState<Record<number, number>>({})
  const [cartTemps, setCartTemps] = useState<CartTemps>({})
  const [cartSizes, setCartSizes] = useState<CartSizes>({})
  const [cartNotes, setCartNotes] = useState<CartNotes>({})
  const [limit, setLimit] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cups = computeCupCount(coffees, cart)
  const items = computeItemCount(cart)
  const total = cartTotal(coffees, cart, cartSizes)

  const showLimit = () => {
    setLimit((v) => v + 1)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLimit(0), 1000)
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const updateQuantity = (id: number, delta: number) => {
    const item = coffees.find((c) => c.id === id)
    setCart((current) => {
      const next = { ...current }
      const qty = (next[id] || 0) + delta
      if (qty <= 0) return next
      const drinks = coffees
        .filter((c) => c.category !== "pastry")
        .reduce((sum, c) => sum + (c.id === id ? qty : next[c.id] || 0), 0)
      if (item?.category !== "pastry" && drinks > 5) {
        showLimit()
        return current
      }
      next[id] = qty
      return next
    })
  }

  const removeItem = (id: number) => {
    setCart((c) => {
      const n = { ...c }
      delete n[id]
      return n
    })
    setCartTemps((c) => {
      const n = { ...c }
      delete n[id]
      return n
    })
    setCartSizes((c) => {
      const n = { ...c }
      delete n[id]
      return n
    })
    setCartNotes((c) => {
      const n = { ...c }
      delete n[id]
      return n
    })
  }

  const setItemTemp = (id: number, temp: "Iced" | "Hot") =>
    setCartTemps((c) => ({ ...c, [id]: temp }))

  const setItemSize = (id: number, size: CoffeeSize) =>
    setCartSizes((c) => ({ ...c, [id]: size }))

  const setItemNote = (id: number, note: string) =>
    setCartNotes((c) => ({ ...c, [id]: note }))

  const setCartItem = (
    id: number,
    quantity: number,
    temp: "Iced" | "Hot",
    size: CoffeeSize,
    note: string,
  ) => {
    setCart((c) => ({ ...c, [id]: quantity }))
    setItemTemp(id, temp)
    setItemSize(id, size)
    setItemNote(id, note.trim())
  }

  const resetCart = () => {
    setCart({})
    setCartTemps({})
    setCartSizes({})
    setCartNotes({})
  }

  return {
    cart,
    cartTemps,
    cartSizes,
    cartNotes,
    cups,
    items,
    total,
    limit,
    updateQuantity,
    removeItem,
    setCartItem,
    resetCart,
    showLimit,
  }
}
