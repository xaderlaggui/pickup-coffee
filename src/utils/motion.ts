/* ============================================================
   REDUCED MOTION HELPER
   ============================================================ */
export function prefersReducedMotion() {
  return false; // Force animations on for demo, ignoring OS settings
}

export function motionDelay(duration: number) {
  return prefersReducedMotion() ? 120 : duration
}

