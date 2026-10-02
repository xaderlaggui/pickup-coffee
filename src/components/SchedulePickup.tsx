import { useCallback, useEffect, useRef, useState } from "react"
import { ClockIcon } from "./Icons"

/* ============================================================
   CONSTANTS
   ============================================================ */
const ITEM_H = 44        // px per row
const VISIBLE = 5        // must be odd — determines picker height
const PICKER_H = ITEM_H * VISIBLE  // 220px

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

/* ============================================================
   iOS DRUM-ROLL WHEEL PICKER
   - Direct DOM manipulation during drag (no React state churn)
   - CSS spring transition on release
   - Velocity-aware momentum + rubber-band edges
   ============================================================ */
function WheelPicker({
  items,
  selectedIndex,
  onChange,
  label,
  disabled,
}: {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
  label: string
  disabled?: boolean
}) {
  // The offset that centers item N:
  //   offset(N) = PICKER_H/2 - ITEM_H/2 - N * ITEM_H
  //             = (VISIBLE-1)/2 * ITEM_H - N * ITEM_H
  const centerOffset = (idx: number) =>
    Math.floor(VISIBLE / 2) * ITEM_H - idx * ITEM_H

  const trackRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(selectedIndex)

  // Keep a live ref to the current track Y so drag handlers always read fresh value
  const currentOffsetRef = useRef(centerOffset(selectedIndex))

  // Sync when parent changes selectedIndex (e.g. initial render or external set)
  useEffect(() => {
    const target = centerOffset(selectedIndex)
    currentOffsetRef.current = target
    if (trackRef.current) {
      trackRef.current.style.transition = "none"
      trackRef.current.style.transform = `translateY(${target}px)`
    }
    setHovered(selectedIndex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex])

  const drag = useRef({
    active: false,
    startClientY: 0,
    startOffset: 0,
    lastClientY: 0,
    lastTime: 0,
    velocity: 0,
  })

  const applyOffset = (offset: number, spring = false) => {
    if (!trackRef.current) return
    trackRef.current.style.transition = spring
      ? `transform 400ms var(--spring-snappy)`
      : "none"
    trackRef.current.style.transform = `translateY(${offset}px)`
  }

  const indexAtOffset = (offset: number) =>
    clamp(
      Math.round((Math.floor(VISIBLE / 2) * ITEM_H - offset) / ITEM_H),
      0,
      items.length - 1,
    )

  // ---- Drag lifecycle ----
  const onStart = useCallback((clientY: number) => {
    if (disabled) return
    const d = drag.current
    d.active = true
    d.startClientY = clientY
    d.startOffset = currentOffsetRef.current
    d.lastClientY = clientY
    d.lastTime = performance.now()
    d.velocity = 0
    applyOffset(currentOffsetRef.current) // disable transition
  }, [])

  const onMove = useCallback(
    (clientY: number) => {
      const d = drag.current
      if (!d.active) return

      const now = performance.now()
      const dt = now - d.lastTime
      if (dt > 0) d.velocity = (clientY - d.lastClientY) / dt
      d.lastClientY = clientY
      d.lastTime = now

      let raw = d.startOffset + (clientY - d.startClientY)

      // Rubber band at edges
      const maxOff = centerOffset(0)
      const minOff = centerOffset(items.length - 1)
      if (raw > maxOff) raw = maxOff + (raw - maxOff) * 0.25
      if (raw < minOff) raw = minOff + (raw - minOff) * 0.25

      applyOffset(raw)
      setHovered(indexAtOffset(raw))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length],
  )

  const onEnd = useCallback(() => {
    const d = drag.current
    if (!d.active) return
    d.active = false

    // Read current visual offset from the transform
    const track = trackRef.current
    if (!track) return
    const matrix = new DOMMatrix(getComputedStyle(track).transform)
    const currentY = matrix.m42

    // Add momentum
    const withMomentum = currentY + d.velocity * 80

    // Snap to nearest valid index
    const maxOff = centerOffset(0)
    const minOff = centerOffset(items.length - 1)
    const clamped = clamp(withMomentum, minOff, maxOff)
    const nearestIndex = indexAtOffset(clamped)
    const snapOffset = centerOffset(nearestIndex)

    currentOffsetRef.current = snapOffset
    applyOffset(snapOffset, true)
    setHovered(nearestIndex)
    onChange(nearestIndex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, onChange])

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => onStart(e.touches[0].clientY)
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    onMove(e.touches[0].clientY)
  }
  const onTouchEnd = () => onEnd()

  // Pointer (mouse / stylus) events
  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    onStart(e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    onMove(e.clientY)
  }
  const onPointerUp = () => onEnd()

  return (
    <div
      className="wheel-drum"
      role="listbox"
      aria-label={label}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: "none", cursor: disabled ? "not-allowed" : "grab", opacity: disabled ? 0.4 : 1, transition: "opacity 200ms" }}
    >
      {/* Scrollable track — items stacked vertically */}
      <div ref={trackRef} className="wheel-track">
        {items.map((item, i) => {
          const dist = Math.abs(i - hovered)
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.52 : dist === 2 ? 0.28 : 0.12
          const scale = dist === 0 ? 1 : dist === 1 ? 0.88 : dist === 2 ? 0.76 : 0.65
          return (
            <div
              key={item}
              role="option"
              aria-selected={i === selectedIndex}
              className={`wheel-row${i === hovered ? " wheel-row-selected" : ""}`}
              style={{ opacity, transform: `scale(${scale})` }}
            >
              {item}
            </div>
          )
        })}
      </div>

      {/* Frosted glass selection band (fixed at center) */}
      <div className="wheel-band" aria-hidden="true" />

      {/* Top & bottom fade masks */}
      <div className="wheel-fade-top" aria-hidden="true" />
      <div className="wheel-fade-bottom" aria-hidden="true" />
    </div>
  )
}

/* ============================================================
   SCHEDULE PICKUP — dynamic time filtering
   ============================================================ */
const days = ["Today", "Tomorrow"] as const

function generateTimeSlots(isToday: boolean) {
  const slots: string[] = isToday ? ["ASAP"] : []
  const now = new Date()
  const startHour = 8 // 8:00 AM
  const endHour = 18 // 6:00 PM

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === endHour && m > 0) continue // stop at exactly 6:00 PM
      
      const isPast = isToday && (now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m))
      if (!isPast) {
        const ampm = h >= 12 ? "PM" : "AM"
        const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
        const mins = m.toString().padStart(2, "0")
        slots.push(`${hour12}:${mins} ${ampm}`)
      }
    }
  }
  return slots.length > 0 ? slots : ["Closed"]
}

export function SchedulePickup({
  day,
  setDay,
  time,
  setTime,
}: {
  day: "Today" | "Tomorrow"
  setDay: (d: "Today" | "Tomorrow") => void
  time: string
  setTime: (t: string) => void
}) {
  const availableTimes = generateTimeSlots(day === "Today")
  
  // Auto-correct time if current selection is no longer available (e.g. past time or switched to Tomorrow with ASAP selected)
  useEffect(() => {
    if (!availableTimes.includes(time)) {
      setTime(availableTimes[0])
    }
  }, [availableTimes, time, setTime])

  // Lock day to Today if ASAP is selected
  useEffect(() => {
    if (time === "ASAP" && day !== "Today") {
      setDay("Today")
    }
  }, [time, day, setDay])

  const dayIndex = days.indexOf(day)
  const timeIndex = Math.max(0, availableTimes.indexOf(time))
  const isDayDisabled = time === "ASAP"

  return (
    <section className="schedule-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PICK UP</p>
          <h2>Schedule</h2>
        </div>
        <div className="clock-icon">
          <ClockIcon />
        </div>
      </div>

      <div className="wheel-pickers-row">
        <div className="wheel-column">
          <p className="wheel-column-label">Day</p>
          <WheelPicker
            label="Pickup day"
            items={[...days]}
            selectedIndex={dayIndex}
            onChange={(i) => !isDayDisabled && setDay(days[i])}
            disabled={isDayDisabled}
          />
        </div>
        <div className="wheel-divider" aria-hidden="true" />
        <div className="wheel-column">
          <p className="wheel-column-label">Time</p>
          <WheelPicker
            label="Pickup time"
            items={availableTimes}
            selectedIndex={timeIndex}
            onChange={(i) => setTime(availableTimes[i])}
          />
        </div>
      </div>

      <p className="picker-hint">
        {time === "ASAP"
          ? "We'll start brewing as soon as your order arrives."
          : time === "Closed"
          ? "We are currently closed for the day."
          : `Ready by ${time} — ${day}.`}
      </p>
    </section>
  )
}
