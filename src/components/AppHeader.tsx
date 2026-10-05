import { RefObject } from "react"
import { CartIcon, ChevronLeftIcon, MoonIcon, SunIcon } from "./Icons"

export function AppHeader({ headerRef, checkout, darkMode, scrolled, titleCollapsed, itemCount, loading, onBack, onRestart, onCart, onTheme }: {
  headerRef: RefObject<HTMLElement | null>; checkout: boolean; darkMode: boolean; scrolled: boolean; titleCollapsed: boolean; itemCount: number; loading: boolean; onBack: () => void; onRestart: () => void; onCart: () => void; onTheme: () => void
}) {
  return (
    <header ref={headerRef} className={`top-header ${scrolled ? "scrolled" : ""} ${titleCollapsed ? "title-collapsed" : ""}`}>
      <div className="header-inner" style={checkout ? { display: "grid", gridTemplateColumns: "1fr auto 1fr" } : {}}>
        {checkout && <div style={{ display: "flex", justifyContent: "flex-start" }}><button className="back-button back-icon-only" onClick={onBack} aria-label="Go back"><ChevronLeftIcon /></button></div>}
        <button className="wordmark" onClick={onRestart} type="button" style={checkout ? { textAlign: "center", justifySelf: "center", gridColumn: 2 } : {}}>
          {!checkout ? <>PICKUP<br />COFFEE</> : <>COFFEE<br />CHECKOUT</>}
        </button>
        <div className="header-actions" style={checkout ? { justifySelf: "end", gridColumn: 3 } : {}}>
          {itemCount > 0 && !checkout && <button className="desktop-cart-button" onClick={onCart} type="button" disabled={loading} aria-busy={loading}>{loading ? <span className="loading-dots"><i /><i /><i /></span> : <><CartIcon /><span className="cart-badge">{itemCount}</span></>}</button>}
          <button aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`} className="theme-toggle" onClick={onTheme} type="button"><span className={`theme-icon ${darkMode ? "visible" : "hidden-icon"}`}><SunIcon /></span><span className={`theme-icon ${darkMode ? "hidden-icon" : "visible"}`}><MoonIcon /></span></button>
        </div>
      </div>
    </header>
  )
}