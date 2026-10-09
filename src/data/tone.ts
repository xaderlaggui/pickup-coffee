import { Coffee, ProductCategory, ProductTone } from "../types"

const matchaWords = ["matcha", "pistachio", "apple iced tea", "green apple"]
const roseWords = ["strawberry", "berry", "lychee", "peach", "watermelon", "ube"]
const honeyWords = ["caramel", "honey lemon", "mango", "brown sugar", "milk tea", "boba", "vanilla"]
const cocoaWords = ["chocolate", "mocha", "oreo", "cacao", "coffee jelly", "biscoff", "milo"]

export function resolveProductTone(name: string, category: ProductCategory): ProductTone {
  const value = name.toLowerCase()
  if (category === "pastry") return value.includes("cookie") ? "honey" : "cream"
  if (matchaWords.some((word) => value.includes(word))) return "matcha"
  if (roseWords.some((word) => value.includes(word))) return "rose"
  if (honeyWords.some((word) => value.includes(word))) return "honey"
  if (cocoaWords.some((word) => value.includes(word))) return "cocoa"
  return "sage"
}

const toneOrder: ProductTone[] = ["matcha", "sage", "rose", "honey", "cocoa", "cream"]
export function sortProductsByTone(products: Coffee[]): Coffee[] {
  return [...products].sort((a, b) => {
    const toneDifference = toneOrder.indexOf(a.tone) - toneOrder.indexOf(b.tone)
    return toneDifference || a.name.localeCompare(b.name)
  })
}
