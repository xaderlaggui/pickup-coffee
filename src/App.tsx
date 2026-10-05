import { useRef, useState } from "react"
import { coffees } from "./data"
import type { Coffee, CoffeeSize } from "./types"
import { itemPrice } from "./utils/cart"
import { motionDelay } from "./utils/motion"
import { useCart } from "./hooks/useCart"
import { useNavigation } from "./hooks/useNavigation"
import { useScrollTracking } from "./hooks/useScrollTracking"
import { GlassRefractionDefs } from "./components/GlassRefractionDefs"
import { AppHeader } from "./components/AppHeader"
import { AppFooter } from "./components/AppFooter"
import { CheckoutFooter } from "./components/CheckoutFooter"
import { BottomSheetHost } from "./components/BottomSheetHost"
import { CompanyHero } from "./components/CompanyHero"
import { MenuSection } from "./components/MenuSection"
import { CartView } from "./components/CartView"
import { PairWith } from "./components/PairWith"
import { CheckoutView } from "./components/CheckoutView"
import { ConfirmOrderModal } from "./components/ConfirmOrderModal"
import { OrderSuccess } from "./components/OrderSuccess"

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  // Sheet state
  const [activeCoffee, setActiveCoffee] = useState<Coffee | null>(null)
  const [sheetQuantity, setSheetQuantity] = useState(1)
  const [sheetTemp, setSheetTemp] = useState<"Iced" | "Hot">("Iced")
  const [sheetSize, setSheetSize] = useState<CoffeeSize>("Medium")
  const [sheetNote, setSheetNote] = useState("")
  const [closing, setClosing] = useState(false)

  // Order state
  const [confirmOrderOpen, setConfirmOrderOpen] = useState(false)
  const [day, setDay] = useState<"Today" | "Tomorrow">("Today")
  const [time, setTime] = useState("ASAP")
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [payment, setPayment] = useState("Cash at pickup")
  const [loading, setLoading] = useState(false)
  const [invalid, setInvalid] = useState(0)

  // Swipe UI state
  const [swipedItem, setSwipedItem] = useState<number | null>(null)

  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLElement>(null)

  const cart = useCart(coffees)
  const nav = useNavigation()
  const scroll = useScrollTracking()

  // ---- Sheet ----
  const closeSheet = () => {
    if (closing) return
    setClosing(true)
    nav.later(() => {
      setActiveCoffee(null)
      setClosing(false)
    }, motionDelay(380))
  }

  const openSheet = (coffee: Coffee) => {
    setClosing(false)
    setActiveCoffee(coffee)
    setSheetQuantity(
      cart.cart[coffee.id] ||
        (coffee.category === "pastry" || cart.cups < 5 ? 1 : 0),
    )
    setSheetTemp(cart.cartTemps[coffee.id] || "Iced")
    setSheetSize("Medium")
    setSheetNote(cart.cartNotes[coffee.id] || "")
  }

  const addToCart = () => {
    if (!activeCoffee || closing) return
    const coffee = activeCoffee
    nav.later(() => {
      cart.setCartItem(
        coffee.id,
        Math.min(
          sheetQuantity,
          coffee.category === "pastry"
            ? 99
            : 5 - cart.cups + (cart.cart[coffee.id] || 0),
        ),
        sheetTemp,
        sheetSize,
        sheetNote,
      )
    }, motionDelay(380))
    closeSheet()
  }

  // ---- Order ----
  const requestOrderConfirmation = (event?: React.FormEvent) => {
    event?.preventDefault()
    if (time === "Closed") return
    if (!name.trim() || loading || cart.items === 0) {
      if (!name.trim()) setInvalid((v) => v + 1)
      return
    }
    setConfirmOrderOpen(true)
  }

  const submit = () => {
    if (time === "Closed" || !name.trim() || loading || cart.items === 0) return
    setLoading(true)
    nav.later(() => {
      nav.setConfirmed(true)
      setLoading(false)
    }, 600)
  }

  const restart = () => {
    cart.resetCart()
    nav.setConfirmed(false)
    nav.setCheckout(false)
    setConfirmOrderOpen(false)
    setName("")
    setContact("")
    setDay("Today")
    setTime("ASAP")
    nav.setTransition("screen-out")
    nav.later(() => nav.setTransition(""), motionDelay(220))
  }

  // ---- Derived ----
  const landingMode = !nav.checkout && !nav.confirmed
  const appClass = [
    "app",
    darkMode ? "dark" : "",
    nav.transition,
    landingMode ? "landing-page" : "",
  ]
    .filter(Boolean)
    .join(" ")

  const cartViewEl = (
    <CartView
      coffees={coffees}
      cart={cart.cart}
      cartTemps={cart.cartTemps}
      cartSizes={cart.cartSizes}
      cartNotes={cart.cartNotes}
      cupCount={cart.cups}
      itemCount={cart.items}
      total={cart.total}
      swipedItem={swipedItem}
      setSwipedItem={setSwipedItem}
      removeItem={cart.removeItem}
      updateQuantity={cart.updateQuantity}
      itemPrice={itemPrice}
    />
  )

  const checkoutViewEl = (
    <CheckoutView
      day={day}
      setDay={setDay}
      time={time}
      setTime={setTime}
      name={name}
      setName={(value) => {
        setName(value)
        if (value.trim()) setInvalid(0)
      }}
      contact={contact}
      setContact={setContact}
      invalid={invalid}
      payment={payment}
      setPayment={setPayment}
      onSubmit={requestOrderConfirmation}
      loading={loading}
      darkMode={darkMode}
    />
  )

  if (nav.confirmed) {
    return (
      <div ref={nav.appRef} className={appClass}>
        <GlassRefractionDefs />
        <OrderSuccess
          amount={cart.total}
          items={cart.items}
          onRestart={restart}
          name={name.trim()}
          contact={contact}
          payment={payment}
          cart={cart.cart}
          pickup={
            day === "Today" && time === "ASAP" ? "ASAP · Today" : time || day
          }
        />
      </div>
    )
  }

  return (
    <div ref={nav.appRef} className={appClass}>
      <GlassRefractionDefs />
      <AppHeader
        headerRef={headerRef}
        checkout={nav.checkout}
        darkMode={darkMode}
        scrolled={scroll.scrolled}
        titleCollapsed={scroll.titleCollapsed}
        itemCount={cart.items}
        loading={loading}
        onBack={() => nav.navigate("menu")}
        onRestart={restart}
        onCart={() => nav.navigate("cart")}
        onTheme={() => setDarkMode((v) => !v)}
      />
      <main
        className={`main-content ${nav.transition}${
          nav.checkout ? " checkout-page-active" : ""
        }`}
      >
        {!nav.checkout ? (
          <>
            <CompanyHero
              menuRef={menuRef}
              heroRef={scroll.heroRef}
              products={coffees}
            />
            <section className="menu-page" aria-label="Order menu">
              <MenuSection
                products={coffees}
                cart={cart.cart}
                onAdd={openSheet}
                menuRef={menuRef}
              />
            </section>
          </>
        ) : (
          <div className="checkout-page">
            <div className="checkout-cart-column">
              <h2 className="checkout-section-title checkout-item-title">
                Item
              </h2>
              {cartViewEl}
              <PairWith
                products={coffees}
                cart={cart.cart}
                onAdd={(coffee) => cart.updateQuantity(coffee.id, 1)}
              />
            </div>
            <div className="checkout-details-column">{checkoutViewEl}</div>
          </div>
        )}
      </main>
      <CheckoutFooter
        checkout={nav.checkout}
        loading={loading}
        total={cart.total}
        pickupClosed={time === "Closed"}
        hasItems={cart.items > 0}
        onSubmit={requestOrderConfirmation}
      />
      {confirmOrderOpen && (
        <ConfirmOrderModal
          coffees={coffees}
          cart={cart.cart}
          cartTemps={cart.cartTemps}
          cartSizes={cart.cartSizes}
          cartNotes={cart.cartNotes}
          name={name.trim()}
          contact={contact.trim()}
          payment={payment}
          day={day}
          time={time}
          total={cart.total}
          loading={loading}
          darkMode={darkMode}
          itemPrice={itemPrice}
          onClose={() => setConfirmOrderOpen(false)}
          onConfirm={submit}
        />
      )}
      {!nav.checkout && (
        <AppFooter
          footerRef={scroll.footerRef}
          itemCount={cart.items}
          cupCount={cart.cups}
          total={cart.total}
          limit={cart.limit}
          barHidden={scroll.barHidden}
          loading={loading}
          onCheckout={() => nav.navigate("cart")}
        />
      )}
      <BottomSheetHost
        coffee={activeCoffee}
        max={
          activeCoffee?.category === "pastry"
            ? 99
            : 5 -
              cart.cups +
              (activeCoffee ? cart.cart[activeCoffee.id] || 0 : 0)
        }
        existing={activeCoffee ? cart.cart[activeCoffee.id] || 0 : 0}
        closing={closing}
        onLimit={cart.showLimit}
        onAdd={addToCart}
        onClose={closeSheet}
        quantity={sheetQuantity}
        setQuantity={setSheetQuantity}
        temp={sheetTemp}
        setTemp={setSheetTemp}
        size={sheetSize}
        setSize={setSheetSize}
        note={sheetNote}
        setNote={setSheetNote}
      />
    </div>
  )
}
