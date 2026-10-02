import React, { useEffect, useRef, useState } from "react"
import { motionDelay } from "../utils/motion"

/* ============================================================
   SPRING-POWERED ROLLING NUMBER
   Digits roll with blur at mid-point (iOS numeric content transition)
   ============================================================ */
export function RollingNumber({ value }: { value: number }) {
  const previous = useRef(value)
  const old = previous.current
  useEffect(() => {
    previous.current = value
  }, [value])
  return (
    <span className="rolling-number" aria-label={String(value)} key={value}>
      <span className="roll-old" aria-hidden="true">
        {old}
      </span>
      <span className="roll-new" aria-hidden="true">
        {value}
      </span>
    </span>
  )
}


/* ============================================================
   CROSSFADE TEXT
   ============================================================ */
export function CrossfadeText({ text }: { text: string }) {
  const previous = useRef(text)
  const old = previous.current
  useEffect(() => {
    previous.current = text
  }, [text])
  return (
    <span key={text} className="crossfade-text" aria-label={text}>
      <span className="crossfade-old" aria-hidden="true">
        {old}
      </span>
      <span className="crossfade-new" aria-hidden="true">
        {text}
      </span>
    </span>
  )
}


/* ============================================================
   COUNT-UP PRICE — tabular-nums, spring-eased
   ============================================================ */
export function CountPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const current = useRef(value)
  useEffect(() => {
    const from = current.current
    let frame = 0
    const start = performance.now()
    const duration = motionDelay(320)
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // spring-style ease: ease-out cubic
      const ease = 1 - (1 - t) ** 3
      current.current = Math.round(from + (value - from) * ease)
      setDisplay(current.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return (
    <span aria-label={`₱${value}`} className="tabular">
      ₱<span aria-hidden="true">{display}</span>
    </span>
  )
}

