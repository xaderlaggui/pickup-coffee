import { useEffect, useRef, useState } from "react"
import { motionDelay } from "../utils/motion"

export function useNavigation() {
  const [checkout, setCheckout] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [transition, setTransition] = useState("")
  const appRef = useRef<HTMLDivElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const later = (cb: () => void, ms: number) =>
    timers.current.push(setTimeout(cb, ms))

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const navigate = (next: "menu" | "cart") => {
    setTransition("leaving")
    later(() => {
      setCheckout(next !== "menu")
      setTransition(`entering-${next}`)
      appRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      window.scrollTo({ top: 0, behavior: "smooth" })
      later(() => setTransition(""), motionDelay(500))
    }, motionDelay(200))
  }

  return {
    checkout,
    setCheckout,
    confirmed,
    setConfirmed,
    transition,
    setTransition,
    navigate,
    appRef,
    later,
  }
}
