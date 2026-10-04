import { MenuFilter } from "../types"

const filters: Array<{ id: MenuFilter; label: string }> = [
  { id: "best-sellers", label: "Best Sellers" },
  { id: "coffee", label: "Coffee" },
  { id: "non-coffee", label: "Non-Coffee" },
  { id: "pastry", label: "Pastry" },
]

export function MenuFilters({ active, onChange }: { active: MenuFilter; onChange: (filter: MenuFilter) => void }) {
  return (
    <div className="menu-filters" aria-label="Product categories" role="tablist">
      {filters.map((filter) => (
        <button key={filter.id} className={active === filter.id ? "active" : ""} type="button" role="tab" aria-selected={active === filter.id} onClick={() => onChange(filter.id)}>
          {filter.label}
        </button>
      ))}
    </div>
  )
}