import { useCallback, useEffect, useRef, useState } from "react"

const ITEM_H = 44

const VISIBLE = 5

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function WheelPicker({
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
  const centerOffset = (index: number) =>
    Math.floor(VISIBLE / 2) * ITEM_H - index * ITEM_H

  const trackRef = useRef<HTMLDivElement>(null)

  const [hovered, setHovered] = useState(selectedIndex)

  const currentOffsetRef = useRef(centerOffset(selectedIndex))

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

  const onStart = useCallback(
    (clientY: number) => {
      if (disabled) return

      const state = drag.current

      state.active = true

      state.startClientY = clientY

      state.startOffset = currentOffsetRef.current

      state.lastClientY = clientY

      state.lastTime = performance.now()

      state.velocity = 0

      applyOffset(currentOffsetRef.current)
    },

    [disabled],
  )

  const onMove = useCallback(
    (clientY: number) => {
      const state = drag.current

      if (!state.active) return

      const now = performance.now()

      const deltaTime = now - state.lastTime

      if (deltaTime > 0) {
        state.velocity = (clientY - state.lastClientY) / deltaTime
      }

      state.lastClientY = clientY

      state.lastTime = now

      let rawOffset = state.startOffset + (clientY - state.startClientY)

      const maxOffset = centerOffset(0)

      const minOffset = centerOffset(items.length - 1)

      if (rawOffset > maxOffset) {
        rawOffset = maxOffset + (rawOffset - maxOffset) * 0.25
      }

      if (rawOffset < minOffset) {
        rawOffset = minOffset + (rawOffset - minOffset) * 0.25
      }

      applyOffset(rawOffset)

      setHovered(indexAtOffset(rawOffset))
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps

    [items.length],
  )

  const onEnd = useCallback(() => {
    const state = drag.current

    if (!state.active) return

    state.active = false

    const track = trackRef.current

    if (!track) return

    const matrix = new DOMMatrix(getComputedStyle(track).transform)

    const withMomentum = matrix.m42 + state.velocity * 80

    const maxOffset = centerOffset(0)

    const minOffset = centerOffset(items.length - 1)

    const clampedOffset = clamp(withMomentum, minOffset, maxOffset)

    const nearestIndex = indexAtOffset(clampedOffset)

    const snappedOffset = centerOffset(nearestIndex)

    currentOffsetRef.current = snappedOffset

    applyOffset(snappedOffset, true)

    setHovered(nearestIndex)

    onChange(nearestIndex)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, onChange])

  const onTouchStart = (event: React.TouchEvent) =>
    onStart(event.touches[0].clientY)

  const onTouchMove = (event: React.TouchEvent) => {
    event.preventDefault()

    onMove(event.touches[0].clientY)
  }

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId)

    onStart(event.clientY)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (drag.current.active) onMove(event.clientY)
  }

  return (
    <div
      className="wheel-drum"
      role="listbox"
      aria-label={label}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      style={{
        touchAction: "none",

        cursor: disabled ? "not-allowed" : "grab",

        opacity: disabled ? 0.4 : 1,

        transition: "opacity 200ms",
      }}
    >
      <div ref={trackRef} className="wheel-track">
        {items.map((item, index) => {
          const distance = Math.abs(index - hovered)

          const opacity =
            distance === 0
              ? 1
              : distance === 1
                ? 0.52
                : distance === 2
                  ? 0.28
                  : 0.12

          const scale =
            distance === 0
              ? 1
              : distance === 1
                ? 0.88
                : distance === 2
                  ? 0.76
                  : 0.65

          return (
            <div
              key={item}
              role="option"
              aria-selected={index === selectedIndex}
              className={`wheel-row${
                index === hovered ? " wheel-row-selected" : ""
              }`}
              style={{ opacity, transform: `scale(${scale})` }}
            >
              {item}
            </div>
          )
        })}
      </div>
      <div className="wheel-band" aria-hidden="true" />
      <div className="wheel-fade-top" aria-hidden="true" />
      <div className="wheel-fade-bottom" aria-hidden="true" />
    </div>
  )
}
