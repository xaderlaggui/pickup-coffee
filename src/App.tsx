import { useEffect, useMemo, useRef, useState } from "react"
import { coffees } from "./data"
import { Coffee } from "./types"
import { prefersReducedMotion, motionDelay } from "./utils/motion"
import { SunIcon, MoonIcon, ChevronIcon, CartIcon } from "./components/Icons"
import { RollingNumber, CountPrice } from "./components/MotionText"
import { GlassRefractionDefs } from "./components/GlassRefractionDefs"
import { CoffeeCard } from "./components/CoffeeCard"
import { BottomSheet } from "./components/BottomSheet"
import { OrderSuccess } from "./components/OrderSuccess"
import { SchedulePickup } from "./components/SchedulePickup"

/* ============================================================
   APP ROOT
   ============================================================ */
export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeCoffee, setActiveCoffee] = useState<Coffee | null>(null)
  const [sheetQuantity, setSheetQuantity] = useState(1)
  const [sheetTemp, setSheetTemp] = useState<"Iced" | "Hot">("Iced")
  const [cart, setCart] = useState<Record<number, number>>({})
  const [cartTemps, setCartTemps] = useState<Record<number, "Iced" | "Hot">>({})
  const [cartNotes, setCartNotes] = useState<Record<number, string>>({})
  const [sheetNote, setSheetNote] = useState("")
  const [day, setDay] = useState<"ASAP" | "Today" | "Tomorrow">("ASAP")
  const [time, setTime] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [name, setName] = useState("")
  const [payment, setPayment] = useState("Cash at pickup")
  const [closing, setClosing] = useState(false)
  const [transition, setTransition] = useState("")
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(0)
  const [limit, setLimit] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [titleCollapsed, setTitleCollapsed] = useState(false)
  const [barHidden, setBarHidden] = useState(false)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const headerRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (callback: () => void, duration: number) => {
    timers.current.push(setTimeout(callback, duration))
  }

  /* ---- Scroll-driven header glass + title collapse ---- */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 8)

      // Collapse large title when hero h1 scrolls out of view
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom
        setTitleCollapsed(heroBottom < 94)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /* ---- Hide order bar when footer enters view (mobile only) ---- */
  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return
    const observer = new IntersectionObserver(
      ([entry]) => setBarHidden(entry.isIntersecting),
      // trigger as soon as 1px of the footer is visible
      { threshold: 0 }
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  /* ---- Pointer-follow specular highlight (glass surfaces) ---- */
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion()) return
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty("--mx", `${x}%`)
      document.documentElement.style.setProperty("--my", `${y}%`)
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  /* ---- DeviceOrientation tilt (mobile specular shift) ---- */
  useEffect(() => {
    if (!("DeviceOrientationEvent" in window) || prefersReducedMotion()) return
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return
      const x = 50 + e.gamma * 0.8   // gamma: -90 to 90
      const y = 50 + e.beta * 0.4    // beta: -180 to 180
      document.documentElement.style.setProperty("--mx", `${Math.max(0, Math.min(100, x))}%`)
      document.documentElement.style.setProperty("--my", `${Math.max(0, Math.min(100, y))}%`)
    }
    window.addEventListener("deviceorientation", handleOrientation, { passive: true })
    return () => window.removeEventListener("deviceorientation", handleOrientation)
  }, [])

  /* ---- Helpers ---- */
  const showLimit = () => {
    setLimit((value) => value + 1)
    later(() => setLimit(0), 1000)
  }

  const closeSheet = () => {
    if (closing) return
    setClosing(true)
    later(() => {
      setActiveCoffee(null)
      setClosing(false)
    }, motionDelay(380))
  }

  const navigate = (next: boolean) => {
    if (transition) return
    setTransition(next ? "leaving-menu" : "leaving-checkout")
    later(() => {
      setCheckout(next)
      setTransition(next ? "entering-checkout" : "entering-menu")
      later(() => setTransition(""), motionDelay(500))
    }, motionDelay(200))
  }

  const submit = () => {
    if (loading || cupCount === 0) return
    if (!name.trim()) {
      setInvalid((value) => value + 1)
      document.getElementById("pickup-name")?.focus()
      return
    }
    setLoading(true)
    later(() => {
      setTransition("screen-out")
      later(() => {
        setConfirmed(true)
        setLoading(false)
        setTransition("")
      }, motionDelay(220))
    }, 600)
  }

  const cupCount = Object.values(cart).reduce((sum, count) => sum + count, 0)
  const total = useMemo(
    () =>
      coffees.reduce(
        (sum, coffee) => sum + coffee.price * (cart[coffee.id] || 0),
        0,
      ),
    [cart],
  )

  const openSheet = (coffee: Coffee) => {
    setClosing(false)
    setActiveCoffee(coffee)
    setSheetQuantity(cart[coffee.id] || (cupCount < 5 ? 1 : 0))
    setSheetTemp(cartTemps[coffee.id] || "Iced")
    setSheetNote(cartNotes[coffee.id] || "")
  }

  const addToCart = () => {
    if (!activeCoffee || closing) return
    const coffeeId = activeCoffee.id
    const selectedTemp = sheetTemp
    later(
      () => {
        setCart((current) => ({
          ...current,
          [coffeeId]: Math.min(
            sheetQuantity,
            5 - cupCount + (current[coffeeId] || 0),
          ),
        }))
        setCartTemps((current) => ({ ...current, [coffeeId]: selectedTemp }))
        setCartNotes((current) => ({ ...current, [coffeeId]: sheetNote.trim() }))
      },
      motionDelay(380),
    )
    closeSheet()
  }

  const restart = () => {
    setTransition("screen-out")
    later(() => {
      setCart({})
      setCartTemps({})
      setCartNotes({})
      setDay("ASAP")
      setTime("")
      setConfirmed(false)
      setCheckout(false)
      setName("")
      setPayment("Cash at pickup")
      setInvalid(0)
      setTransition("")
    }, motionDelay(220))
  }

  /* ---- Success screen ---- */
  if (confirmed) {
    return (
      <div className={`${darkMode ? "app dark" : "app"} ${transition}`}>
        <GlassRefractionDefs />
        <OrderSuccess
          amount={total}
          cups={cupCount}
          onRestart={restart}
          pickup={day === "ASAP" ? "ASAP" : `${day} · ${time}`}
          name={name.trim()}
          payment={payment}
          cart={cart}
        />
      </div>
    )
  }

  const sheetOpen = !!activeCoffee

  return (
    <div
      className={`${darkMode ? "app dark" : "app"} ${transition === "screen-out" ? transition : ""
        }`}
    >
      <GlassRefractionDefs />

      {/* ---- HEADER ---- */}
      <header
        ref={headerRef}
        className={`top-header ${scrolled ? "scrolled" : ""} ${titleCollapsed ? "title-collapsed" : ""
          }`}
      >
        <div className="header-inner">
          <button className="wordmark" onClick={restart} type="button">
            PICKUP
            <br />
            COFFEE
          </button>


          <div className="header-actions">
            {cupCount > 0 && !checkout && (
              <button
                className="desktop-cart-button"
                onClick={() => {
                  if (!checkout) navigate(true)
                }}
                type={checkout ? "submit" : "button"}
                form={checkout ? "checkout-form" : undefined}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="loading-dots">
                    <i /><i /><i />
                  </span>
                ) : (
                  <>
                    <CartIcon />
                    <span className="cart-badge">{cupCount}</span>
                  </>
                )}
              </button>
            )}
            <button
              aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
              className="theme-toggle"
              onClick={() => setDarkMode((current) => !current)}
              type="button"
            >
              <span
                className={`theme-icon ${darkMode ? "visible" : "hidden-icon"}`}
              >
                <SunIcon />
              </span>
              <span
                className={`theme-icon ${darkMode ? "hidden-icon" : "visible"}`}
              >
                <MoonIcon />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ---- MAIN CONTENT ---- */}
      <main
        ref={mainRef}
        className={`main-content ${transition} ${sheetOpen ? "sheet-open" : ""}`}
      >
        {!checkout ? (
          <section className="menu-section">
            <div ref={heroRef} className="hero-copy">
              <p className="eyebrow">SKIP THE LINE</p>
              <h1>
                Great coffee.
                <br />
                Ready when you are.
              </h1>
              <p className="hero-subtitle">
                Pick your favorites and we'll take care of the rest.
              </p>
            </div>

            <div className="menu-heading">
              <h2>Coffee menu</h2>
              <span>Freshly made</span>
            </div>
            <div className="coffee-grid">
              {coffees.map((coffee) => (
                <CoffeeCard
                  coffee={coffee}
                  key={coffee.id}
                  onAdd={() => openSheet(coffee)}
                  quantity={cart[coffee.id] || 0}
                />
              ))}
            </div>
          </section>
        ) : (
          <form
            id="checkout-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
          >
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(false)}
            >
              ← Back to coffee menu
            </button>
            <div className="hero-copy">
              <h1>Checkout</h1>
              <p className="hero-subtitle">
                A few details, then we'll get brewing.
              </p>
            </div>
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                Your order{" "}
                <span className="checkout-cup-count">
                  {cupCount} / 5 cups
                </span>
              </h2>
              {coffees
                .filter((coffee) => cart[coffee.id] > 0)
                .map((coffee) => (
                  <button
                    key={coffee.id}
                    type="button"
                    onClick={() => openSheet(coffee)}
                    className="cart-row"
                  >
                    <span>
                      {cart[coffee.id]} × {coffee.name}
                      <span className="cart-temp-badge">{cartTemps[coffee.id] || "Iced"}</span>
                      {cartNotes[coffee.id] && <span className="cart-note-badge">Notes added</span>}
                      <span className="cart-edit-hint">Edit</span>
                    </span>
                    <strong className="tabular">₱{cart[coffee.id] * coffee.price}</strong>
                  </button>
                ))}
              <div className="cart-total">
                <span>Total</span>
                <CountPrice value={total} />
              </div>
            </section>
            <SchedulePickup
              day={day}
              setDay={setDay}
              setTime={setTime}
              time={time}
            />
            <section className="checkout-section details-section">
              <h2 className="checkout-section-title">Your details</h2>
              <label
                className="name-field"
                htmlFor="pickup-name"
              >
                Name for pickup
                <input
                  id="pickup-name"
                  aria-invalid={invalid > 0 && !name.trim()}
                  required
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    if (event.target.value.trim()) setInvalid(0)
                  }}
                  className={`name-input ${invalid
                    ? `invalid-field ${invalid % 2 ? "shake-odd" : "shake-even"
                    }`
                    : ""
                    }`}
                />
              </label>
              <fieldset className="payment-fieldset">
                <legend className="payment-legend">
                  Payment method
                </legend>
                <p className="payment-note">
                  Pay at the counter when you pick up your coffee.
                </p>
                <div className="payment-options">
                  {["Cash at pickup", "Card at pickup"].map((option) => (
                    <label
                      key={option}
                      className={`payment-card ${payment === option ? "selected" : ""
                        }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option}
                        checked={payment === option}
                        onChange={() => setPayment(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <button
              type="submit"
              className="primary-button place-order-btn"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="loading-dots" role="status" aria-label="Placing order">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <>
                  Place order · <CountPrice value={total} />
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="app-footer" ref={footerRef}>
        <div className="footer-content">
          <div className="footer-col footer-logo-col">
            <img
              src="/assets/footer/pickupcoffee-vertical.svg"
              alt="Pickup Coffee"
              className="footer-logo"
            />
          </div>

          <div className="footer-col footer-nav-col">
            <nav className="footer-socials" aria-label="Social media links">
              <a href="https://x.com/pickupcoffeeph" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <img src="/assets/footer/x.svg" alt="" />
              </a>
              <a href="https://www.instagram.com/pickupcoffeeph/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <img src="/assets/footer/instagram.svg" alt="" />
              </a>
              <a href="https://www.youtube.com/@pickupcoffeeph" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <img src="/assets/footer/youtube.svg" alt="" />
              </a>
              <a href="https://www.tiktok.com/@pickupcoffee%20" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <img src="/assets/footer/tiktok.svg" alt="" />
              </a>
            </nav>
            <div className="footer-copyright">
              <span className="footer-copyright-c">&copy;</span>
              <img
                src="/assets/footer/pickupcoffee-horizontal.svg"
                alt="Pickup Coffee"
                className="footer-logo-horizontal"
              />
              <span className="footer-copyright-text">all rights reserved</span>
            </div>
          </div>

          <div className="footer-col footer-news-col footer-news-col--desktop">
            <h3 className="footer-news-title">XADER LAGGUI</h3>
            <p className="footer-news-subtitle">Aspiring Web Developer</p>
            <button className="footer-news-btn" onClick={() => window.open("https://xaderlaggui.vercel.app", "_blank")}>My Portfolio</button>
          </div>
        </div>
      </footer>

      {/* ---- ORDER BAR — floating glass capsule ---- */}
      <aside
        className={`order-bar ${cupCount > 0 && !checkout ? "active" : ""} ${limit ? "at-limit" : ""} ${barHidden ? "bar-hidden" : ""}`}
      >
        <div
          key={limit ? `limit-${limit}` : "bar"}
          className="order-bar-inner"
        >
          <div
            key={limit}
            className={`cup-progress ${limit ? "limit-shake" : ""}`}
            aria-hidden="true"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <i className={index < cupCount ? "filled" : ""} key={index} />
            ))}
          </div>
          <div className="order-copy">
            <span id="order-bar-label">YOUR ORDER</span>
            <strong aria-live="polite" aria-atomic="true">
              {limit ? (
                "Max 5 cups"
              ) : cupCount > 0 ? (
                <>
                  <RollingNumber value={cupCount} /> / 5 cups · ₱<CountPrice value={total} />
                </>
              ) : (
                "Add at least 1 cup"
              )}
            </strong>
          </div>
          {cupCount > 0 ? (
            <button
              className="checkout-button"
              onClick={() => {
                if (!checkout) navigate(true)
              }}
              type={checkout ? "submit" : "button"}
              form={checkout ? "checkout-form" : undefined}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span
                  className="loading-dots"
                  role="status"
                  aria-label="Placing order"
                >
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <span className="price-crossfade">
                  {checkout ? "Place order" : "Checkout"} ·{" "}
                  <CountPrice value={total} />
                </span>
              )}
              <ChevronIcon />
            </button>
          ) : (
            <button
              className="checkout-button disabled"
              disabled
              type="button"
              aria-label="Add at least 1 cup to checkout"
            >
              Checkout
            </button>
          )}
        </div>
      </aside>

      {/* ---- BOTTOM SHEET ---- */}
      {activeCoffee && (
        <BottomSheet
          coffee={activeCoffee}
          max={5 - cupCount + (cart[activeCoffee.id] || 0)}
          existing={cart[activeCoffee.id] || 0}
          closing={closing}
          onLimit={showLimit}
          onAdd={addToCart}
          onClose={closeSheet}
          quantity={sheetQuantity}
          setQuantity={setSheetQuantity}
          temp={sheetTemp}
          setTemp={setSheetTemp}
          note={sheetNote}
          setNote={setSheetNote}
        />
      )}
    </div>
  )
}
