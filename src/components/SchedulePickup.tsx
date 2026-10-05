import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { WheelPicker } from "./WheelPicker"
import { generateTimeSlots } from "../utils/pickupTime"
/* ============================================================
   SCHEDULE PICKUP
   ============================================================ */
const days = ["Today", "Tomorrow"] as const
type Day = typeof days[number]
const asap = "ASAP"
export function PickupReadyNote({ day, time }: { day: Day time: string }) {
  const message =
    time === "Closed"
      ? "Pickup is closed for today. Choose Tomorrow to place your order."
      : time === asap
        ? "We'll start preparing your order as soon as it arrives."
        : `Ready by ${time} — ${day}.`
  return (
    <p className="pickup-ready-note" role="note">
      <span className="pickup-ready-icon" aria-hidden="true">
        ?
      </span>
      <span>{message}</span>
    </p>
  )
}

export function SchedulePickup({
  day,
  setDay,
  time,
  setTime,
  darkMode,
}: {
  day: Day
  setDay: (d: Day) => void
  time: string
  setTime: (t: string) => void
  darkMode: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const generatedTimes = generateTimeSlots(day === "Today")
  const isClosed = day === "Today" && generatedTimes[0] === "Closed"
  const availableTimes = isClosed
    ? ["Closed"]
    : day === "Today"
      ? [asap, ...generatedTimes]
      : generatedTimes
  const displayedTime = isClosed
    ? "Closed"
    : time || (day === "Today" ? asap : availableTimes[0])
  // Auto-correct time when day changes and current time is no longer valid
  useEffect(() => {
    if (isClosed) {
      if (time !== "Closed") setTime("Closed")
    } else if (!availableTimes.includes(time)) {
      setTime(availableTimes[0])
    }
  }, [availableTimes, time, setTime, isClosed])
  const dayIndex = days.indexOf(day)
  const timeIndex = Math.max(0, availableTimes.indexOf(time))
  const selectDay = (index: number) => {
    const nextDay = days[index]
    setDay(nextDay)
    if (nextDay === "Today")
      setTime(generateTimeSlots(true)[0] === "Closed" ? "Closed" : asap)
    else if (time === asap) setTime(generateTimeSlots(false)[0])
    else if (time === "Closed") setTime(generateTimeSlots(false)[0])
  }
  useEffect(() => {
    if (!isEditing) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEditing(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [isEditing])
  return (
    <section className="schedule-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PICK UP</p>
          <h2>Schedule</h2>
        </div>
        <button
          className="schedule-edit-button"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isEditing}
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
      </div>
      <div className="schedule-summary" aria-live="polite">
        <span>{day}</span>
        <strong>{displayedTime}</strong>
      </div>
      {isEditing &&
        createPortal(
          <div
            className={`schedule-dialog-backdrop${darkMode ? " dark" : ""}`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsEditing(false)
            }}
          >
            <section
              className="schedule-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="schedule-dialog-title"
            >
              <div className="schedule-dialog-heading">
                <div>
                  <p className="eyebrow">PICK UP</p>
                  <h2 id="schedule-dialog-title">Edit schedule</h2>
                </div>
                <button
                  className="schedule-edit-button"
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Done
                </button>
              </div>
              <div className="wheel-pickers-row">
                <div className="wheel-column">
                  <p className="wheel-column-label">Day</p>
                  <WheelPicker
                    label="Pickup day"
                    items={[...days]}
                    selectedIndex={dayIndex}
                    onChange={selectDay}
                  />
                </div>
                <div className="wheel-divider" aria-hidden="true" />
                <div className="wheel-column">
                  <p className="wheel-column-label">Time</p>
                  <WheelPicker
                    label="Pickup time"
                    items={availableTimes}
                    selectedIndex={timeIndex}
                    onChange={(index) => setTime(availableTimes[index])}
                    disabled={isClosed}
                  />
                </div>
              </div>
              <p className="picker-hint">
                {displayedTime === asap
                  ? "ASAP is available for today."
                  : displayedTime === "Closed"
                    ? "We are currently closed for the day."
                    : `Ready by ${displayedTime} — ${day}.`}
              </p>
            </section>
          </div>,
          document.body,
        )}
    </section>
  )
}
