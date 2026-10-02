// Operating hours - single source of truth for slot generation and store status
export const OPEN_HOUR = 8;  // 8:00 AM
export const CLOSE_HOUR = 18; // 6:00 PM
export const PREP_BUFFER_MINUTES = 15; // minutes before first available ASAP slot
export const SLOT_INTERVAL_MINUTES = 15; // 15-minute increments

// Maximum cups per order
export const MAX_CUPS = 5;

// Asia/Manila time zone - ensures consistent behavior regardless of user device TZ
export const TIMEZONE = "Asia/Manila";

// Currency
export const CURRENCY = "PHP";
export const CURRENCY_SYMBOL = "\u20B1";

// Menu items
export const MENU_ITEMS = [
  {
    id: "americano",
    name: "Americano",
    detail: "Double espresso, water",
    description:
      "Bold double espresso over chilled water and ice. Clean, rich, and refreshing.",
    price: 75,
    image: "/assets/iced-americano.png",
    imageAlt: "Iced Americano in a Pickup Coffee cup",
    tone: "rose" as const,
  },
  {
    id: "latte",
    name: "Latte",
    detail: "Espresso, fresh milk",
    description:
      "Smooth espresso poured over fresh milk and ice for a creamy, refreshing finish.",
    price: 85,
    image: "/assets/iced-latte.png",
    imageAlt: "Iced Latte in a Pickup Coffee cup",
    tone: "cream" as const,
  },
  {
    id: "black-coffee",
    name: "Black Coffee",
    detail: "Freshly brewed",
    description:
      "Freshly brewed hot coffee with a balanced aroma and a comforting, full-bodied finish.",
    price: 65,
    image: "/assets/brewed-coffee.png",
    imageAlt: "Brewed coffee in a Pickup Coffee cup",
    tone: "green" as const,
  },
] as const;

export type MenuItem = (typeof MENU_ITEMS)[number];
export type MenuItemId = MenuItem["id"];
export type MenuItemTone = MenuItem["tone"];
