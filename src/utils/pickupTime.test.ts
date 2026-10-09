import { describe, expect, it } from "vitest"
import { generateTimeSlots } from "./pickupTime"

// Local-time Date so getHours()/getMinutes() are deterministic regardless of
// the machine's timezone.
const at = (hour: number, minute = 0) => new Date(2026, 0, 12, hour, minute)

describe("generateTimeSlots", () => {
  it("offers every 15-minute slot from 8:00 AM to 5:45 PM on a future day", () => {
    const slots = generateTimeSlots(false, at(0))
    expect(slots[0]).toBe("8:00 AM")
    expect(slots[slots.length - 1]).toBe("5:45 PM")
    expect(slots).toHaveLength(40)
  })

  it("drops slots already past when the day is today", () => {
    const slots = generateTimeSlots(true, at(12, 0))
    expect(slots[0]).toBe("12:15 PM")
    expect(slots).toHaveLength(40 - 17)
  })

  it("keeps only the final slot at 5:30 PM", () => {
    expect(generateTimeSlots(true, at(17, 30))).toEqual(["5:45 PM"])
  })

  it("returns Closed once the last slot has passed", () => {
    expect(generateTimeSlots(true, at(17, 45))).toEqual(["Closed"])
  })

  it("ignores the clock for a future day", () => {
    expect(generateTimeSlots(false, at(23, 59))).toHaveLength(40)
  })
})
