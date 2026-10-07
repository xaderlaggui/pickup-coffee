/**
 * "Added to cart" animation - WEB ONLY.
 *
 *   1. the product image from the item sheet floats along a soft arc to the cart button
 *   2. on landing, the cart button shakes a little (CSS: styles/cart-add-animation.desktop.css)
 *
 * Does nothing on phones (< 721px wide) or when the visitor prefers reduced motion.
 */

const WEB = "(min-width: 721px)"
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
const FLY_MS = 720

function shakeCart() {
  const button = document.querySelector<HTMLElement>(".desktop-cart-button")
  if (!button) return

  button.classList.remove("cart-shake")
  void button.offsetWidth // restart the animation if it is already running
  button.classList.add("cart-shake")

  const onEnd = (event: AnimationEvent) => {
    if (event.animationName !== "cart-shake") return
    button.classList.remove("cart-shake")
    button.removeEventListener("animationend", onEnd)
  }
  button.addEventListener("animationend", onEnd)
}

export function playAddToCartAnimation() {
  if (typeof window === "undefined") return
  if (!window.matchMedia(WEB).matches) return
  if (window.matchMedia(REDUCED_MOTION).matches) return

  const source = document.querySelector<HTMLImageElement>(".bottom-sheet .sheet-hero-img")
  const cartButton = document.querySelector<HTMLElement>(".desktop-cart-button")
  const actions = document.querySelector<HTMLElement>(".header-actions")

  // No image to float (or no header): just shake once the cart has updated.
  if (!source || (!cartButton && !actions)) {
    window.setTimeout(shakeCart, 450)
    return
  }

  const from = source.getBoundingClientRect()

  // Where to land. For the very first item the cart button does not exist yet, so aim
  // at the spot just left of the theme toggle, where it is about to appear.
  let toX: number
  let toY: number
  if (cartButton) {
    const rect = cartButton.getBoundingClientRect()
    toX = rect.left + rect.width / 2
    toY = rect.top + rect.height / 2
  } else {
    const rect = actions!.getBoundingClientRect()
    toX = rect.right - 107
    toY = rect.top + rect.height / 2
  }

  const clone = source.cloneNode(false) as HTMLImageElement
  clone.className = ""
  clone.alt = ""
  clone.setAttribute("aria-hidden", "true")
  Object.assign(clone.style, {
    position: "fixed",
    left: from.left + "px",
    top: from.top + "px",
    width: from.width + "px",
    height: from.height + "px",
    margin: "0",
    objectFit: "contain",
    pointerEvents: "none",
    zIndex: "2147483000",
    transformOrigin: "50% 50%",
    willChange: "transform, opacity",
    filter: "drop-shadow(0 12px 16px rgba(0, 0, 0, 0.25))",
  })
  document.body.appendChild(clone)

  const dx = toX - (from.left + from.width / 2)
  const dy = toY - (from.top + from.height / 2)
  const endScale = Math.max(0.1, 30 / Math.max(from.width, from.height))
  const midScale = (1 + endScale) / 2

  const animation = clone.animate(
    [
      { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1 },
      {
        // float up first, then curve toward the cart
        transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 70}px) scale(${midScale}) rotate(-8deg)`,
        opacity: 1,
        offset: 0.4,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(${endScale}) rotate(10deg)`, opacity: 0.35 },
    ],
    { duration: FLY_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
  )

  animation.onfinish = () => {
    clone.remove()
    shakeCart()
  }
  animation.oncancel = () => clone.remove()
}
