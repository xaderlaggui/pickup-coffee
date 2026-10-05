import { useEffect, useRef, useState } from "react"

export function useScrollTracking() {
  const [scrolled, setScrolled] = useState(false)
  const [titleCollapsed, setTitleCollapsed] = useState(false)
  const [barHidden, setBarHidden] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      setTitleCollapsed(
        (heroRef.current?.getBoundingClientRect().bottom || 0) < 94,
      )
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!footerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setBarHidden(entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])

  return { scrolled, titleCollapsed, barHidden, heroRef, footerRef }
}
