
import { Coffee } from "../types"

export function CoffeeCard({
  coffee,
  quantity,
  onAdd,
  index = 0,
}: {
  coffee: Coffee
  quantity: number
  onAdd: () => void
  index?: number
}) {


  return (
    <article className={`coffee-card ${coffee.tone} relative`} style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}>
      <button type="button" className="card-hitbox" aria-label={`Preview ${coffee.name}`} onClick={onAdd} />
      {quantity > 0 && <span key={quantity} className="count-badge tabular">{quantity}</span>}
      <div className="product-visual">
                <img src={coffee.image} alt={`${coffee.name} in a PICKUP COFFEE cup`} loading="lazy" decoding="async" width="240" height="240" />
      </div>
      <div className="card-copy">
        <p className="product-detail">{coffee.detail}</p>
        <h3>{coffee.name}</h3>
        <div className="price-row">
          <span>₱{coffee.price}</span>
          <button className="add-button" onClick={onAdd} type="button"><span aria-hidden="true">+</span> Add</button>
        </div>
      </div>
    </article>
  )
}