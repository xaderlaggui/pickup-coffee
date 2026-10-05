import { Coffee } from "../types"
import { Price } from "./Price"

export function PairWith({
  products,
  cart,
  onAdd,
}: {
  products: Coffee[]
  cart: Record<number, number>
  onAdd: (coffee: Coffee) => void
}) {
  const suggestions = products.filter((coffee) => coffee.category === "pastry").slice(0, 5)

  return (
    <section className="pair-with-section" aria-labelledby="pair-with-title">
      <h2 id="pair-with-title">Pair it with</h2>
      <div className="pair-with-list">
        {suggestions.map((coffee) => (
          <article className="pair-with-item" key={coffee.id}>
            <img src={coffee.image} alt="" loading="lazy" decoding="async" />
            <strong>{coffee.name}</strong>
            <div className="pair-with-action">
              <Price value={coffee.price} />
              <button
                type="button"
                onClick={() => onAdd(coffee)}
                aria-label={`Add ${coffee.name} to your order${cart[coffee.id] ? `, currently ${cart[coffee.id]} in cart` : ""}`}
              >
                Add
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
