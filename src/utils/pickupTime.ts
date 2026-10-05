export function generateTimeSlots(isToday: boolean) {
  const slots: string[] = []

  const now = new Date()

  const startHour = 8

  const endHour = 18

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === endHour && minute > 0) continue

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
