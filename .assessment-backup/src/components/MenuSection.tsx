import { useMemo, useState } from "react"
import type { RefObject } from "react"
import { Coffee, MenuFilter } from "../types"
import { MenuFilters } from "./MenuFilters"
import { ProductGrid } from "./ProductGrid"

const headings: Record<MenuFilter, { title: string; subtitle: string }> = {
  "best-sellers": { title: "Our best sellers", subtitle: "Customer favorites, freshly made" },
  coffee: { title: "Coffee", subtitle: "Espresso, lattes, and signature cups" },
  "non-coffee": { title: "Non-coffee", subtitle: "Matcha, tea, milk, and yogurt drinks" },
  pastry: { title: "Pastries", subtitle: "Fresh Pickup Bites to pair with your drink" },
}

export function MenuSection({ products, cart, onAdd, menuRef }: { products: Coffee[]; cart: Record<number, number>; onAdd: (coffee: Coffee) => void; menuRef: RefObject<HTMLElement | null> }) {
  const [active, setActive] = useState<MenuFilter>("best-sellers")
  const [animationSeed, setAnimationSeed] = useState(0)
  const visibleProducts = useMemo(() => active === "best-sellers" ? products.filter((product) => product.isBestSeller) : products.filter((product) => product.category === active), [active, products])
  const heading = headings[active]
  const changeFilter = (filter: MenuFilter) => {
    setActive(filter)
    setAnimationSeed((seed) => seed + 1)
  }

  return (
    <section ref={menuRef} className="menu-section" id="menu" aria-labelledby="menu-title"><div className="menu-heading"><div><p className="eyebrow">ORDER ONLINE</p><h2 id="menu-title">{heading.title}</h2></div><span>{heading.subtitle}</span></div><MenuFilters active={active} onChange={changeFilter} />
      <ProductGrid products={visibleProducts} cart={cart} onAdd={onAdd} animationSeed={animationSeed} />
    </section>
  )
}