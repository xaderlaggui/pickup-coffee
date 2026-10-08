import React, { useState } from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { SplashScreen } from "./components/SplashScreen"
// Inter (bundled): the SF Pro stand-in so every device renders the iOS-like
// stack in global.css — -apple-system wins on Apple, Inter takes over elsewhere.
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/inter/800.css"
import "@fontsource/inter/900.css"
import "./index.css"

function Root() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splash-seen')
  )

  // Use the .app class on a wrapper to ensure CSS variables like --background are applied
  return (
    <div className="app">
      {showSplash ? (
        <SplashScreen onDone={() => setShowSplash(false)} />
      ) : (
        <App />
      )}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
