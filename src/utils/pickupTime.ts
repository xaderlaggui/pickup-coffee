// `now` is injectable so callers (and tests) can pin the clock; it defaults to
// the current local time, which is what every app call site relies on.
export function generateTimeSlots(isToday: boolean, now: Date = new Date()) {
  const slots: string[] = []

  const startHour = 8

  const endHour = 18 // 6:00 PM close; last bookable slot is 5:45 PM

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const isPast =
        isToday &&
        (now.getHours() > hour ||
          (now.getHours() === hour && now.getMinutes() >= minute))

      if (isPast) continue

      const meridiem = hour >= 12 ? "PM" : "AM"

      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour

      slots.push(`${hour12}:${minute.toString().padStart(2, "0")} ${meridiem}`)
    }
  }

  return slots.length > 0 ? slots : ["Closed"]
}
