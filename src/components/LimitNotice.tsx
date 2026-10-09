import { MAX_CUPS } from "../utils/cart"

/* ============================================================
   LIMIT NOTICE — transient toast shown the moment the drink
   order reaches the 5-cup cap (see useCart's reachedCupLimit).
   ============================================================ */
export function LimitNotice({
  message = `You've reached the ${MAX_CUPS}-cup limit.`,
}: {
  message?: string
}) {
  return (
    <div className="limit-notice" role="status" aria-live="polite">
      <span className="limit-notice-badge" aria-hidden="true">
        {MAX_CUPS}
      </span>
      <span className="limit-notice-text">{message}</span>
    </div>
  )
}
