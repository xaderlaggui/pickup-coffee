import { useState, useEffect, useCallback } from "react";
import { PickupDay, Slot } from "../types";
import { generateSlots, isSlotValid } from "../lib/slots";

const STORAGE_KEY_DAY = "pc-pickup-day";
const STORAGE_KEY_SLOT = "pc-pickup-slot";

function readStoredDay(): PickupDay {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY_DAY);
    if (stored === "today" || stored === "tomorrow") return stored;
  } catch {
    // sessionStorage unavailable
  }
  return "today";
}

function readStoredSlotId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY_SLOT);
  } catch {
    return null;
  }
}

function persistDay(day: PickupDay): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_DAY, day);
  } catch {/* noop */}
}

function persistSlotId(id: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_SLOT, id);
  } catch {/* noop */}
}

export function usePickupSlots() {
  const [now, setNow] = useState(() => new Date());
  const [day, setDayRaw] = useState<PickupDay>(readStoredDay);
  const [selectedSlotId, setSelectedSlotIdRaw] = useState<string | null>(
    readStoredSlotId
  );
  // Expired notice shown when the previously selected slot disappears
  const [expiredNotice, setExpiredNotice] = useState(false);
  // Today closed notice
  const [todayClosed, setTodayClosed] = useState(false);

  const slots = generateSlots(now, day);
  const todaySlots = generateSlots(now, "today");
  const isTodayClosed = todaySlots.length === 0;

  // Auto-switch to tomorrow if today has no slots
  useEffect(() => {
    if (isTodayClosed && day === "today") {
      setDayRaw("tomorrow");
      setTodayClosed(true);
    }
  }, [isTodayClosed, day]);

  // Pick a default slot when slots change or no slot is selected
  const selectedSlot: Slot | null =
    slots.find((s) => s.id === selectedSlotId) ?? null;

  useEffect(() => {
    if (slots.length === 0) {
      setSelectedSlotIdRaw(null);
      return;
    }
    if (!selectedSlot) {
      // No valid selection - pick first available
      const first = slots[0];
      setSelectedSlotIdRaw(first.id);
      persistSlotId(first.id);
      return;
    }
    // Validate the existing selection
    if (!isSlotValid(selectedSlot, now, day)) {
      const first = slots[0];
      setSelectedSlotIdRaw(first.id);
      persistSlotId(first.id);
      setExpiredNotice(true);
      // Auto-hide the notice after 4 seconds
      const t = setTimeout(() => setExpiredNotice(false), 4000);
      return () => clearTimeout(t);
    }
  }, [slots, selectedSlot, now, day]);

  // Tick every minute aligned to the next minute boundary
  useEffect(() => {
    function scheduleNextTick() {
      const nowMs = Date.now();
      const msToNextMinute = 60_000 - (nowMs % 60_000);
      return setTimeout(() => {
        setNow(new Date());
        timerId = scheduleNextTick();
      }, msToNextMinute);
    }
    let timerId = scheduleNextTick();
    return () => clearTimeout(timerId);
  }, []);

  const setDay = useCallback((next: PickupDay) => {
    setDayRaw(next);
    persistDay(next);
    setExpiredNotice(false);
    setTodayClosed(false);
    // Reset slot selection when day changes
    setSelectedSlotIdRaw(null);
  }, []);

  const setSelectedSlot = useCallback((slot: Slot) => {
    setSelectedSlotIdRaw(slot.id);
    persistSlotId(slot.id);
  }, []);

  return {
    now,
    day,
    setDay,
    slots,
    selectedSlot,
    setSelectedSlot,
    expiredNotice,
    todayClosed,
    isTodayClosed,
  };
}
