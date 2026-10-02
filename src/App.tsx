import { useEffect, useMemo, useRef, useState } from "react"
import { coffees } from "./data"
import { Coffee } from "./types"
import { prefersReducedMotion, motionDelay } from "./utils/motion"
import { SunIcon, MoonIcon, ChevronIcon } from "./components/Icons"
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
  const [cart, setCart] = useState<Record<number, number>>({})
  const [day, setDay] = useState<"Today" | "Tomorrow">("Today")
  const [time, setTime] = useState("ASAP")
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

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const headerRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

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
        setTitleCollapsed(heroBottom < 70)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
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
  }

  const addToCart = () => {
    if (!activeCoffee || closing) return
    const coffeeId = activeCoffee.id
    later(
      () =>
        setCart((current) => ({
          ...current,
          [coffeeId]: Math.min(
            sheetQuantity,
            5 - cupCount + (current[coffeeId] || 0),
          ),
        })),
      motionDelay(380),
    )
    closeSheet()
  }

  const restart = () => {
    setTransition("screen-out")
    later(() => {
      setCart({})
      setDay("Today")
      setTime("ASAP")
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
          pickup={`${day} · ${time}`}
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

          {/* Inline title that appears when large title scrolls away */}
          <span className="header-inline-title" aria-hidden="true">
            PICKUP COFFEE
          </span>

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
          </form>
        )}
      </main>

      {/* ---- ORDER BAR — floating glass capsule ---- */}
      <aside
        className={`order-bar ${cupCount > 0 ? "active" : ""} ${limit ? "at-limit" : ""
          }`}
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
            <span>YOUR ORDER</span>
            <strong aria-live="polite">
              {limit ? (
                "Max 5 cups"
              ) : (
                <>
                  <RollingNumber value={cupCount} /> / 5 cups selected
                </>
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
            <button className="checkout-button disabled" disabled type="button">
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
        />
      )}
    </div>
  )
}
