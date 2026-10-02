import { CURRENCY_SYMBOL, TIMEZONE } from "../config";

/** Format a price as "₱75" with tabular numerals. */
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount}`;
}

/** Format a Manila date/time for display in the confirmation screen. */
export function formatPickupLabel(isoTime: string, day: "today" | "tomorrow"): string {
  if (isoTime === "ASAP") {
    const dayLabel = day === "today" ? "Today" : "Tomorrow";
    return `${dayLabel}, ASAP`;
  }
  const date = new Date(isoTime);
  const timeLabel = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIMEZONE,
  }).format(date);
  const dayLabel = day === "today" ? "Today" : "Tomorrow";
  return `${dayLabel}, ${timeLabel}`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Generate a short pseudo-random order ID. */
export function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "PC-";
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
