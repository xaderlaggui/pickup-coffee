import React, { useState } from "react"
import { MenuIcon, PlusCircleIcon, ReceiptIcon, BagIcon } from "./Icons"

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      sessionStorage.setItem('splash-seen', '1')
      setIsExiting(true)
      setTimeout(onDone, 400)
    }
  }

  return (
    <div className={`splash-screen ${isExiting ? "splash-exit" : "splash-enter"}`}>
      <div className="splash-content-wrapper">
        {step === 0 && (
          <div className="splash-view animate-in">
            <div className="splash-logo-large">
              PICKUP<br />
              COFFEE
            </div>
            <h2 className="splash-title">Great coffee.<br/>Ready when you are.</h2>
            <p className="splash-body">Experience the fastest way to get your daily brew.</p>
          </div>
        )}

        {step === 1 && (
          <div className="splash-view animate-in">
            <h2 className="splash-title">How it works</h2>
            <div className="splash-timeline">
              <div className="splash-timeline-item">
                <div className="splash-timeline-icon"><MenuIcon /></div>
                <span>1. Browse</span>
              </div>
              <div className="splash-timeline-line" />
              <div className="splash-timeline-item">
                <div className="splash-timeline-icon"><PlusCircleIcon /></div>
                <span>2. Add</span>
              </div>
              <div className="splash-timeline-line" />
              <div className="splash-timeline-item">
                <div className="splash-timeline-icon"><ReceiptIcon /></div>
                <span>3. Pay</span>
              </div>
              <div className="splash-timeline-line" />
              <div className="splash-timeline-item">
                <div className="splash-timeline-icon"><BagIcon /></div>
                <span>4. Pickup</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="splash-view animate-in">
            <div className="splash-coffee-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" x2="6" y1="2" y2="4" />
                <line x1="10" x2="10" y1="2" y2="4" />
                <line x1="14" x2="14" y1="2" y2="4" />
              </svg>
            </div>
            <h2 className="splash-title">Enjoy your freshly brewed coffee!</h2>
            <p className="splash-body">We'll start your order now.</p>
          </div>
        )}
      </div>

      <div className="splash-footer">
        <div className="splash-dots">
          <span className={`splash-dot ${step === 0 ? "active" : ""}`} />
          <span className={`splash-dot ${step === 1 ? "active" : ""}`} />
          <span className={`splash-dot ${step === 2 ? "active" : ""}`} />
        </div>
        <button type="button" className="primary-button splash-next" onClick={handleNext}>
          {step === 2 ? "Start Order" : "Next"}
        </button>
      </div>
    </div>
  )
}
