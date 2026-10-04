export type CoffeeSize = "Small" | "Medium" | "Large"
export type ProductCategory = "coffee" | "non-coffee" | "pastry"
export type ProductTone = "sage" | "matcha" | "rose" | "honey" | "cream" | "cocoa"
export type MenuFilter = "best-sellers" | ProductCategory
export type Coffee = {
  id: number
  name: string
  detail: string
  description: string
  price: number
  image: string
  tone: ProductTone
  category: ProductCategory
  isBestSeller?: boolean
}
