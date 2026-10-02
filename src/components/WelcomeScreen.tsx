import { useEffect, useRef } from "react";
import { getStoreStatusLabel, isStoreOpen } from "../lib/slots";

interface WelcomeScreenProps {
  onStart: () => void;
  isExiting: boolean;
}

export default function WelcomeScreen({ onStart, isExiting }: WelcomeScreenProps) {
  const startBtnRef = useRef<HTMLButtonElement>(null);
  const now = new Date();
  const storeOpen = isStoreOpen(now);
  const statusLabel = getStoreStatusLabel(now);

  // Focus the start button on mount
  useEffect(() => {
    startBtnRef.current?.focus();
  }, []);

  return (
    <div
      className={`welcome-screen${isExiting ? " exit" : ""}`}
      aria-label="Welcome to Pickup Coffee"
    >
      <div className="welcome-content">
        {/* Logo lockup */}
        <div className="welcome-logo" aria-hidden="true">
          <span className="welcome-logo-mark">Pickup</span>
          <span className="welcome-logo-sub">Coffee</span>
        </div>

        {/* Headline */}
        <h1 className="welcome-headline">
          Welcome to<br />Pickup Coffee
        </h1>

        {/* Subtitle */}
        <p className="welcome-subtitle">Order ahead and skip the line.</p>

        {/* Store status */}
        <div className="welcome-status" aria-live="polite">
          <span
            className={`welcome-status-dot${storeOpen ? "" : " closed"}`}
            aria-hidden="true"
          />
          {statusLabel}
        </div>

        {/* CTA */}
        <div className="welcome-cta">
          <button
            ref={startBtnRef}
            type="button"
            className="welcome-btn"
            onClick={onStart}
            aria-label="Start your order"
          >
            Start order
          </button>
        </div>
      </div>
    </div>
  );
}
