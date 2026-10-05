/* ============================================================
   REDUCED MOTION HELPER
   ============================================================ */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function motionDelay(duration: number) {
  return prefersReducedMotion() ? 0 : duration
}
