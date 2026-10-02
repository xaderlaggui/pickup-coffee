import { MenuItemId } from "./config";

// Theme preference
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

// Cart
export type CartItem = {
  id: MenuItemId;
  quantity: number;
};

export type Cart = Record<MenuItemId, number>;

// Pickup slots
export type PickupDay = "today" | "tomorrow";

export type Slot = {
  id: string;         // unique key e.g. "ASAP" or "09:15"
  label: string;      // display e.g. "ASAP" or "9:15 AM"
  isAsap: boolean;
  // ISO 8601 datetime string with +08:00 offset, or "ASAP"
  isoTime: string;
};

// Order payload (typed for API submission)
export type OrderItem = {
  id: MenuItemId;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type OrderPayload = {
  items: OrderItem[];
  totalQuantity: number;
  totalAmount: number;
  currency: "PHP";
  pickup: {
    day: PickupDay;
    time: string; // ISO 8601 with +08:00 or "ASAP"
    asap: boolean;
  };
  customerName: string;
  paymentMethod: "Cash at pickup" | "Card at pickup";
  createdAt: string; // ISO 8601
};

export type OrderResponse = {
  orderId: string;
  status: "confirmed";
};

// App screen flow
export type AppScreen =
  | "welcome"
  | "menu"
  | "checkout"
  | "submitting"
  | "confirmation";

// Form validation
export type ValidationErrors = {
  name?: string;
  slot?: string;
};
