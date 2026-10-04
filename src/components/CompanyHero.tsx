import { RefObject } from "react"

export function CompanyHero({ menuRef, heroRef }: { menuRef: RefObject<HTMLElement | null>; heroRef: RefObject<HTMLDivElement | null> }) {
  const orderHere = () => menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <section ref={heroRef} className="company-hero" aria-labelledby="company-hero-title">
      <div className="company-hero-copy">
        <p className="eyebrow">PICKUP COFFEE</p>
        <h1 id="company-hero-title">Premium coffee, made for every day.</h1>
        <p className="hero-subtitle">Fast, delicious, high-quality drinks and bites, ready when you are.</p>
        <button className="primary-button company-hero-cta" type="button" onClick={orderHere}>Order Here</button>
      </div>
      <div className="company-hero-visual" aria-hidden="true">
        <div className="company-hero-orbit orbit-one" />
        <div className="company-hero-orbit orbit-two" />
        <img className="company-hero-cup" src="https://d1r9lpkrafbxq0.cloudfront.net/strapi-cms-readable-media/signatures_kape_kastila_52c8296c39_2b453f1af6.png" alt="Kape Kastila" />
      </div>
    </section>
  )
}