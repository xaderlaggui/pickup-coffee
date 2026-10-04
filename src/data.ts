import { Coffee } from "./types"
import { coffeeProducts } from "./data/coffee"
import { nonCoffeeProducts } from "./data/nonCoffee"
import { sortProductsByTone } from "./data/tone"

export const coffees: Coffee[] = sortProductsByTone([...coffeeProducts, ...nonCoffeeProducts])

export const times = ["ASAP", "08:15 AM", "08:30 AM", "08:45 AM", "09:00 AM"]
