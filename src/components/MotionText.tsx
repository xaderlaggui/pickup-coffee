import { useEffect, useRef, useState } from "react"
import { motionDelay } from "../utils/motion"
import { formatPrice, PESO_SYMBOL } from "./Price"

export function RollingNumber({ value }: { value: number }) {
  const previous = useRef(value)
  const old = previous.current
  useEffect(() => { previous.current = value }, [value])
  return <span className="rolling-number" aria-label={String(value)} key={value}><span className="roll-old" aria-hidden="true">{old}</span><span className="roll-new" aria-hidden="true">{value}</span></span>
}

export function CrossfadeText({ text }: { text: string }) {
  const previous = useRef(text)
  const old = previous.current
  useEffect(() => { previous.current = text }, [text])
  return <span key={text} className="crossfade-text" aria-label={text}><span className="crossfade-old" aria-hidden="true">{old}</span><span className="crossfade-new" aria-hidden="true">{text}</span></span>
}

export function CountPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const current = useRef(value)
  useEffect(() => {
    const from = current.current
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / motionDelay(320))
      current.current = Math.round(from + (value - from) * (1 - (1 - t) ** 3))
      setDisplay(current.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <span aria-label={formatPrice(value)} className="tabular">{PESO_SYMBOL}<span aria-hidden="true">{display}</span></span>
}