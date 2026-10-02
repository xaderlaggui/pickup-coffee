import { useState, useRef, useCallback } from "react";
import { MENU_ITEMS, MenuItem } from "./config";
import { AppScreen, Cart, ValidationErrors } from "./types";
import { useCart } from "./hooks/useCart";
import { useTheme } from "./hooks/useTheme";
import { usePickupSlots } from "./hooks/usePickupSlots";
import { buildOrderPayload, submitOrder } from "./lib/order";
import { formatPrice } from "./lib/format";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import { MenuGrid } from "./components/CoffeeCard";
import BottomSheet from "./components/BottomSheet";
import SchedulePickup from "./components/SchedulePickup";
import OrderBar from "./components/OrderBar";
import OrderSuccess from "./components/OrderSuccess";
import { ChevronLeftIcon } from "./components/icons";

// Session storage key to show welcome once per session
const WELCOME_KEY = "pc-welcomed";

function hasSeenWelcome(): boolean {
  try {
    return sessionStorage.getItem(WELCOME_KEY) === "true";
  } catch {
    return false;
  }
}

function markWelcomeSeen(): void {
  try {
    sessionStorage.setItem(WELCOME_KEY, "true");
  } catch {/* noop */}
}

export default function App() {
  const { resolved: theme, toggle: toggleTheme } = useTheme();

  // Screen state
  const [screen, setScreen] = useState<AppScreen>(
    hasSeenWelcome() ? "menu" : "welcome"
  );
  const [welcomeExiting, setWelcomeExiting] = useState(false);

  // Cart
  const {
    cart,
    cartItems,
    totalQuantity,
    totalAmount,
    maxForItem,
    setItemQuantity,
    clearCart,
  } = useCart();

  // Bottom sheet
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [sheetQuantity, setSheetQuantity] = useState(0);
  const sheetTriggerRef = useRef<string | null>(null);

  // Pickup
  const {
    day,
    setDay,
    slots,
    selectedSlot,
    setSelectedSlot,
    expiredNotice,
    todayClosed,
    isTodayClosed,
  } = usePickupSlots();

  // Checkout form state
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash at pickup" | "Card at pickup"
  >("Cash at pickup");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedCart, setConfirmedCart] = useState<Cart | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  // Welcome -> menu transition
  const handleStartOrder = useCallback(() => {
    setWelcomeExiting(true);
    markWelcomeSeen();
    setTimeout(() => {
      setScreen("menu");
      setWelcomeExiting(false);
    }, 480);
  }, []);

  // Open item detail sheet
  const openSheet = useCallback(
    (item: MenuItem) => {
      setActiveItem(item);
      const existing = cart[item.id] ?? 0;
      setSheetQuantity(existing > 0 ? existing : Math.min(1, maxForItem(item.id)));
      sheetTriggerRef.current = item.id;
    },
    [cart, maxForItem]
  );

  const closeSheet = useCallback(() => {
    setActiveItem(null);
    setSheetQuantity(0);
  }, []);

  const confirmSheetQuantity = useCallback(() => {
    if (!activeItem) return;
    setItemQuantity(activeItem.id, sheetQuantity);
    closeSheet();
  }, [activeItem, sheetQuantity, setItemQuantity, closeSheet]);

  // Navigate to checkout
  const goToCheckout = useCallback(() => {
    setScreen("checkout");
    window.history.pushState({ screen: "checkout" }, "");
  }, []);

  // Navigate back to menu
  const goToMenu = useCallback(() => {
    setScreen("menu");
    if (window.history.state?.screen === "checkout") {
      window.history.back();
    }
  }, []);

  // Validate checkout form
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    if (!customerName.trim()) {
      newErrors.name = "Please enter your name for pickup.";
    }
    if (!selectedSlot) {
      newErrors.slot = "Please select a pickup time.";
    }
    setErrors(newErrors);
    if (newErrors.name) {
      nameInputRef.current?.focus();
      return false;
    }
    return Object.keys(newErrors).length === 0;
  }, [customerName, selectedSlot]);

  // Submit order
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      if (!validate()) return;
      if (!selectedSlot) return;

      // Re-validate slot freshness before submit
      if (slots.length === 0 || !slots.find((s) => s.id === selectedSlot.id)) {
        setErrors((prev) => ({
          ...prev,
          slot:
            "Your pickup time is no longer available. Please select a new time.",
        }));
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const payload = buildOrderPayload(
          cart,
          selectedSlot,
          day,
          customerName,
          paymentMethod
        );
        const response = await submitOrder(payload);

        // Save snapshot for confirmation screen
        setConfirmedOrderId(response.orderId);
        setConfirmedCart({ ...cart } as Cart);
        setConfirmedTotal(totalAmount);
        setScreen("confirmation");
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      validate,
      selectedSlot,
      slots,
      cart,
      day,
      customerName,
      paymentMethod,
      totalAmount,
    ]
  );

  // Full reset
  const handleRestart = useCallback(() => {
    clearCart();
    setCustomerName("");
    setPaymentMethod("Cash at pickup");
    setErrors({});
    setSubmitError(null);
    setConfirmedOrderId(null);
    setConfirmedCart(null);
    setConfirmedTotal(0);
    setScreen("menu");
    window.history.pushState({ screen: "menu" }, "");
  }, [clearCart]);

  // Handle browser back
  // (simple: popstate just goes back to menu from checkout)
  // useEffect(() => {
  //   const handler = () => { if (screen === "checkout") setScreen("menu"); };
  //   window.addEventListener("popstate", handler);
  //   return () => window.removeEventListener("popstate", handler);
  // }, [screen]);

  // ---- Render ----

  if (screen === "confirmation" && confirmedOrderId && confirmedCart) {
    return (
      <div className="app-root" data-theme={theme}>
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogoClick={handleRestart}
        />
        <OrderSuccess
          orderId={confirmedOrderId}
          cartItems={cartItems.length > 0 ? cartItems : Object.entries(confirmedCart)
            .filter(([, q]) => q > 0)
            .map(([id, quantity]) => ({ id: id as typeof cartItems[number]["id"], quantity }))}
          totalAmount={confirmedTotal}
          selectedSlot={selectedSlot!}
          day={day}
          customerName={customerName}
          paymentMethod={paymentMethod}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* Welcome overlay */}
      {(screen === "welcome" || welcomeExiting) && (
        <WelcomeScreen onStart={handleStartOrder} isExiting={welcomeExiting} />
      )}

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogoClick={screen === "checkout" ? goToMenu : () => {}}
      />

      <main className="main-content" id="main-content" tabIndex={-1}>
        <div className="page-container">

          {screen === "menu" && (
            <>
              {/* Hero */}
              <div className="hero-copy">
                <p className="eyebrow hero-eyebrow">Skip the line</p>
                <h1 className="hero-title">
                  Great coffee.<br />Ready when you are.
                </h1>
                <p className="hero-subtitle">
                  Pick your favorites and we will take care of the rest.
                </p>
              </div>

              <MenuGrid
                items={MENU_ITEMS}
                cart={cart}
                totalQuantity={totalQuantity}
                onOpenItem={openSheet}
              />
            </>
          )}

          {screen === "checkout" && (
            <form id="checkout-form" onSubmit={handleSubmit} noValidate>
              {/* Back */}
              <button
                type="button"
                className="back-btn"
                onClick={goToMenu}
              >
                <ChevronLeftIcon />
                Back to menu
              </button>

              {/* Hero */}
              <div className="hero-copy">
                <p className="eyebrow hero-eyebrow">Almost there</p>
                <h1 className="hero-title">Checkout</h1>
                <p className="hero-subtitle">
                  A few details, then we will get brewing.
                </p>
              </div>

              {submitError && (
                <div
                  role="alert"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-control)",
                    background: "#fdecea",
                    color: "#c0392b",
                    fontSize: "var(--text-callout)",
                    fontWeight: 600,
                    marginBottom: "var(--space-5)",
                  }}
                >
                  {submitError}
                </div>
              )}

              <div className="checkout-layout">
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>

                  {/* Order summary */}
                  <div className="section-card">
                    <h2 className="section-card-title">
                      Your order
                      <span className="cup-count num">
                        {totalQuantity} / 5 cups
                      </span>
                    </h2>

                    {cartItems.length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-callout)" }}>
                        Your order is empty.{" "}
                        <button
                          type="button"
                          onClick={goToMenu}
                          style={{ color: "var(--green)", fontWeight: 700 }}
                        >
                          Add items
                        </button>
                      </p>
                    ) : (
                      <>
                        {cartItems.map((ci) => {
                          const meta = MENU_ITEMS.find((m) => m.id === ci.id)!;
                          return (
                            <div key={ci.id} className="cart-item">
                              <div className="cart-item-info">
                                <p className="cart-item-name">{meta.name}</p>
                                <p className="cart-item-qty num">
                                  {formatPrice(meta.price)} each
                                </p>
                              </div>
                              {/* Inline stepper */}
                              <div className="cart-item-stepper">
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  aria-label={`Remove one ${meta.name}`}
                                  disabled={ci.quantity <= 0}
                                  onClick={() =>
                                    setItemQuantity(ci.id, ci.quantity - 1)
                                  }
                                >
                                  <span aria-hidden="true">−</span>
                                </button>
                                <span className="stepper-value num" aria-live="polite">
                                  {ci.quantity}
                                </span>
                                <button
                                  type="button"
                                  className="stepper-btn"
                                  aria-label={`Add one more ${meta.name}`}
                                  disabled={maxForItem(ci.id) <= ci.quantity}
                                  onClick={() =>
                                    setItemQuantity(ci.id, ci.quantity + 1)
                                  }
                                >
                                  <span aria-hidden="true">+</span>
                                </button>
                              </div>
                              <span className="cart-item-price num">
                                {formatPrice(meta.price * ci.quantity)}
                              </span>
                            </div>
                          );
                        })}
                        <div className="cart-total-row">
                          <span>Total</span>
                          <span className="num">{formatPrice(totalAmount)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Schedule */}
                  <SchedulePickup
                    day={day}
                    setDay={setDay}
                    slots={slots}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    expiredNotice={expiredNotice}
                    todayClosed={todayClosed}
                    isTodayClosed={isTodayClosed}
                  />
                  {errors.slot && (
                    <p
                      className="form-error"
                      role="alert"
                      style={{ marginTop: "-var(--space-3)" }}
                    >
                      {errors.slot}
                    </p>
                  )}
                </div>

                {/* Right column */}
                <div className="checkout-sticky">
                  <div className="section-card">
                    <h2 className="section-card-title">Your details</h2>

                    {/* Name */}
                    <div className="form-field" style={{ marginBottom: "var(--space-5)" }}>
                      <label className="form-label" htmlFor="pickup-name">
                        Name for pickup
                      </label>
                      <input
                        ref={nameInputRef}
                        id="pickup-name"
                        className={`form-input${errors.name ? " error" : ""}`}
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your name"
                        maxLength={80}
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        onBlur={() => {
                          if (!customerName.trim()) {
                            setErrors((prev) => ({
                              ...prev,
                              name: "Please enter your name for pickup.",
                            }));
                          }
                        }}
                        aria-required="true"
                        aria-describedby={errors.name ? "name-error" : undefined}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p id="name-error" className="form-error" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Payment */}
                    <fieldset style={{ border: "none" }}>
                      <legend className="form-label" style={{ marginBottom: "var(--space-2)" }}>
                        Payment method
                      </legend>
                      <p
                        style={{
                          fontSize: "var(--text-footnote)",
                          color: "var(--text-secondary)",
                          marginBottom: "var(--space-3)",
                        }}
                      >
                        Pay at the counter when you pick up your coffee.
                      </p>
                      <div
                        className="payment-options"
                        role="radiogroup"
                        aria-label="Payment method"
                      >
                        {(
                          ["Cash at pickup", "Card at pickup"] as const
                        ).map((option) => (
                          <label
                            key={option}
                            className={`payment-option${paymentMethod === option ? " selected" : ""}`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={option}
                              checked={paymentMethod === option}
                              onChange={() => setPaymentMethod(option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Order bar (menu + checkout) */}
      {(screen === "menu" || screen === "checkout") && (
        <OrderBar
          totalQuantity={totalQuantity}
          totalAmount={totalAmount}
          cartItems={cartItems}
          onCheckout={goToCheckout}
          isCheckout={screen === "checkout"}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Bottom sheet */}
      {activeItem && (
        <BottomSheet
          item={activeItem}
          quantity={sheetQuantity}
          maxQuantity={maxForItem(activeItem.id)}
          onSetQuantity={setSheetQuantity}
          onConfirm={confirmSheetQuantity}
          onClose={closeSheet}
          existingQuantity={cart[activeItem.id] ?? 0}
        />
      )}
    </div>
  );
}
