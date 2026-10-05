import { useEffect, useState } from "react"

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), 1760)
    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem('splash-seen', '1')
      onDone()
    }, 2000)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div className={`splash-screen ${isExiting ? "splash-exit" : "splash-enter"}`}>
      <div className="splash-content-wrapper">
        <div className="splash-view animate-in">
          <div className="splash-logo-large">
            PICKUP<br />
            COFFEE
          </div>
          <h2 className="splash-title">Great coffee.<br />Ready when you are.</h2>
          <p className="splash-body">Experience the fastest way to get your daily brew.</p>
        </div>
      </div>
    </div>
  )
}
