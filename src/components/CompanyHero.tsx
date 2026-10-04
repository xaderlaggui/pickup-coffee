import { useCallback, useEffect, useMemo, useState } from "react"
import type { RefObject } from "react"
import type { Coffee } from "../types"
import { Price } from "./Price"
import { ReviewStrip } from "./ReviewStrip"

const ROTATION_MS = 4500

export function CompanyHero({ menuRef, heroRef, products }: { menuRef: RefObject<HTMLElement | null>; heroRef: RefObject<HTMLDivElement | null>; products: Coffee[] }) {
  const [position, setPosition] = useState(1)
  const [trackTransition, setTrackTransition] = useState(true)
  const featured = useMemo(() => products.filter((product) => product.isBestSeller).slice(0, 6), [products])
  const slides = featured.length > 1 ? [featured[featured.length - 1], ...featured, featured[0]] : featured
  const activeIndex = featured.length ? (position - 1 + featured.length) % featured.length : 0
  const product = featured[activeIndex]

  useEffect(() => {
    if (featured.length < 2) return
    let timer: number | undefined
    const start = () => { timer = window.setInterval(() => setPosition((current) => current + 1), ROTATION_MS) }
    const stop = () => { if (timer !== undefined) window.clearInterval(timer) }
    const onVisibility = () => { stop(); if (!document.hidden) start() }
    if (!document.hidden) start()
    document.addEventListener("visibilitychange", onVisibility)
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility) }
  }, [featured.length])

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

  const orderHere = useCallback(() => menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), [menuRef])

  return (
    <section ref={heroRef} className="company-hero" aria-labelledby="company-hero-title">
      <div className="company-hero-copy">
        <h1 id="company-hero-title">Premium coffee, made for every day.</h1>
        <p className="hero-subtitle">Fast, delicious, high-quality drinks and bites, ready when you are.</p>
        <div className="hero-highlights" aria-label="Pickup Coffee offerings"><span>Coffee</span><span>Non-coffee</span><span>Pickup Bites</span></div>
        <button className="primary-button company-hero-cta" type="button" onClick={orderHere}>Order Here</button>
      </div>
      <div className="company-hero-visual" role="group" aria-label={`Featured product: ${product?.name || "Pickup Coffee"}`}>
        <div className="hero-flip-inner">
          <div className="hero-flip-front">
            <div className="company-hero-orbit orbit-one" />
            <div className="company-hero-orbit orbit-two" />
            <div className="hero-carousel-viewport" onTransitionEnd={handleTrackEnd}>
              <div className="hero-carousel-track" style={{ transform: `translate3d(-${position * 100}%, 0, 0)`, transition: !trackTransition ? "none" : "transform 520ms cubic-bezier(.72,0,.24,1)" }}>
                {slides.map((slide, index) => <div className="hero-carousel-slide" key={`${slide.id}-${index}`}><img className="company-hero-cup" src={slide.image} alt={slide.name} draggable="false" /></div>)}
              </div>
            </div>
            <div className="hero-product-label" aria-live="polite"><span>Featured today</span><strong>{product?.name || "Pickup Coffee"}</strong></div>
          </div>
          {product && <div className="hero-flip-back"><span className="eyebrow">Featured today</span><strong>{product.name}</strong><p>{product.description}</p><Price className="price" value={product.price} /></div>}
        </div>
      </div>
      <ReviewStrip />
    </section>
  )
}