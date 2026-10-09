import { useEffect, type RefObject } from "react"

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

/**
 * Keeps keyboard focus inside a dialog while it is open: moves focus to the
 * first control on open, cycles Tab/Shift+Tab within the container, and
 * restores the previously focused element on close.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active = true,
) {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0)

    const initial = focusables()[0] ?? container
    if (initial === container) container.setAttribute("tabindex", "-1")
    initial.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement as HTMLElement | null
      const inside = current !== null && container.contains(current)

      if (!inside || !items.includes(current as HTMLElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [containerRef, active])
}
