import { Coffee } from "./types"
import { coffeeProducts } from "./data/coffee"
import { nonCoffeeProducts } from "./data/nonCoffee"
import { sortProductsByTone } from "./data/tone"

export const coffees: Coffee[] = sortProductsByTone([...coffeeProducts, ...nonCoffeeProducts])
