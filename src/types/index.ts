export type CoffeeSize = "Small" | "Medium" | "Large"
export type ProductCategory = "coffee" | "non-coffee" | "pastry"
export type MenuFilter = "best-sellers" | ProductCategory
export type Coffee = {
  id: number
  name: string
  detail: string
  description: string
  price: number
  image: string
  tone: string
  category: ProductCategory
  isBestSeller?: boolean
}
