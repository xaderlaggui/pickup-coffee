import { Coffee } from "../types"
import { CoffeeCard } from "./CoffeeCard"

export function ProductGrid({ products, cart, onAdd, animationSeed = 0 }: { products: Coffee[]; cart: Record<number, number>; onAdd: (coffee: Coffee) => void; animationSeed?: number }) {
  return (
    <div className="coffee-grid" aria-live="polite">
      {products.map((coffee, index) => (
        <CoffeeCard coffee={coffee} key={`${coffee.id}-${animationSeed}`} index={index} onAdd={() => onAdd(coffee)} quantity={cart[coffee.id] || 0} />
      ))}
    </div>
  )
}