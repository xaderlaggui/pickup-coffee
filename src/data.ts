import { Coffee } from "./types"

export const coffees: Coffee[] = [
  {
    id: 1,
    name: "Iced Latte",
    detail: "Espresso · fresh milk",
    price: 110,
    image: "/assets/iced-latte.png",
    tone: "cream",
  },
  {
    id: 2,
    name: "Iced Americano",
    detail: "Double espresso · water",
    price: 85,
    image: "/assets/iced-americano.png",
    tone: "rose",
  },
  {
    id: 3,
    name: "Brewed Coffee",
    detail: "Freshly brewed · hot",
    price: 75,
    image: "/assets/brewed-coffee.png",
    tone: "green",
  },
]

export const times = ["ASAP", "08:15 AM", "08:30 AM", "08:45 AM", "09:00 AM"]
