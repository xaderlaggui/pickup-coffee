import { Coffee } from "./types"

import latteImg from "./assets/iced-latte.png"
import americanoImg from "./assets/iced-americano.png"
import blackCoffeeImg from "./assets/brewed-coffee.png"

export const coffees: Coffee[] = [
  {
    id: 1,
    name: "Latte",
    detail: "Espresso · fresh milk",
    price: 85,
    image: latteImg,
    tone: "cream",
  },
  {
    id: 2,
    name: "Americano",
    detail: "Double espresso · water",
    price: 75,
    image: americanoImg,
    tone: "rose",
  },
  {
    id: 3,
    name: "Black Coffee",
    detail: "Freshly brewed · hot",
    price: 65,
    image: blackCoffeeImg,
    tone: "green",
  },
]

export const times = ["ASAP", "08:15 AM", "08:30 AM", "08:45 AM", "09:00 AM"]
