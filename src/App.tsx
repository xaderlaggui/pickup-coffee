import { useEffect, useMemo, useRef, useState } from "react"
import { coffees } from "./data"
import { Coffee, CoffeeSize } from "./types"
import { motionDelay } from "./utils/motion"
import { GlassRefractionDefs } from "./components/GlassRefractionDefs"
import { AppHeader } from "./components/AppHeader"
import { AppFooter } from "./components/AppFooter"
import { CheckoutFooter } from "./components/CheckoutFooter"
import { BottomSheetHost } from "./components/BottomSheetHost"
import { CompanyHero } from "./components/CompanyHero"
import { MenuSection } from "./components/MenuSection"
import { CartView } from "./components/CartView"
import { CheckoutView } from "./components/CheckoutView"
import { ConfirmOrderModal } from "./components/ConfirmOrderModal"
import { OrderSuccess } from "./components/OrderSuccess"

const sizeAdjustment = (size: CoffeeSize) => size === "Small" ? -10 : size === "Large" ? 10 : 0
const itemPrice = (coffee: Coffee, size: CoffeeSize) => coffee.category === "pastry" ? coffee.price : coffee.price + sizeAdjustment(size)

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeCoffee, setActiveCoffee] = useState<Coffee | null>(null)
  const [sheetQuantity, setSheetQuantity] = useState(1)
  const [sheetTemp, setSheetTemp] = useState<"Iced" | "Hot">("Iced")
  const [sheetSize, setSheetSize] = useState<CoffeeSize>("Medium")
  const [sheetNote, setSheetNote] = useState("")
  const [cart, setCart] = useState<Record<number, number>>({})
  const [cartTemps, setCartTemps] = useState<Record<number, "Iced" | "Hot">>({})
  const [cartSizes, setCartSizes] = useState<Record<number, CoffeeSize>>({})
  const [cartNotes, setCartNotes] = useState<Record<number, string>>({})
  const [checkout, setCheckout] = useState(false)
  const [review, setReview] = useState(false)
  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [day, setDay] = useState<"Today" | "Tomorrow">("Today")
  const [time, setTime] = useState("ASAP")
  const [name, setName] = useState("")
  const [payment, setPayment] = useState("Cash at pickup")
  const [closing, setClosing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(0)
  const [limit, setLimit] = useState(0)
  const [transition, setTransition] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [titleCollapsed, setTitleCollapsed] = useState(false)
  const [barHidden, setBarHidden] = useState(false)
  const [swipedItem, setSwipedItem] = useState<number | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const headerRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const appRef = useRef<HTMLDivElement>(null)

  const later = (callback: () => void, duration: number) => timers.current.push(setTimeout(callback, duration))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 8); setTitleCollapsed((heroRef.current?.getBoundingClientRect().bottom || 0) < 94) }
    window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll)
  }, [])
useEffect(() => {
    if (!footerRef.current) return
    const observer = new IntersectionObserver(([entry]) => setBarHidden(entry.isIntersecting), { threshold: 0 })
    observer.observe(footerRef.current); return () => observer.disconnect()
  }, [])

  const showLimit = () => { setLimit((value) => value + 1); later(() => setLimit(0), 1000) }
  const closeSheet = () => { if (closing) return; setClosing(true); later(() => { setActiveCoffee(null); setClosing(false) }, motionDelay(380)) }
  const navigate = (next: "menu" | "cart" | "review") => { setTransition("leaving"); later(() => { setCheckout(next !== "menu"); setReview(next === "review"); setTransition(`entering-${next}`); appRef.current?.scrollTo({ top: 0, behavior: "smooth" }); window.scrollTo({ top: 0, behavior: "smooth" }); later(() => setTransition(""), motionDelay(500)) }, motionDelay(200)) }
  const cupCount = coffees.filter((coffee) => coffee.category !== "pastry").reduce((sum, coffee) => sum + (cart[coffee.id] || 0), 0)
  const itemCount = Object.values(cart).reduce((sum, count) => sum + count, 0)
  const total = useMemo(() => coffees.reduce((sum, coffee) => sum + itemPrice(coffee, cartSizes[coffee.id] || "Medium") * (cart[coffee.id] || 0), 0), [cart, cartSizes])
  const openSheet = (coffee: Coffee) => { setClosing(false); setActiveCoffee(coffee); setSheetQuantity(cart[coffee.id] || (coffee.category === "pastry" || cupCount < 5 ? 1 : 0)); setSheetTemp(cartTemps[coffee.id] || "Iced"); setSheetSize("Medium"); setSheetNote(cartNotes[coffee.id] || "") }
  const addToCart = () => { if (!activeCoffee || closing) return; const coffee = activeCoffee; later(() => { setCart((current) => ({ ...current, [coffee.id]: Math.min(sheetQuantity, coffee.category === "pastry" ? 99 : 5 - cupCount + (current[coffee.id] || 0)) })); setCartTemps((current) => ({ ...current, [coffee.id]: sheetTemp })); setCartSizes((current) => ({ ...current, [coffee.id]: sheetSize })); setCartNotes((current) => ({ ...current, [coffee.id]: sheetNote.trim() })) }, motionDelay(380)); closeSheet() }
  const updateQuantity = (id: number, delta: number) => { const item = coffees.find((coffee) => coffee.id === id); setCart((current) => { const next = { ...current }; const quantity = (next[id] || 0) + delta; if (quantity <= 0) return next; const drinks = coffees.filter((coffee) => coffee.category !== "pastry").reduce((sum, coffee) => sum + (coffee.id === id ? quantity : next[coffee.id] || 0), 0); if (item?.category !== "pastry" && drinks > 5) { showLimit(); return current } next[id] = quantity; return next }) }
  const removeItem = (id: number) => { setCart((current) => { const next = { ...current }; delete next[id]; return next }); setCartTemps((current) => { const next = { ...current }; delete next[id]; return next }); setCartSizes((current) => { const next = { ...current }; delete next[id]; return next }); setCartNotes((current) => { const next = { ...current }; delete next[id]; return next }) }
  const submit = (event?: React.FormEvent) => { event?.preventDefault(); if (time === "Closed" || !name.trim() || loading || itemCount === 0) { if (!name.trim()) setInvalid((value) => value + 1); return } setLoading(true); later(() => { setConfirmed(true); setLoading(false) }, 600) }
  const requestOrderConfirmation = (event?: React.FormEvent) => {
    event?.preventDefault()
    if (time === "Closed") return
    if (!name.trim() || loading || itemCount === 0) {
      if (!name.trim()) setInvalid((value) => value + 1)
      return
    }
    setConfirmOrderOpen(true)
  }
  const restart = () => { setCart({}); setCartTemps({}); setCartSizes({}); setCartNotes({}); setConfirmed(false); setCheckout(false); setReview(false); setConfirmOrderOpen(false); setName(""); setDay("Today"); setTime("ASAP"); setTransition("screen-out"); later(() => setTransition(""), motionDelay(220)) }

  const landingMode = !checkout && !review && !confirmed
  const appClass = `${darkMode ? "app dark" : "app"} ${transition} ${landingMode ? "landing-page" : ""}`
  const cartView = <CartView coffees={coffees} cart={cart} cartTemps={cartTemps} cartSizes={cartSizes} cartNotes={cartNotes} cupCount={cupCount} itemCount={itemCount} total={total} swipedItem={swipedItem} setSwipedItem={setSwipedItem} removeItem={removeItem} updateQuantity={updateQuantity} itemPrice={itemPrice} />
  const checkoutView = <CheckoutView day={day} setDay={setDay} time={time} setTime={setTime} name={name} setName={(value) => { setName(value); if (value.trim()) setInvalid(0) }} invalid={invalid} payment={payment} setPayment={setPayment} onSubmit={requestOrderConfirmation} loading={loading} darkMode={darkMode} />
  if (confirmed) return <div ref={appRef} className={appClass}><GlassRefractionDefs /><OrderSuccess amount={total} items={itemCount} onRestart={restart} name={name.trim()} payment={payment} cart={cart} pickup={day === "Today" && time === "ASAP" ? "ASAP · Today" : time || day} /></div>
  return (
    <div ref={appRef} className={appClass}>
      <GlassRefractionDefs />
      <AppHeader headerRef={headerRef} checkout={checkout} review={review} darkMode={darkMode} scrolled={scrolled} titleCollapsed={titleCollapsed} itemCount={itemCount} loading={loading} onBack={() => navigate(review ? "cart" : "menu")} onRestart={restart} onCart={() => navigate("cart")} onTheme={() => setDarkMode((value) => !value)} />
      <main className={`main-content ${transition}`}>
        {!checkout ? (
          <>
            <CompanyHero menuRef={menuRef} heroRef={heroRef} products={coffees} />
            <section className="menu-page" aria-label="Order menu">
              <MenuSection products={coffees} cart={cart} onAdd={openSheet} menuRef={menuRef} />
            </section>
          </>
        ) : (
          <div className={`checkout-page ${review ? "review-mode" : ""}`}>
            <div className="checkout-cart-column">{cartView}</div>
            <div className="checkout-details-column">{checkoutView}</div>
          </div>
        )}
      </main>
      <CheckoutFooter checkout={checkout} review={review} loading={loading} total={total} day={day} time={time} pickupClosed={time === "Closed"} onReview={() => navigate("review")} onSubmit={() => requestOrderConfirmation()} />
      {confirmOrderOpen && (
        <ConfirmOrderModal
          coffees={coffees}
          cart={cart}
          cartTemps={cartTemps}
          cartSizes={cartSizes}
          cartNotes={cartNotes}
          name={name.trim()}
          payment={payment}
          day={day}
          time={time}
          total={total}
          loading={loading}
          darkMode={darkMode}
          itemPrice={itemPrice}
          onClose={() => setConfirmOrderOpen(false)}
          onConfirm={() => submit()}
        />
      )}
      {!checkout && <AppFooter footerRef={footerRef} itemCount={itemCount} cupCount={cupCount} total={total} limit={limit} barHidden={barHidden} loading={loading} onCheckout={() => navigate("cart")} />}
      <BottomSheetHost coffee={activeCoffee} max={activeCoffee?.category === "pastry" ? 99 : 5 - cupCount + (activeCoffee ? cart[activeCoffee.id] || 0 : 0)} existing={activeCoffee ? cart[activeCoffee.id] || 0 : 0} closing={closing} onLimit={showLimit} onAdd={addToCart} onClose={closeSheet} quantity={sheetQuantity} setQuantity={setSheetQuantity} temp={sheetTemp} setTemp={setSheetTemp} size={sheetSize} setSize={setSheetSize} note={sheetNote} setNote={setSheetNote} />
    </div>
  )
}