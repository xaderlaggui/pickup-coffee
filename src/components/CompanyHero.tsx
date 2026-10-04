import { useCallback, useEffect, useMemo, useState } from "react"
import type { PointerEvent, RefObject } from "react"
import type { Coffee } from "../types"
import { Price } from "./Price"
import { ReviewStrip } from "./ReviewStrip"

const ROTATION_MS = 4500
const SWIPE_THRESHOLD = 48

export function CompanyHero({ menuRef, heroRef, products }: { menuRef: RefObject<HTMLElement | null>; heroRef: RefObject<HTMLDivElement | null>; products: Coffee[] }) {
  const [position, setPosition] = useState(1)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [trackTransition, setTrackTransition] = useState(true)
  const [startX, setStartX] = useState(0)
  const featured = useMemo(() => products.filter((product) => product.isBestSeller).slice(0, 6), [products])
  const slides = featured.length > 1 ? [featured[featured.length - 1], ...featured, featured[0]] : featured
  const activeIndex = featured.length ? (position - 1 + featured.length) % featured.length : 0
  const product = featured[activeIndex]

  useEffect(() => {
    if (featured.length < 2 || isDragging) return
    let timer: number | undefined
    const start = () => { timer = window.setInterval(() => setPosition((current) => current + 1), ROTATION_MS) }
    const stop = () => { if (timer !== undefined) window.clearInterval(timer) }
    const onVisibility = () => { stop(); if (!document.hidden) start() }
    if (!document.hidden) start()
    document.addEventListener("visibilitychange", onVisibility)
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility) }
  }, [featured.length, isDragging])

  const handleTrackEnd = () => {
    if (position === slides.length - 1) {
      setTrackTransition(false)
      setPosition(1)
      requestAnimationFrame(() => setTrackTransition(true))
    } else if (position === 0) {
      setTrackTransition(false)
      setPosition(featured.length)
      requestAnimationFrame(() => setTrackTransition(true))
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setStartX(event.clientX)
    setDragX(0)
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isDragging) setDragX(event.clientX - startX)
  }
  const onPointerUp = () => {
    const delta = dragX
    setIsDragging(false)
    setDragX(0)
    if (Math.abs(delta) < SWIPE_THRESHOLD) return
    setTrackTransition(true)
    setPosition((current) => current + (delta < 0 ? 1 : -1))
  }
  const onPointerCancel = () => { setIsDragging(false); setDragX(0) }
  const orderHere = useCallback(() => menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), [menuRef])

  return (
    <section ref={heroRef} className="company-hero" aria-labelledby="company-hero-title">
      <div className="company-hero-copy">
        <p className="eyebrow">PICKUP COFFEE</p>
        <h1 id="company-hero-title">Premium coffee, made for every day.</h1>
        <p className="hero-subtitle">Fast, delicious, high-quality drinks and bites, ready when you are.</p>
        <div className="hero-highlights" aria-label="Pickup Coffee offerings"><span>Coffee</span><span>Non-coffee</span><span>Pickup Bites</span></div>
        <button className="primary-button company-hero-cta" type="button" onClick={orderHere}>Order Here</button>
      </div>
      <div className="company-hero-visual" tabIndex={0} role="group" aria-label={`Featured product: ${product?.name || "Pickup Coffee"}`}>
        <div className="company-hero-orbit orbit-one" />
        <div className="company-hero-orbit orbit-two" />
        <div className="hero-carousel-viewport" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onTransitionEnd={handleTrackEnd}>
          <div className="hero-carousel-track" style={{ transform: `translate3d(calc(-${position * 100}% + ${dragX}px), 0, 0)`, transition: isDragging || !trackTransition ? "none" : "transform 520ms cubic-bezier(.72,0,.24,1)" }}>
            {slides.map((slide, index) => <div className="hero-carousel-slide" key={`${slide.id}-${index}`}><img className="company-hero-cup" src={slide.image} alt={slide.name} draggable="false" /></div>)}
          </div>
        </div>
        <div className="hero-product-label" aria-live="polite"><span>Featured today</span><strong>{product?.name || "Pickup Coffee"}</strong></div>
        {product && <div className="hero-product-info"><strong>{product.name}</strong><p>{product.description}</p><Price className="price" value={product.price} /></div>}
      </div>
      <ReviewStrip />
    </section>
  )
}