/**
 * Slot generation logic - pure, testable, no side effects.
 * All times are computed in Asia/Manila (UTC+8).
 *
 * Usage examples (unit-style comments):
 *
 *   now = 9:07 AM today
 *   generateSlots(now, "today")
 *   => ["ASAP", "9:15 AM", "9:30 AM", ..., "5:45 PM"]
 *   (first timed slot = 9:15 AM, because 9:07 + 15min buffer = 9:22 -> next 15-min boundary = 9:30?
 *    Wait: 9:07 + 15 = 9:22 -> ceil to next 15-min boundary -> 9:30 AM
 *    Actually: next 15-min boundary after 9:22 is 9:30. So slots start at 9:30.)
 *
 *   now = 5:50 PM today
 *   generateSlots(now, "today")
 *   => [] (store effectively closed - all slots expired)
 *   (5:50 + 15 = 6:05 -> past CLOSE_HOUR, no valid slots remain)
 *
 *   now = 7:30 AM today
 *   generateSlots(now, "today")
 *   => ["ASAP", "8:00 AM", "8:15 AM", ..., "5:45 PM"]
 *   (before open: first timed slot = 8:00 AM; ASAP shown because store opens within buffer)
 *   Actually for ASAP: ASAP shown only if store is currently open and at least one slot remains.
 *   At 7:30 store is not open yet -> no ASAP. First slot = 8:00 AM.
 *   generateSlots(now, "today") => ["8:00 AM", "8:15 AM", ..., "5:45 PM"]
 *
 *   now = 12:00 AM today
 *   generateSlots(now, "today")
 *   => ["8:00 AM", "8:15 AM", ..., "5:45 PM"]
 *   (store closed at midnight, no ASAP, all day slots available)
 *
 *   generateSlots(anyTime, "tomorrow")
 *   => ["8:00 AM", "8:15 AM", ..., "5:45 PM"]
 *   (tomorrow: full day, no ASAP)
 */

import {
  OPEN_HOUR,
  CLOSE_HOUR,
  PREP_BUFFER_MINUTES,
  SLOT_INTERVAL_MINUTES,
  TIMEZONE,
} from "../config";
import { Slot, PickupDay } from "../types";

/** Format a Date to "9:15 AM" in Manila time. No leading zero on hour. */
export function formatSlotTime(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIMEZONE,
  }).format(date);
}

/** Get current Manila time components. */
function getManilaComponents(date: Date): {
  hours: number;
  minutes: number;
  totalMinutes: number;
} {
  const formatter = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: TIMEZONE,
  });
  const parts = formatter.formatToParts(date);
  const hours = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minutes = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0"
  );
  return { hours, minutes, totalMinutes: hours * 60 + minutes };
}

/** Round up minutes to next N-minute boundary. */
function ceilToInterval(minutes: number, interval: number): number {
  return Math.ceil(minutes / interval) * interval;
}

/**
 * Build an ISO 8601 string with +08:00 offset for a given time-of-day on the
 * relevant calendar date. Avoids using device locale for date construction.
 */
function buildManilaISO(date: Date, day: PickupDay, slotMinutes: number): string {
  // Get the Manila date string for today or tomorrow
  const manilaDateFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIMEZONE,
  });

  const manilaToday = manilaDateFormatter.format(date);
  let targetDate: string;

  if (day === "today") {
    targetDate = manilaToday;
  } else {
    // tomorrow in Manila: add 1 day to the Manila date
    const tomorrowDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    // Handle DST-safe date increment via Manila date
    targetDate = manilaDateFormatter.format(tomorrowDate);
  }

  const hh = String(Math.floor(slotMinutes / 60)).padStart(2, "0");
  const mm = String(slotMinutes % 60).padStart(2, "0");
  return `${targetDate}T${hh}:${mm}:00+08:00`;
}

/** Returns true if the store is currently open (Manila time). */
export function isStoreOpen(now: Date): boolean {
  const { hours } = getManilaComponents(now);
  return hours >= OPEN_HOUR && hours < CLOSE_HOUR;
}

/** Returns the store status label for display. */
export function getStoreStatusLabel(now: Date): string {
  const { hours } = getManilaComponents(now);
  if (hours >= OPEN_HOUR && hours < CLOSE_HOUR) {
    return `Open now, until ${CLOSE_HOUR > 12 ? CLOSE_HOUR - 12 : CLOSE_HOUR}:00 ${CLOSE_HOUR >= 12 ? "PM" : "AM"}`;
  }
  if (hours < OPEN_HOUR) {
    return `Opens today at ${OPEN_HOUR}:00 AM`;
  }
  return `Opens tomorrow at ${OPEN_HOUR}:00 AM`;
}

/**
 * Pure slot generation function.
 * @param now - Current date/time (any timezone; Manila is derived internally)
 * @param day - "today" | "tomorrow"
 * @returns Array of Slot objects in chronological order
 */
export function generateSlots(now: Date, day: PickupDay): Slot[] {
  const { hours: nowHours, totalMinutes: nowTotalMinutes } =
    getManilaComponents(now);

  const openMinutes = OPEN_HOUR * 60;  // 480
  // Last slot starts 15 min before close (5:45 PM = 17*60+45 = 1065)
  const lastSlotMinutes = CLOSE_HOUR * 60 - SLOT_INTERVAL_MINUTES; // 1065

  const slots: Slot[] = [];

  if (day === "tomorrow") {
    // Tomorrow: all slots from open to last, no ASAP
    for (
      let m = openMinutes;
      m <= lastSlotMinutes;
      m += SLOT_INTERVAL_MINUTES
    ) {
      slots.push({
        id: String(m),
        label: formatSlotTime(new Date(buildManilaISO(now, "tomorrow", m))),
        isAsap: false,
        isoTime: buildManilaISO(now, "tomorrow", m),
      });
    }
    return slots;
  }

  // Today
  const storeOpen = nowHours >= OPEN_HOUR && nowHours < CLOSE_HOUR;

  // First available timed slot = next 15-min boundary after (now + prep buffer),
  // clamped to at least 8:00 AM
  const earliestMinutes = Math.max(
    openMinutes,
    ceilToInterval(nowTotalMinutes + PREP_BUFFER_MINUTES, SLOT_INTERVAL_MINUTES)
  );

  // Check if at least one timed slot remains
  const hasTimedSlots = earliestMinutes <= lastSlotMinutes;

  // ASAP: only offered when store is open AND at least one slot remains
  if (storeOpen && hasTimedSlots) {
    slots.push({
      id: "ASAP",
      label: "ASAP",
      isAsap: true,
      isoTime: "ASAP",
    });
  }

  if (!hasTimedSlots) {
    // Store closed for today (all timed slots expired)
    return [];
  }

  for (
    let m = earliestMinutes;
    m <= lastSlotMinutes;
    m += SLOT_INTERVAL_MINUTES
  ) {
    slots.push({
      id: String(m),
      label: formatSlotTime(new Date(buildManilaISO(now, "today", m))),
      isAsap: false,
      isoTime: buildManilaISO(now, "today", m),
    });
  }

  return slots;
}

/**
 * Returns true if the given slot is still valid at `now`.
 * ASAP is valid whenever the store is open and slots exist.
 * Timed slots are valid when their time is in the future (now + prep buffer).
 */
export function isSlotValid(slot: Slot, now: Date, day: PickupDay): boolean {
  if (slot.isAsap) {
    return isStoreOpen(now) && generateSlots(now, day).some((s) => !s.isAsap);
  }
  // For timed slots, check if still in the valid range
  const { totalMinutes: nowMinutes } = getManilaComponents(now);
  const slotMinutes = parseInt(slot.id);
  return (
    slotMinutes >=
    Math.max(
      OPEN_HOUR * 60,
      ceilToInterval(nowMinutes + PREP_BUFFER_MINUTES, SLOT_INTERVAL_MINUTES)
    )
  );
}
